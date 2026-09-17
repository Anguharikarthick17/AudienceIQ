import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

# Set high DPI and aesthetic styling
plt.rcParams['font.sans-serif'] = 'Helvetica, Arial, DejaVu Sans'
plt.rcParams['font.family'] = 'sans-serif'

def create_k_eval_chart():
    k_vals = [2, 3, 4, 5, 6, 7, 8, 9, 10]
    sil_scores = [0.573882, 0.565221, 0.469857, 0.426134, 0.408310, 0.355027, 0.353967, 0.356514, 0.350105]
    inertia_vals = [3178.38, 2006.17, 1379.03, 1135.38, 1011.13, 916.26, 823.45, 755.04, 693.09] # in thousands

    fig, ax1 = plt.subplots(figsize=(6.5, 2.2), dpi=300)
    
    color1 = '#4338ca' # Indigo
    ax1.set_xlabel('Number of Clusters (K)', fontsize=9, fontweight='bold', color='#1e293b')
    ax1.set_ylabel('Silhouette Score (Peak = Optimal)', color=color1, fontsize=8, fontweight='bold')
    line1 = ax1.plot(k_vals, sil_scores, color=color1, marker='o', linewidth=2, markersize=5, label='Silhouette Score')
    ax1.tick_params(axis='y', labelcolor=color1, labelsize=8)
    ax1.tick_params(axis='x', labelsize=8)
    ax1.grid(True, linestyle='--', alpha=0.3)
    ax1.set_ylim(0.3, 0.65)
    
    # Highlight K=2
    ax1.scatter([2], [0.573882], color='#dc2626', s=80, zorder=5)
    ax1.annotate('Selected K=2\n(Sil: 0.5739)', (2, 0.573882), textcoords="offset points", 
                 xytext=(15, -5), fontsize=7.5, fontweight='bold', color='#dc2626',
                 bbox=dict(boxstyle="round,pad=0.2", fc="#fee2e2", ec="#dc2626", lw=0.8))

    ax2 = ax1.twinx()
    color2 = '#0284c7' # Sky blue
    ax2.set_ylabel('Inertia (x10³)', color=color2, fontsize=8, fontweight='bold')
    line2 = ax2.plot(k_vals, inertia_vals, color=color2, marker='s', linestyle=':', linewidth=1.8, markersize=4.5, label='Inertia (Elbow)')
    ax2.tick_params(axis='y', labelcolor=color2, labelsize=8)
    ax2.set_ylim(500, 3500)

    fig.tight_layout()
    plt.savefig('report_assets/k_eval_chart.png', bbox_inches='tight', dpi=300)
    plt.close()

def create_system_architecture():
    fig, ax = plt.subplots(figsize=(7.2, 2.5), dpi=300)
    ax.axis('off')
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 42)

    # Docker Compose enclosing box
    dc_box = patches.FancyBboxPatch((18, 2), 64, 38, boxstyle="round,pad=1.2", 
                                    fc="#f8fafc", ec="#475569", lw=1.5, ls="--")
    ax.add_patch(dc_box)
    ax.text(50, 37.5, "Docker Compose Multi-Container Orchestration", 
            ha='center', va='center', fontsize=8.5, fontweight='bold', color="#334155")

    # Data Source (External left)
    ax.add_patch(patches.FancyBboxPatch((1, 15), 13, 14, boxstyle="round,pad=0.8", fc="#e0f2fe", ec="#0284c7", lw=1.2))
    ax.text(7.5, 23.5, "OTT Dataset\n(CSV / Data)", ha='center', va='center', fontsize=7.5, fontweight='bold', color="#0369a1")
    ax.text(7.5, 17.5, "2,000 Users\n9 Features", ha='center', va='center', fontsize=6.5, color="#0c4a6e")

    # Trainer Service
    ax.add_patch(patches.FancyBboxPatch((21, 18), 16, 15, boxstyle="round,pad=0.8", fc="#ede9fe", ec="#6366f1", lw=1.2))
    ax.text(29, 27, "1. Trainer Service", ha='center', va='center', fontsize=7.5, fontweight='bold', color="#4338ca")
    ax.text(29, 22, "• Inspect & Clean\n• Silhouette K-Eval\n• Fit StandardScaler\n• Fit KMeans (K=2)", ha='center', va='center', fontsize=6.2, color="#3730a3")

    # Shared Volume
    ax.add_patch(patches.FancyBboxPatch((42, 14), 16, 20, boxstyle="round,pad=0.8", fc="#fef3c7", ec="#f59e0b", lw=1.2))
    ax.text(50, 31, "Shared Volume\n/models", ha='center', va='center', fontsize=7.5, fontweight='bold', color="#b45309")
    ax.text(50, 24, "• pipeline.joblib\n• metadata.json\n• cluster_profiles.json\n• metrics.json", ha='center', va='center', fontsize=6.2, color="#78350f")

    # API Service
    ax.add_patch(patches.FancyBboxPatch((63, 18), 17, 15, boxstyle="round,pad=0.8", fc="#dcfce7", ec="#22c55e", lw=1.2))
    ax.text(71.5, 27, "2. API Service (FastAPI)", ha='center', va='center', fontsize=7.5, fontweight='bold', color="#15803d")
    ax.text(71.5, 22, "• /health & /recommend\n• /analyze & /segments\n• Rule Recommender\n• Explainability Layer", ha='center', va='center', fontsize=6.2, color="#14532d")

    # Evaluator Service
    ax.add_patch(patches.FancyBboxPatch((63, 3.5), 17, 11, boxstyle="round,pad=0.8", fc="#fee2e2", ec="#ef4444", lw=1.2))
    ax.text(71.5, 11, "3. Evaluator Service", ha='center', va='center', fontsize=7.5, fontweight='bold', color="#b91c1c")
    ax.text(71.5, 6.8, "• 20 Automated Tests\n• 100% Pass | 5.55ms", ha='center', va='center', fontsize=6.2, color="#7f1d1d")

    # Frontend Service (Right external / Nginx & Vercel)
    ax.add_patch(patches.FancyBboxPatch((85, 15), 14, 17, boxstyle="round,pad=0.8", fc="#f1f5f9", ec="#64748b", lw=1.2))
    ax.text(92, 27.5, "Frontend UI", ha='center', va='center', fontsize=7.5, fontweight='bold', color="#1e293b")
    ax.text(92, 21.5, "React + Vite\nTailwind + Recharts\nVercel (Prod)\nNginx (Local :80)", ha='center', va='center', fontsize=6.2, color="#334155")

    # Arrows
    arrow_kw = dict(arrowstyle="->", lw=1.2, color="#475569")
    ax.annotate("", xy=(21, 25), xytext=(14, 25), arrowprops=arrow_kw)
    ax.annotate("", xy=(42, 25), xytext=(37, 25), arrowprops=arrow_kw)
    ax.annotate("", xy=(63, 25), xytext=(58, 25), arrowprops=arrow_kw)
    ax.annotate("", xy=(85, 25), xytext=(80, 25), arrowprops=arrow_kw)
    ax.annotate("", xy=(71.5, 18), xytext=(71.5, 15), arrowprops=dict(arrowstyle="<->", lw=1.2, color="#ef4444"))
    ax.annotate("", xy=(58, 9), xytext=(63, 9), arrowprops=arrow_kw)

    plt.savefig('report_assets/arch_diagram.png', bbox_inches='tight', dpi=300)
    plt.close()

def create_ml_pipeline_diagram():
    fig, ax = plt.subplots(figsize=(7.2, 1.9), dpi=300)
    ax.axis('off')
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 24)

    steps = [
        ("Raw OTT Data", "2,000 users\n9 features", "#e2e8f0", "#475569"),
        ("Data Clean", "Coerce types\nClip negatives", "#e0f2fe", "#0284c7"),
        ("Feature Eng.", "Multi-hot genres\nBehavior vector", "#ede9fe", "#6366f1"),
        ("Standardize", "StandardScaler\nZero mean, unit var", "#fef3c7", "#d97706"),
        ("K Selection", "Silhouette eval\nOptimal K=2", "#fce7f3", "#db2777"),
        ("KMeans Fit", "Centroids fitted\nSegment names", "#dcfce7", "#16a34a"),
        ("Persist & Serve", "joblib pipeline\nFastAPI inference", "#ccfbf1", "#0d9488"),
    ]

    x_start = 1
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
    fig, ax = plt.subplots(figsize=(7.2, 2.0), dpi=300)
    ax.axis('off')
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 26)

    boxes = [
        ("USER", "user_id (PK)\ncreated_at", 3, 4, 15, 18, "#e2e8f0", "#334155"),
        ("USER ACTIVITY", "watch_time_hours\navg_session_mins\nsessions_per_week\ncompletion_rate\ndays_since_last_watch", 23, 2, 22, 22, "#e0f2fe", "#0284c7"),
        ("BEHAVIOR VECTOR", "Standardized 16-D\nNumeric Scaled\nGenre Multi-Hot", 50, 4, 20, 18, "#ede9fe", "#6366f1"),
        ("SEGMENT", "segment_id (0, 1)\nsegment_name\ncluster_centroid\naudience_pct", 75, 4, 22, 18, "#dcfce7", "#16a34a"),
    ]

    for title, attrs, x, y, w, h, fc, ec in boxes:
        ax.add_patch(patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.6", fc=fc, ec=ec, lw=1.2))
        ax.text(x + w/2, y + h - 3, title, ha='center', va='center', fontsize=7.2, fontweight='bold', color="#0f172a")
        ax.text(x + w/2, y + h/2 - 2, attrs, ha='center', va='center', fontsize=5.8, color="#334155")

    arrow_kw = dict(arrowstyle="->", lw=1.2, color="#475569")
    ax.annotate("1:1", xy=(23, 13), xytext=(18, 13), arrowprops=arrow_kw, fontsize=6, color="#475569", ha='center', va='bottom')
    ax.annotate("Transforms", xy=(50, 13), xytext=(45, 13), arrowprops=arrow_kw, fontsize=6, color="#475569", ha='center', va='bottom')
    ax.annotate("Assigns", xy=(75, 13), xytext=(70, 13), arrowprops=arrow_kw, fontsize=6, color="#475569", ha='center', va='bottom')

    plt.savefig('report_assets/er_diagram.png', bbox_inches='tight', dpi=300)
    plt.close()

if __name__ == '__main__':
    create_k_eval_chart()
    create_system_architecture()
    create_ml_pipeline_diagram()
    create_er_diagram()
    print("All charts and diagrams generated successfully.")
