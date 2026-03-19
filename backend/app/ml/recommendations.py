from __future__ import annotations

from typing import Dict, List


def generate_recommendations(features: Dict[str, float], prediction: Dict) -> List[Dict]:
    """
    Lightweight rules-based recommendations to complement ML predictions.
    Returns priority-ranked action items.
    """
    recs: List[Dict] = []

    def add(priority: str, category: str, title: str, action: str, impact: str):
        recs.append(
            {
                "priority": priority,
                "category": category,
                "title": title,
                "action": action,
                "expected_impact": impact,
            }
        )

    tc = float(features.get("testing_coverage", 0))
    bugs = float(features.get("bug_count", 0))
    delay = float(features.get("average_sprint_delay", 0))
    req = float(features.get("requirement_change_count", 0))
    tcr = float(features.get("task_completion_rate", 0))
    exp = float(features.get("developer_experience", 0))
    comm = float(features.get("communication_frequency", 0))
    cx = float(features.get("code_complexity", 0))

    if tc < 55:
        add(
            "P0",
            "Quality",
            "Increase test coverage",
            "Set coverage targets per repo, add CI gates for critical modules, and prioritize regression tests for high-change areas.",
            "Lower quality-issue probability and reduce late-stage defects.",
        )

    if bugs > 120:
        add(
            "P0",
            "Quality",
            "Reduce defect inflow",
            "Introduce bug triage, enforce definition-of-done, and allocate dedicated time for stabilization sprints.",
            "Reduce defect-driven delays and production incidents.",
        )

    if delay > 5:
        add(
            "P0",
            "Delivery",
            "Stabilize sprint predictability",
            "Break down large stories, limit WIP, and add a mid-sprint risk review for blockers.",
            "Lower delay probability and improve delivery confidence.",
        )

    if req > 12:
        add(
            "P1",
            "Scope",
            "Control requirement volatility",
            "Introduce change-control windows, clarify acceptance criteria early, and use impact analysis for new requests.",
            "Lower requirement-instability probability and reduce rework.",
        )

    if tcr < 65:
        add(
            "P1",
            "Team Efficiency",
            "Improve execution throughput",
            "Clarify ownership, reduce context switching, and use smaller milestones with weekly outcome tracking.",
            "Increase task completion rate and reduce delivery risk.",
        )

    if exp < 2.5:
        add(
            "P2",
            "Team",
            "Raise engineering leverage",
            "Add mentorship, pair programming on critical paths, and standardize templates for common work items.",
            "Reduce complexity-driven risk and improve quality consistency.",
        )

    if comm < 2:
        add(
            "P2",
            "Collaboration",
            "Increase stakeholder alignment",
            "Create a weekly decision meeting and publish an execution dashboard with risks, owners, and next actions.",
            "Reduce coordination risks and improve stability.",
        )

    if cx >= 8:
        add(
            "P2",
            "Architecture",
            "Reduce complexity hotspots",
            "Prioritize refactoring of the top 2-3 modules by churn, add automated linting, and enforce code review checklists.",
            "Reduce defect density and improve maintainability.",
        )

    # Default recommendations if nothing triggered
    if not recs:
        add(
            "P2",
            "Operating Model",
            "Maintain healthy delivery baseline",
            "Keep monitoring leading indicators (defects, volatility, delays) and run a monthly AI risk review to validate trends.",
            "Sustain current risk level and prevent regression.",
        )

    # Sort by priority P0, P1, P2
    order = {"P0": 0, "P1": 1, "P2": 2}
    recs.sort(key=lambda r: order.get(r["priority"], 9))
    return recs


def reasoning_summary(features: Dict[str, float], prediction: Dict) -> str:
    risk = prediction.get("risk_level", "Unknown")
    rs = prediction.get("risk_score", 0)
    top = prediction.get("top_risk_factors", [])[:3]
    pos = prediction.get("top_positive_factors", [])[:2]

    lines = [
        f"The system predicts an overall {risk} risk profile (risk score {rs}/100).",
    ]

    if top:
        t = ", ".join([f"{x['label']} ({x['direction']})" for x in top])
        lines.append(f"Key risk drivers are: {t}.")

    if pos:
        p = ", ".join([f"{x['label']} ({x['direction']})" for x in pos])
        lines.append(f"Protective factors include: {p}.")

    lines.append("Use the recommendations to address the highest-impact drivers first.")
    return " ".join(lines)

