"""
Smart AI System for Software Project Risk Prediction and Process Optimisation
Dataset Generator (v2) - Advanced synthetic generation with auxiliary binary targets
"""

import pandas as pd
import numpy as np
from pathlib import Path

def _sigmoid(x: np.ndarray) -> np.ndarray:
    return 1.0 / (1.0 + np.exp(-x))

def generate_dataset(n: int = 4000, seed: int = 42):
    rng = np.random.default_rng(seed)

    team_size = rng.integers(2, 60, size=n)
    project_budget = rng.normal(250_000, 180_000, size=n).clip(15_000, 2_500_000)
    project_duration = rng.integers(1, 24, size=n)

    requirement_change_count = rng.poisson(lam=6, size=n).clip(0, 40)
    average_sprint_delay = rng.normal(2.2, 2.0, size=n).clip(0, 18)
    bug_count = rng.poisson(lam=55, size=n).clip(0, 350)
    testing_coverage = rng.normal(62, 18, size=n).clip(0, 100)
    code_complexity = rng.integers(1, 11, size=n)
    developer_experience = rng.normal(4.5, 2.4, size=n).clip(0.2, 18)
    communication_frequency = rng.integers(0, 11, size=n)
    task_completion_rate = rng.normal(72, 16, size=n).clip(0, 100)
    client_change_requests = rng.poisson(lam=4, size=n).clip(0, 30)
    previous_project_success_rate = rng.normal(72, 18, size=n).clip(0, 100)

    # Latent risk score (0..1)
    z = (
        0.08 * (requirement_change_count / 10.0)
        + 0.10 * (average_sprint_delay / 6.0)
        + 0.09 * (bug_count / 120.0)
        + 0.10 * (code_complexity / 10.0)
        + 0.07 * (client_change_requests / 10.0)
        + 0.06 * (project_duration / 18.0)
        - 0.10 * (testing_coverage / 100.0)
        - 0.08 * (developer_experience / 10.0)
        - 0.10 * (task_completion_rate / 100.0)
        - 0.09 * (previous_project_success_rate / 100.0)
        - 0.04 * (communication_frequency / 10.0)
        + 0.03 * (np.log1p(project_budget) / np.log(2_500_000))
        + rng.normal(0, 0.05, size=n)
    )
    risk_score_01 = _sigmoid((z - 0.35) * 4.2)

    risk_level = np.where(
        risk_score_01 < 0.35, "Low",
        np.where(risk_score_01 < 0.55, "Medium",
        np.where(risk_score_01 < 0.75, "High", "Critical"))
    )

    # Auxiliary binary targets
    delay_prob = _sigmoid((risk_score_01 - 0.45) * 4.5)
    budget_prob = _sigmoid((risk_score_01 - 0.50) * 4.2) * (0.7 + 0.3 * (project_budget / 2_500_000))
    quality_prob = _sigmoid((risk_score_01 - 0.40) * 4.6) * (0.9 + 0.2 * (bug_count / 350)) * (1.05 - 0.6 * (testing_coverage / 100))
    req_prob = _sigmoid((risk_score_01 - 0.42) * 4.4) * (0.8 + 0.4 * (requirement_change_count / 40))

    df = pd.DataFrame({
        "team_size": team_size,
        "project_budget": project_budget.round(2),
        "project_duration": project_duration,
        "requirement_change_count": requirement_change_count,
        "average_sprint_delay": average_sprint_delay.round(2),
        "bug_count": bug_count,
        "testing_coverage": testing_coverage.round(2),
        "code_complexity": code_complexity,
        "developer_experience": developer_experience.round(2),
        "communication_frequency": communication_frequency,
        "task_completion_rate": task_completion_rate.round(2),
        "client_change_requests": client_change_requests,
        "previous_project_success_rate": previous_project_success_rate.round(2),
        "risk_level": risk_level,
        "delay": rng.binomial(1, delay_prob.clip(0, 1)),
        "budget_overrun": rng.binomial(1, budget_prob.clip(0, 1)),
        "quality_issues": rng.binomial(1, quality_prob.clip(0, 1)),
        "requirement_instability": rng.binomial(1, req_prob.clip(0, 1)),
    })

    out_dir = Path(__file__).parent / "dataset"
    out_dir.mkdir(exist_ok=True)
    out_path = out_dir / "software_project_risk_data.csv"
    df.to_csv(out_path, index=False)
    print(f"✅ Generated {n} rows at {out_path}")
    print(df["risk_level"].value_counts())

if __name__ == "__main__":
    generate_dataset()
