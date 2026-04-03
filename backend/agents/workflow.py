import logging
from typing import Any, TypedDict

from langgraph.graph import END, StateGraph

try:
    from backend.agents.prompts import SYSTEM_PROMPT
    from backend.core.config import get_settings
    from backend.database.collections import patients_collection, resources_collection
    from backend.database.neo4j_db import connect_neo4j
except ModuleNotFoundError:
    from agents.prompts import SYSTEM_PROMPT
    from core.config import get_settings
    from database.collections import patients_collection, resources_collection
    from database.neo4j_db import connect_neo4j

logger = logging.getLogger(__name__)


class WorkflowState(TypedDict, total=False):
    patients: list[dict[str, Any]]
    resources: dict[str, Any]
    graph_summary: dict[str, Any]
    risk_signals: dict[str, Any]
    plan: dict[str, Any]
    reflection: dict[str, Any]
    llm_output: str


def fetch_data(state: WorkflowState) -> WorkflowState:
    del state
    patients = list(patients_collection().find({}))
    resources = resources_collection().find_one({}) or {"icu_beds": 0, "doctors_available": 0}
    return {"patients": patients, "resources": resources}


def build_graph(state: WorkflowState) -> WorkflowState:
    driver = connect_neo4j()
    patients = state["patients"]

    with driver.session() as session:
        session.run("MERGE (:ICU {name: 'MainICU'})")
        for patient in patients:
            session.run(
                """
                MERGE (p:Patient {patient_id: $patient_id})
                SET p.name = $name,
                    p.age = $age,
                    p.severity = $severity,
                    p.icu_required = $icu_required,
                    p.status = $status
                MERGE (d:Disease {name: $disease})
                MERGE (p)-[:HAS_DISEASE]->(d)
                """,
                patient_id=str(patient["_id"]),
                name=patient["name"],
                age=patient["age"],
                severity=patient["severity"],
                icu_required=patient["icu_required"],
                status=patient["status"],
                disease=patient["disease"],
            )
            if patient["icu_required"]:
                session.run(
                    """
                    MATCH (p:Patient {patient_id: $patient_id})
                    MATCH (i:ICU {name: 'MainICU'})
                    MERGE (p)-[:REQUIRES_ICU]->(i)
                    """,
                    patient_id=str(patient["_id"]),
                )

        summary_result = session.run(
            """
            MATCH (p:Patient)
            OPTIONAL MATCH (p)-[:REQUIRES_ICU]->(:ICU)
            RETURN count(p) AS total_patients,
                   count(CASE WHEN p.status = 'admitted' THEN 1 END) AS admitted_patients,
                   count(CASE WHEN p.icu_required = true AND p.status = 'admitted' THEN 1 END) AS icu_need_admitted
            """
        ).single()

    graph_summary = {
        "total_patients": summary_result["total_patients"] if summary_result else 0,
        "admitted_patients": summary_result["admitted_patients"] if summary_result else 0,
        "icu_need_admitted": summary_result["icu_need_admitted"] if summary_result else 0,
    }
    return {"graph_summary": graph_summary}


def reasoning_agent(state: WorkflowState) -> WorkflowState:
    patients = state["patients"]
    resources = state["resources"]
    admitted = [p for p in patients if p["status"] == "admitted"]
    critical = [p for p in admitted if p["severity"] == "high" or p["icu_required"]]
    icu_demand = sum(1 for p in admitted if p["icu_required"])
    icu_beds = int(resources.get("icu_beds", 0))
    risk = "ICU_SHORTAGE" if icu_demand > icu_beds else "STABLE"
    return {
        "risk_signals": {
            "admitted_count": len(admitted),
            "critical_count": len(critical),
            "icu_demand": icu_demand,
            "icu_beds": icu_beds,
            "suggested_risk": risk,
            "critical_patients": [p["name"] for p in critical],
        }
    }


def planning_agent(state: WorkflowState) -> WorkflowState:
    signals = state["risk_signals"]
    actions: list[str] = []
    if signals["suggested_risk"] == "ICU_SHORTAGE":
        actions.extend(
            [
                "Reallocate ICU beds from low-risk wards immediately",
                "Escalate staffing and call additional ICU-trained doctors",
                "Prioritize high-severity admitted patients for ICU triage",
            ]
        )
    else:
        actions.extend(
            [
                "Maintain current allocation and continue hourly monitoring",
                "Prepare surge contingency if ICU demand rises",
            ]
        )
    return {"plan": {"actions": actions}}


def reflection_agent(state: WorkflowState) -> WorkflowState:
    signals = state["risk_signals"]
    plan = state["plan"]
    consistency_checks = {
        "has_actions": len(plan.get("actions", [])) > 0,
        "has_critical_list": isinstance(signals.get("critical_patients", []), list),
    }
    return {"reflection": consistency_checks}


def action_agent(state: WorkflowState) -> WorkflowState:
    from langchain_groq import ChatGroq

    settings = get_settings()
    llm = ChatGroq(
        api_key=settings.groq_api_key,
        model=settings.groq_model,
        temperature=0,
    )
    payload = {
        "patients": state["patients"],
        "resources": state["resources"],
        "graph_summary": state.get("graph_summary", {}),
        "risk_signals": state.get("risk_signals", {}),
        "plan": state.get("plan", {}),
        "reflection": state.get("reflection", {}),
    }
    message = f"{SYSTEM_PROMPT}\n\nInput data:\n{payload}"
    result = llm.invoke(message)
    content = getattr(result, "content", "")
    logger.info("Groq response received for action node")
    return {"llm_output": content if isinstance(content, str) else str(content)}


def build_workflow():
    graph = StateGraph(WorkflowState)
    graph.add_node("fetch_data", fetch_data)
    graph.add_node("build_graph", build_graph)
    graph.add_node("reasoning_agent", reasoning_agent)
    graph.add_node("planning_agent", planning_agent)
    graph.add_node("reflection_agent", reflection_agent)
    graph.add_node("action_agent", action_agent)

    graph.set_entry_point("fetch_data")
    graph.add_edge("fetch_data", "build_graph")
    graph.add_edge("build_graph", "reasoning_agent")
    graph.add_edge("reasoning_agent", "planning_agent")
    graph.add_edge("planning_agent", "reflection_agent")
    graph.add_edge("reflection_agent", "action_agent")
    graph.add_edge("action_agent", END)
    return graph.compile()
