import os
import sys
import time
import json

# Ensure project root in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.agents import scheme_assistant_app
from backend.app import _parse_schemes_from_llm

DATASET_PATH = os.path.join(os.path.dirname(__file__), "test_dataset.json")

def calculate_mrr(retrieved_names, expected_names):
    """Calculates Reciprocal Rank for a single query."""
    for rank, name in enumerate(retrieved_names, start=1):
        for exp in expected_names:
            if exp.lower() in name.lower() or name.lower() in exp.lower():
                return 1.0 / rank
    return 0.0

def calculate_precision_at_k(retrieved_names, expected_names, k):
    """Calculates Precision@K."""
    top_k = retrieved_names[:k]
    if not top_k:
        return 0.0
    matches = 0
    for name in top_k:
        if any(exp.lower() in name.lower() or name.lower() in exp.lower() for exp in expected_names):
            matches += 1
    return matches / float(k)

def calculate_recall_at_k(retrieved_names, expected_names, k):
    """Calculates Recall@K."""
    if not expected_names:
        return 1.0
    top_k = retrieved_names[:k]
    matches = 0
    for exp in expected_names:
        if any(exp.lower() in name.lower() or name.lower() in exp.lower() for name in top_k):
            matches += 1
    return matches / float(len(expected_names))

def run_benchmark():
    print("==========================================================")
    print("   GOVERNMENT SCHEME ASSISTANT — EVALUATION BENCHMARK     ")
    print("==========================================================")
    
    with open(DATASET_PATH, "r") as f:
        test_data = json.load(f)

    total_queries = len(test_data)
    print(f"Loaded {total_queries} evaluation profiles from test dataset.")

    latencies = []
    p3_list = []
    p5_list = []
    r3_list = []
    r5_list = []
    mrr_list = []
    category_acc_list = []

    report_rows = []

    for item in test_data:
        p_id = item["profile_id"]
        profile = item["profile"]
        expected_cats = item["expected_categories"]
        expected_schemes = item["expected_schemes"]

        user_query = (
            f"What schemes is a {profile['age']}-year-old {profile['gender'].lower()} "
            f"{profile['occupation'].lower()} from {profile['state']} eligible for?"
        )

        initial_state = {
            "user_profile": profile,
            "user_query": user_query,
            "eligible_categories": [],
            "local_schemes": [],
            "web_schemes": [],
            "fused_schemes": [],
            "retrieved_documents": [],
            "evaluated_schemes": [],
            "document_checklist": [],
            "final_response": "",
            "agent_logs": [],
        }

        t0 = time.time()
        result = scheme_assistant_app.invoke(initial_state)
        elapsed_ms = (time.time() - t0) * 1000
        latencies.append(elapsed_ms)

        # Extracted categories and schemes
        detected_cats = result.get("eligible_categories", [])
        parsed_schemes = _parse_schemes_from_llm(
            result["final_response"],
            result["retrieved_documents"]
        )
        retrieved_names = [s["name"] for s in parsed_schemes]
        if not retrieved_names:
            retrieved_names = [s["scheme_name"] for s in result.get("evaluated_schemes", [])]

        # Compute Category Accuracy
        cat_matches = sum(1 for c in expected_cats if any(c.lower() in d.lower() for d in detected_cats))
        cat_acc = cat_matches / float(len(expected_cats)) if expected_cats else 1.0
        category_acc_list.append(cat_acc)

        # Compute metrics
        p3 = calculate_precision_at_k(retrieved_names, expected_schemes, 3)
        p5 = calculate_precision_at_k(retrieved_names, expected_schemes, 5)
        r3 = calculate_recall_at_k(retrieved_names, expected_schemes, 3)
        r5 = calculate_recall_at_k(retrieved_names, expected_schemes, 5)
        mrr = calculate_mrr(retrieved_names, expected_schemes)

        p3_list.append(p3)
        p5_list.append(p5)
        r3_list.append(r3)
        r5_list.append(r5)
        mrr_list.append(mrr)

        report_rows.append({
            "id": p_id,
            "name": profile["full_name"],
            "occupation": profile["occupation"],
            "state": profile["state"],
            "latency": round(elapsed_ms, 1),
            "p3": round(p3, 2),
            "r3": round(r3, 2),
            "mrr": round(mrr, 2)
        })
        print(f"Profile {p_id} ({profile['full_name']}): Latency={elapsed_ms:.1f}ms | P@3={p3:.2f} | R@3={r3:.2f} | MRR={mrr:.2f}")

    avg_latency = sum(latencies) / len(latencies)
    avg_p3 = sum(p3_list) / len(p3_list)
    avg_p5 = sum(p5_list) / len(p5_list)
    avg_r3 = sum(r3_list) / len(r3_list)
    avg_r5 = sum(r5_list) / len(r5_list)
    avg_mrr = sum(mrr_list) / len(mrr_list)
    avg_cat_acc = sum(category_acc_list) / len(category_acc_list)

    summary_md = f"""# Multi-Agent RAG System Quantitative Evaluation Report

## Benchmark Executive Summary
- **Evaluation Dataset Size:** {total_queries} diverse citizen demographic profiles
- **Average End-to-End Latency:** {avg_latency:.2f} ms
- **Category Detection Accuracy:** {avg_cat_acc * 100:.1f}%
- **Mean Reciprocal Rank (MRR):** {avg_mrr:.4f}
- **Precision@3:** {avg_p3 * 100:.1f}%
- **Recall@3:** {avg_r3 * 100:.1f}%
- **Precision@5:** {avg_p5 * 100:.1f}%
- **Recall@5:** {avg_r5 * 100:.1f}%

## Per-Profile Performance Breakdown

| Profile ID | Citizen Name | Occupation | State | Latency (ms) | Precision@3 | Recall@3 | MRR |
|---|---|---|---|---|---|---|---|
"""
    for r in report_rows:
        summary_md += f"| {r['id']} | {r['name']} | {r['occupation']} | {r['state']} | {r['latency']} | {r['p3']} | {r['r3']} | {r['mrr']} |\n"

    print("\n" + summary_md)

    # Save to markdown file for research paper inclusion
    out_path = os.path.join(os.path.dirname(__file__), "eval_report.md")
    with open(out_path, "w") as f:
        f.write(summary_md)
    print(f"Evaluation report successfully written to {out_path}")

if __name__ == "__main__":
    run_benchmark()
