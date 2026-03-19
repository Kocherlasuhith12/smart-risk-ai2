"""
Process Optimisation Recommendation Engine
Rule-based system that maps risk factors to actionable improvement suggestions
"""

from typing import List, Dict


RULES = [
    {
        "condition": lambda f: f.get("requirement_change_count", 0) > 10,
        "recommendation": "Freeze requirements earlier. Implement a formal change request process to minimise scope creep.",
        "category": "Scope Management"
    },
    {
        "condition": lambda f: f.get("average_sprint_delay", 0) > 3,
        "recommendation": "Improve sprint planning accuracy. Break tasks into smaller units and use story points for better estimation.",
        "category": "Sprint Planning"
    },
    {
        "condition": lambda f: f.get("testing_coverage", 100) < 60,
        "recommendation": "Increase unit and integration test coverage to at least 70%. Adopt Test-Driven Development (TDD) practices.",
        "category": "Quality Assurance"
    },
    {
        "condition": lambda f: f.get("bug_count", 0) > 50,
        "recommendation": "Introduce mandatory code reviews. Set up automated static code analysis tools (ESLint, SonarQube).",
        "category": "Code Quality"
    },
    {
        "condition": lambda f: f.get("developer_experience", 10) < 3,
        "recommendation": "Pair junior developers with senior mentors. Provide training sessions and allocate buffer time for learning.",
        "category": "Team Development"
    },
    {
        "condition": lambda f: f.get("communication_frequency", 10) < 4,
        "recommendation": "Increase team stand-up frequency. Adopt collaboration tools (Slack, Jira) and define clear communication protocols.",
        "category": "Communication"
    },
    {
        "condition": lambda f: f.get("task_completion_rate", 100) < 60,
        "recommendation": "Reassess workload distribution. Identify and remove blockers in weekly retrospectives.",
        "category": "Productivity"
    },
    {
        "condition": lambda f: f.get("client_change_requests", 0) > 8,
        "recommendation": "Schedule regular client alignment meetings. Establish a change control board to evaluate impact before approval.",
        "category": "Client Management"
    },
    {
        "condition": lambda f: f.get("code_complexity", 0) > 7,
        "recommendation": "Refactor complex modules. Apply SOLID principles and break monolithic components into microservices.",
        "category": "Architecture"
    },
    {
        "condition": lambda f: f.get("previous_project_success_rate", 100) < 50,
        "recommendation": "Conduct a post-mortem analysis on previous projects. Document lessons learned and apply corrective actions.",
        "category": "Process Improvement"
    },
    {
        "condition": lambda f: f.get("team_size", 10) < 4 and f.get("project_duration", 6) > 12,
        "recommendation": "Consider scaling the team or reducing project scope. A small team on a long project is a risk factor.",
        "category": "Resource Planning"
    },
]


def get_recommendations(features: dict, risk_level: str) -> List[Dict]:
    """Returns list of applicable recommendations based on feature values."""
    results = []

    for rule in RULES:
        try:
            if rule["condition"](features):
                results.append({
                    "category": rule["category"],
                    "recommendation": rule["recommendation"]
                })
        except Exception:
            continue

    # If risk is high and no specific rules triggered, add generic ones
    if risk_level == "High" and len(results) < 3:
        results.append({
            "category": "General",
            "recommendation": "Schedule an immediate project health review with all stakeholders."
        })
        results.append({
            "category": "Risk Response",
            "recommendation": "Prepare a risk mitigation plan with clearly assigned owners for each identified risk."
        })

    return results[:6]  # Return top 6 recommendations
