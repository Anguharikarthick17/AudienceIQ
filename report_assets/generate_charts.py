import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

# Set high DPI and aesthetic styling
plt.rcParams['font.sans-serif'] = 'Helvetica, Arial, DejaVu Sans'
plt.rcParams['font.family'] = 'sans-serif'

def create_k_eval_chart():
    k_vals = [2, 3, 4, 5, 6, 7, 8, 9, 10]
    sil_scores = [0.573882, 0.565221, 0.469857, 0.426134, 0.408310, 0.355027, 0.353967, 0.356514, 0.350105]
    inertia_vals = [3178.38, 2006.17, 1379.03, 1135.38, 1011.13, 916.26, 823.45, 755.04, 693.09] # thousands

    fig, ax1 = plt.subplots(figsize=(7.2, 2.0), dpi=300)
    
    color1 = '#4338ca' # Indigo
    ax1.set_xlabel('Number of Clusters (K)', fontsize=9, fontweight='bold', color='#1e293b')
    ax1.set_ylabel('Silhouette Score (Peak = Optimal)', color=color1, fontsize=8.5, fontweight='bold')
    line1 = ax1.plot(k_vals, sil_scores, color=color1, marker='o', linewidth=2.2, markersize=5.5, label='Silhouette Score')
    ax1.tick_params(axis='y', labelcolor=color1, labelsize=8)
    ax1.tick_params(axis='x', labelsize=8)
    ax1.grid(True, linestyle='--', alpha=0.35)
    ax1.set_ylim(0.30, 0.64)
    
    # Highlight K=2
    ax1.scatter([2], [0.573882], color='#dc2626', s=90, zorder=5)
    ax1.annotate('Selected Optimal K=2\n(Silhouette: 0.5739)', (2, 0.573882), textcoords="offset points", 
                 xytext=(18, -4), fontsize=8, fontweight='bold', color='#dc2626',
                 bbox=dict(boxstyle="round,pad=0.3", fc="#fee2e2", ec="#dc2626", lw=1.0))

    ax2 = ax1.twinx()
    color2 = '#0284c7' # Sky blue
    ax2.set_ylabel('Inertia (x10³)', color=color2, fontsize=8.5, fontweight='bold')
    line2 = ax2.plot(k_vals, inertia_vals, color=color2, marker='s', linestyle=':', linewidth=2.0, markersize=5, label='Inertia (Elbow)')
    ax2.tick_params(axis='y', labelcolor=color2, labelsize=8)
    ax2.set_ylim(500, 3500)

    fig.tight_layout()
    plt.savefig('report_assets/k_eval_chart.png', bbox_inches='tight', dpi=300)
    plt.close()

def create_system_architecture():
    fig, ax = plt.subplots(figsize=(7.5, 2.5), dpi=300)
    ax.axis('off')
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 42)

    # Local Docker Compose Enclosing Box
    dc_box = patches.FancyBboxPatch((15, 2), 52, 38, boxstyle="round,pad=1.0", 
                                    fc="#f8fafc", ec="#475569", lw=1.5, ls="--")
    ax.add_patch(dc_box)
    ax.text(41, 37.8, "LOCAL DOCKER COMPOSE ORCHESTRATION", 
            ha='center', va='center', fontsize=8, fontweight='bold', color="#334155")

    # Raw Dataset
    ax.add_patch(patches.FancyBboxPatch((1, 15), 11.5, 14, boxstyle="round,pad=0.6", fc="#e0f2fe", ec="#0284c7", lw=1.2))
    ax.text(6.75, 23.5, "OTT Dataset\n(CSV / Data)", ha='center', va='center', fontsize=7.2, fontweight='bold', color="#0369a1")
    ax.text(6.75, 17.5, "2,000 Users\n9 Features", ha='center', va='center', fontsize=6.2, color="#0c4a6e")

    # Trainer Service
    ax.add_patch(patches.FancyBboxPatch((17.5, 18), 13.5, 15, boxstyle="round,pad=0.6", fc="#ede9fe", ec="#6366f1", lw=1.2))
    ax.text(24.25, 27.5, "1. Trainer\n(One-Shot)", ha='center', va='center', fontsize=7.2, fontweight='bold', color="#4338ca")
    ax.text(24.25, 21.5, "• Inspect & Clean\n• Silhouette K=2\n• StandardScaler\n• KMeans Fit", ha='center', va='center', fontsize=5.8, color="#3730a3")

    # Shared Volume
    ax.add_patch(patches.FancyBboxPatch((33.5, 14), 14, 20, boxstyle="round,pad=0.6", fc="#fef3c7", ec="#f59e0b", lw=1.2))
    ax.text(40.5, 30.8, "Shared Volume\n/models", ha='center', va='center', fontsize=7.2, fontweight='bold', color="#b45309")
    ax.text(40.5, 22.8, "• pipeline.joblib\n• metadata.json\n• cluster_profiles\n• metrics.json", ha='center', va='center', fontsize=5.8, color="#78350f")

    # API Service
    ax.add_patch(patches.FancyBboxPatch((50, 18), 15, 15, boxstyle="round,pad=0.6", fc="#dcfce7", ec="#22c55e", lw=1.2))
    ax.text(57.5, 27.5, "2. API Service\n(FastAPI :8000)", ha='center', va='center', fontsize=7.2, fontweight='bold', color="#15803d")
    ax.text(57.5, 21.5, "• /recommend, /analyze\n• /health, /segments\n• Rule Recommender\n• Model Pre-loaded", ha='center', va='center', fontsize=5.8, color="#14532d")

    # Evaluator Service
    ax.add_patch(patches.FancyBboxPatch((50, 4), 15, 11, boxstyle="round,pad=0.6", fc="#fee2e2", ec="#ef4444", lw=1.2))
    ax.text(57.5, 11, "3. Evaluator", ha='center', va='center', fontsize=7.2, fontweight='bold', color="#b91c1c")
    ax.text(57.5, 6.8, "• 20 Live API Tests\n• 100% Pass Rate", ha='center', va='center', fontsize=5.8, color="#7f1d1d")

    # Cloud Deployment Box (Right)
    cloud_box = patches.FancyBboxPatch((70, 2), 29, 38, boxstyle="round,pad=1.0", fc="#f1f5f9", ec="#2563eb", lw=1.5, ls="-")
    ax.add_patch(cloud_box)
    ax.text(84.5, 37.8, "CLOUD PRODUCTION TARGETS", ha='center', va='center', fontsize=8, fontweight='bold', color="#1d4ed8")

    # Vercel Frontend
    ax.add_patch(patches.FancyBboxPatch((72, 21), 25, 13, boxstyle="round,pad=0.6", fc="#ffffff", ec="#0ea5e9", lw=1.2))
    ax.text(84.5, 29.5, "Vercel Frontend (Edge CDN)", ha='center', va='center', fontsize=7.2, fontweight='bold', color="#0369a1")
    ax.text(84.5, 24.5, "React + Vite + Tailwind + Recharts\nGlobal Edge Distribution", ha='center', va='center', fontsize=5.8, color="#334155")

    # Render API
    ax.add_patch(patches.FancyBboxPatch((72, 5), 25, 13, boxstyle="round,pad=0.6", fc="#ffffff", ec="#6366f1", lw=1.2))
    ax.text(84.5, 13.5, "Render Web Service (API)", ha='center', va='center', fontsize=7.2, fontweight='bold', color="#4338ca")
    ax.text(84.5, 8.5, "FastAPI Native / Docker runtime\nReads tracked models/ from git", ha='center', va='center', fontsize=5.8, color="#334155")

    # Arrows
    arrow_kw = dict(arrowstyle="->", lw=1.2, color="#475569")
    ax.annotate("", xy=(17.5, 25), xytext=(12.5, 25), arrowprops=arrow_kw)
    ax.annotate("", xy=(33.5, 25), xytext=(31, 25), arrowprops=arrow_kw)
    ax.annotate("", xy=(50, 25), xytext=(47.5, 25), arrowprops=arrow_kw)
    ax.annotate("", xy=(57.5, 18), xytext=(57.5, 15), arrowprops=dict(arrowstyle="<->", lw=1.2, color="#ef4444"))
    ax.annotate("", xy=(47.5, 9.5), xytext=(50, 9.5), arrowprops=arrow_kw)
    ax.annotate("HTTPS", xy=(84.5, 18), xytext=(84.5, 21), arrowprops=dict(arrowstyle="<->", lw=1.2, color="#2563eb"),
                ha='center', fontsize=6.5, color="#1d4ed8", weight='bold')

    plt.savefig('report_assets/arch_diagram.png', bbox_inches='tight', dpi=300)
    plt.close()

def create_ml_pipeline_diagram():
    fig, ax = plt.subplots(figsize=(7.5, 1.8), dpi=300)
    ax.axis('off')
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 24)

    steps = [
        ("Raw OTT Data", "2,000 rows\n9 raw columns", "#f1f5f9", "#475569"),
        ("Clean & Impute", "Numeric coerce\nMedian fill", "#e0f2fe", "#0284c7"),
        ("Feature Vector", "16-D behavioral\nMulti-hot genre", "#ede9fe", "#6366f1"),
        ("StandardScaler", "Zero mean\nUnit variance", "#fef3c7", "#d97706"),
        ("Silhouette Eval", "Test K in [2,10]\nPeak at K=2", "#fce7f3", "#db2777"),
        ("KMeans Fit", "Centroids fitted\nProfiles derived", "#dcfce7", "#16a34a"),
        ("Persist & Serve", "pipeline.joblib\nFastAPI (<6ms)", "#ccfbf1", "#0d9488"),
    ]

    x_start = 1.0
    width = 11.8
    gap = 2.4

    for i, (title, sub, fc, ec) in enumerate(steps):
        x = x_start + i * (width + gap)
        ax.add_patch(patches.FancyBboxPatch((x, 3), width, 18, boxstyle="round,pad=0.6", fc=fc, ec=ec, lw=1.2))
        ax.text(x + width/2, 16.5, f"{i+1}. {title}", ha='center', va='center', fontsize=6.8, fontweight='bold', color="#0f172a")
        ax.text(x + width/2, 9, sub, ha='center', va='center', fontsize=5.8, color="#334155")
        if i < len(steps) - 1:
            ax.annotate("", xy=(x + width + gap, 12), xytext=(x + width, 12), 
                        arrowprops=dict(arrowstyle="->", lw=1.2, color="#64748b"))

    plt.savefig('report_assets/pipeline_diagram.png', bbox_inches='tight', dpi=300)
    plt.close()

def create_er_diagram():
    fig, ax = plt.subplots(figsize=(7.5, 1.8), dpi=300)
    ax.axis('off')
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 26)

    boxes = [
        ("USER ENTITY", "user_id (String)\nPK / Unique Index", 2, 4, 16, 18, "#e2e8f0", "#334155"),
        ("RAW ACTIVITY TELEMETRY", "watch_time_hours\navg_session_duration_mins\nsessions_per_week\ncompletion_rate\ndays_since_last_watch", 21, 2, 23, 22, "#e0f2fe", "#0284c7"),
        ("BEHAVIORAL VECTOR", "16-D Standardized\n6 Continuous Features\n10 Genre Multi-Hot", 48, 4, 21, 18, "#ede9fe", "#6366f1"),
        ("AUDIENCE SEGMENT", "segment_id (0 or 1)\nsegment_name (Synthesized)\ncluster_centroid (16-D)\naudience_pct (42.7% / 57.3%)", 73, 2, 25, 22, "#dcfce7", "#16a34a"),
    ]

    for title, attrs, x, y, w, h, fc, ec in boxes:
        ax.add_patch(patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.6", fc=fc, ec=ec, lw=1.2))
        ax.text(x + w/2, y + h - 3.2, title, ha='center', va='center', fontsize=7.0, fontweight='bold', color="#0f172a")
        ax.text(x + w/2, y + h/2 - 2, attrs, ha='center', va='center', fontsize=5.8, color="#334155")

    arrow_kw = dict(arrowstyle="->", lw=1.2, color="#475569")
    ax.annotate("1:1", xy=(21, 13), xytext=(18, 13), arrowprops=arrow_kw, fontsize=6.2, color="#475569", ha='center', va='bottom')
    ax.annotate("Transforms", xy=(48, 13), xytext=(44, 13), arrowprops=arrow_kw, fontsize=6.2, color="#475569", ha='center', va='bottom')
    ax.annotate("Predicts", xy=(73, 13), xytext=(69, 13), arrowprops=arrow_kw, fontsize=6.2, color="#475569", ha='center', va='bottom')

    plt.savefig('report_assets/er_diagram.png', bbox_inches='tight', dpi=300)
    plt.close()

def create_feature_vector_diagram():
    fig, ax = plt.subplots(figsize=(7.5, 1.4), dpi=300)
    ax.axis('off')
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 20)

    groups = [
        ("Engagement", "watch_time_hours\n(Volume)", "#dbeafe", "#2563eb", 13),
        ("Session", "avg_session_mins\n(Intensity)", "#ede9fe", "#7c3aed", 13),
        ("Habit", "sessions_per_week\n(Frequency)", "#fef3c7", "#d97706", 13),
        ("Commitment", "completion_rate\n(Satisfaction)", "#dcfce7", "#16a34a", 13),
        ("Recency", "days_since_last\n(Churn Risk)", "#fee2e2", "#dc2626", 13),
        ("Temporal", "weekend_ratio\n(Routine)", "#ccfbf1", "#0d9488", 13),
        ("Genre Affinity (10D)", "Action | Animation | Comedy | Doc | Drama |\nHorror | Romance | Sci-Fi | Thriller | Reality", "#f3e8ff", "#9333ea", 18),
    ]

    x = 1.0
    for name, desc, fc, ec, w in groups:
        ax.add_patch(patches.FancyBboxPatch((x, 2), w, 16, boxstyle="round,pad=0.5", fc=fc, ec=ec, lw=1.1))
        ax.text(x + w/2, 14.5, name, ha='center', va='center', fontsize=6.5, fontweight='bold', color="#0f172a")
        ax.text(x + w/2, 7.5, desc, ha='center', va='center', fontsize=5.3, color="#334155")
        x += w + 0.6

    plt.savefig('report_assets/feature_vector_diagram.png', bbox_inches='tight', dpi=300)
    plt.close()

def create_kmeans_flow_diagram():
    fig, ax = plt.subplots(figsize=(7.5, 1.3), dpi=300)
    ax.axis('off')
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 20)

    km_steps = [
        ("1. Feature Space", "Standardized 16-D\nrepresentation", "#f1f5f9", "#475569"),
        ("2. Seed Centroids", "k-means++ init\nK=2 seeds", "#e0f2fe", "#0284c7"),
        ("3. Assign Nearest", "Euclidean distance\nto centroids", "#ede9fe", "#6366f1"),
        ("4. Recompute", "Mean feature\nvector per cluster", "#fef3c7", "#d97706"),
        ("5. Convergence", "Tolerance met or\nmax_iter=300", "#fce7f3", "#db2777"),
        ("6. Final Profiles", "Centroids profiled\n& names derived", "#dcfce7", "#16a34a"),
    ]

    x = 1.5
    w = 14.2
    gap = 2.2
    for i, (title, desc, fc, ec) in enumerate(km_steps):
        ax.add_patch(patches.FancyBboxPatch((x, 2), w, 16, boxstyle="round,pad=0.5", fc=fc, ec=ec, lw=1.1))
        ax.text(x + w/2, 14.2, title, ha='center', va='center', fontsize=6.8, fontweight='bold', color="#0f172a")
        ax.text(x + w/2, 7.5, desc, ha='center', va='center', fontsize=5.6, color="#334155")
        if i < len(km_steps) - 1:
            ax.annotate("", xy=(x + w + gap, 10), xytext=(x + w, 10), 
                        arrowprops=dict(arrowstyle="->", lw=1.1, color="#64748b"))
        x += w + gap

    plt.savefig('report_assets/kmeans_flow.png', bbox_inches='tight', dpi=300)
    plt.close()

def create_lifecycle_diagram():
    fig, ax = plt.subplots(figsize=(7.5, 1.3), dpi=300)
    ax.axis('off')
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 20)

    stages = [
        ("1. HTTP POST", "/recommend\nJSON payload", "#f1f5f9", "#475569"),
        ("2. Pydantic", "Schema & range\nvalidation (422)", "#e0f2fe", "#0284c7"),
        ("3. Transform", "16-D feature\nvector alignment", "#ede9fe", "#6366f1"),
        ("4. Predict", "Pipeline inference\ncluster assignment", "#fef3c7", "#d97706"),
        ("5. Explain", "Distance & signal\ninterpretation", "#fce7f3", "#db2777"),
        ("6. Recommend", "Rule engine +\nexplicit rationale", "#dcfce7", "#16a34a"),
        ("7. JSON Resp", "HTTP 200 OK\n< 6ms latency", "#ccfbf1", "#0d9488"),
    ]

    x = 1.0
    w = 12.0
    gap = 2.2
    for i, (title, desc, fc, ec) in enumerate(stages):
        ax.add_patch(patches.FancyBboxPatch((x, 2), w, 16, boxstyle="round,pad=0.5", fc=fc, ec=ec, lw=1.1))
        ax.text(x + w/2, 14.2, title, ha='center', va='center', fontsize=6.5, fontweight='bold', color="#0f172a")
        ax.text(x + w/2, 7.5, desc, ha='center', va='center', fontsize=5.4, color="#334155")
        if i < len(stages) - 1:
            ax.annotate("", xy=(x + w + gap, 10), xytext=(x + w, 10), 
                        arrowprops=dict(arrowstyle="->", lw=1.1, color="#64748b"))
        x += w + gap

    plt.savefig('report_assets/lifecycle_diagram.png', bbox_inches='tight', dpi=300)
    plt.close()

if __name__ == '__main__':
    create_k_eval_chart()
    create_system_architecture()
    create_ml_pipeline_diagram()
    create_er_diagram()
    create_feature_vector_diagram()
    create_kmeans_flow_diagram()
    create_lifecycle_diagram()
    print("All enhanced charts and diagrams generated successfully.")
