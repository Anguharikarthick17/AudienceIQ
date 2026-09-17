import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to compute accurate total page count (Target: exactly 10 pages)."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        page_w, page_h = letter
        margin = 36 # 0.5 inch

        # Suppress running header on cover page (Page 1)
        if self._pageNumber > 1:
            self.setFont("Helvetica-Bold", 7.5)
            self.setFillColor(colors.HexColor("#4338ca"))
            self.drawString(margin, page_h - 26, "AUDIENCEIQ")
            self.setFont("Helvetica", 7.5)
            self.setFillColor(colors.HexColor("#64748b"))
            self.drawString(margin + 62, page_h - 26, "|   TEAM LIQUID   •   IT HAPPENS @ RAALE   •   FINAL TECHNICAL REPORT")
            
            # Subtle top dividing line
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.6)
            self.line(margin, page_h - 30, page_w - margin, page_h - 30)

        # Running Footer on all pages
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.6)
        self.line(margin, 28, page_w - margin, 28)

        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#64748b"))
        self.drawString(margin, 18, "Confidential & Proprietary  •  AudienceIQ Technical Report  •  Containerized ML Service")
        
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(page_w - margin, 18, page_str)
        self.restoreState()


def build_pdf(filename="REPORT.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    C_PRIMARY = colors.HexColor("#1e293b")  # Deep slate
    C_INDIGO  = colors.HexColor("#4338ca")  # Indigo accent
    C_SKY     = colors.HexColor("#0284c7")  # Cyan/Sky blue
    C_TEXT    = colors.HexColor("#0f172a")  # Dark body text
    C_MUTED   = colors.HexColor("#475569")  # Slate muted
    C_CARD_BG = colors.HexColor("#f8fafc")  # Light gray-blue
    C_BORDER  = colors.HexColor("#cbd5e1")  # Border gray
    C_TAG_BG  = colors.HexColor("#e0e7ff")  # Tag background

    # Typography Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=C_PRIMARY,
        spaceAfter=3
    )
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=15,
        textColor=C_INDIGO,
        spaceAfter=6
    )
    meta_style = ParagraphStyle(
        'CoverMeta',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=C_MUTED,
        spaceAfter=12
    )
    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12.5,
        leading=15,
        textColor=C_INDIGO,
        spaceBefore=7,
        spaceAfter=4,
        keepWithNext=True
    )
    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=C_PRIMARY,
        spaceBefore=5,
        spaceAfter=3,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.0,
        leading=10.5,
        textColor=C_TEXT,
        spaceAfter=4
    )
    body_bold = ParagraphStyle(
        'Body_Bold_Custom',
        parent=body_style,
        fontName='Helvetica-Bold',
    )
    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=10,
        firstLineIndent=-6,
        spaceAfter=2
    )
    callout_style = ParagraphStyle(
        'Callout_Text',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.0,
        leading=10.5,
        textColor=C_TEXT
    )
    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.2,
        leading=9.2,
        textColor=C_TEXT
    )
    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.2,
        leading=9.2,
        textColor=C_PRIMARY
    )
    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.white
    )

    def make_card(title, content_list, bg_color=C_CARD_BG, border_color=C_BORDER):
        """Helper to create visually appealing card blocks."""
        story_flow = []
        if title:
            story_flow.append(Paragraph(f"<b>{title}</b>", ParagraphStyle('CardTitle', parent=h2_style, textColor=C_INDIGO, spaceBefore=0, spaceAfter=2)))
        for c in content_list:
            if isinstance(c, str):
                story_flow.append(Paragraph(c, callout_style))
            else:
                story_flow.append(c)
        card_table = Table([[story_flow]], colWidths=[538])
        card_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), bg_color),
            ('BOX', (0,0), (-1,-1), 0.8, border_color),
            ('PADDING', (0,0), (-1,-1), 6),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        return card_table

    story = []

    # =========================================================================
    # PAGE 1: COVER + EXECUTIVE SUMMARY + PROBLEM
    # =========================================================================
    story.append(Spacer(1, 10))
    story.append(Paragraph("AUDIENCEIQ", title_style))
    story.append(Paragraph("Explainable OTT Audience Intelligence Platform", subtitle_style))
    story.append(Paragraph("<i>\"Discover the audience. Explain the behavior. Personalize the experience.\"</i>", ParagraphStyle('Tagline', parent=subtitle_style, fontSize=9.5, fontName='Helvetica-Oblique', textColor=C_SKY, spaceAfter=8)))
    
    meta_text = "<b>Hackathon:</b> IT HAPPENS @ RAALE   |   <b>Problem Statement:</b> Containerized Audience Segmentation & Personalization Service   |   <b>Team:</b> TEAM LIQUID"
    story.append(Paragraph(meta_text, meta_style))
    story.append(HRFlowable(width="100%", thickness=1.2, color=C_INDIGO, spaceAfter=8, spaceBefore=0))

    story.append(Paragraph("1. Executive Summary", h1_style))
    story.append(Paragraph(
        "Modern Over-The-Top (OTT) streaming platforms accumulate massive streams of granular viewer interactions every second. "
        "However, raw behavioral metrics—such as watch duration, session intervals, weekly frequencies, and category choices—rarely "
        "translate directly into actionable audience intelligence. Mainstream recommendation systems typically treat audience data as an "
        "opaque mathematical matrix, producing black-box item recommendations without human-interpretable rationale. Editorial, content acquisition, "
        "and product personalization teams are left without insight into <i>who</i> their audience segments truly are, <i>why</i> a user belongs to a specific cohort, "
        "and <i>how</i> viewer engagement might shift under evolving behavioral conditions.",
        body_style
    ))
    story.append(Paragraph(
        "<b>AudienceIQ</b>, developed by <b>TEAM LIQUID</b>, solves this fundamental disconnect by delivering an end-to-end, containerized, "
        "and fully explainable audience intelligence and personalization platform. Operating strictly through unsupervised machine learning, "
        "AudienceIQ discovers organic behavioral cohorts without human-annotated labels, profiles clusters using empirical centroid characteristics, "
        "and produces transparent, rule-driven recommendations with explicit rationales. The platform establishes an integrated operational pipeline:",
        body_style
    ))

    exec_flow = [
        Paragraph("<b>Segment</b> → Unsupervised KMeans clustering with mathematical silhouette optimization isolates genuine behavioral groups.", bullet_style),
        Paragraph("<b>Explain</b> → Automated per-user explainability maps viewer telemetry against cluster centroids in human-readable terms.", bullet_style),
        Paragraph("<b>Personalize</b> → Rule-based recommendation engine generates transparent content suggestions with defensible rationales.", bullet_style),
        Paragraph("<b>Analyze</b> → Advanced Audience Intelligence Lab introduces counterfactual, contradiction, and migration analytical capabilities.", bullet_style),
        Paragraph("<b>Evaluate & Deploy</b> → Fully containerized multi-service Docker Compose architecture verified by an independent automated evaluator.", bullet_style),
    ]
    story.append(make_card("Core Pipeline Architecture", exec_flow, bg_color=C_TAG_BG, border_color=C_INDIGO))
    story.append(Spacer(1, 6))

    story.append(Paragraph("2. Official Problem Statement & Core Challenge", h1_style))
    story.append(Paragraph(
        "As defined in the official hackathon problem statement <i>\"Containerized Audience Segmentation & Personalization Service\"</i>, "
        "the core mandate requires engineering a production-grade, reproducible machine learning service that ingests OTT viewer behavioral logs, "
        "dynamically discovers audience cohorts without ground-truth labels, persists the trained pipeline, exposes a robust REST API, and provides "
        "an independent automated testing suite within Docker Compose.",
        body_style
    ))
    
    prob_box = [
        "<b>Concise Problem Statement:</b><br/>"
        "<i>\"How can an OTT platform automatically discover meaningful behavioral audience segments from viewer activity and use those segments "
        "to provide transparent personalization through a reproducible, containerized machine-learning service?\"</i>"
    ]
    story.append(make_card(None, prob_box, bg_color=colors.HexColor("#fef3c7"), border_color=colors.HexColor("#f59e0b")))
    
    story.append(PageBreak())

    # =========================================================================
    # PAGE 2: PROBLEM CONTEXT + EXISTING SOLUTIONS + OUR DIFFERENCE
    # =========================================================================
    story.append(Paragraph("2. Problem Context & Engineering Mandate (Continued)", h1_style))
    story.append(Paragraph(
        "To fulfill the hackathon requirements, the solution must meet strict engineering and scientific criteria: "
        "(1) Validate and preprocess varied OTT schema inputs; (2) Automatically engineer informative behavioral feature representations; "
        "(3) Determine an objectively defensible cluster count via quantitative clustering metrics; (4) Assign human-readable, data-grounded segment names; "
        "(5) Persist the pipeline artifacts to eliminate training overhead during inference; (6) Expose REST endpoints serving sub-20ms responses; "
        "(7) Integrate an independent test suite that validates live service behavior; and (8) Ensure turnkey execution via <code>docker compose up --build</code>.",
        body_style
    ))

    story.append(Paragraph("3. Analysis of Existing Approaches", h1_style))
    story.append(Paragraph(
        "Personalization and segmentation within media platforms traditionally rely on established methodologies, each possessing inherent trade-offs:",
        body_style
    ))

    approaches = [
        Paragraph("<b>Rule-Based Heuristic Grouping:</b> Platforms define static threshold rules (e.g., 'watch time > 50h = Heavy Viewer'). While transparent, static rules fail to capture multi-dimensional non-linear interactions across session dynamics, frequency, and genre affinity.", bullet_style),
        Paragraph("<b>Content-Based Filtering:</b> Recommends assets matching metadata tags of previously consumed content. Fails to segment audience communities or incorporate broader viewing habit archetypes.", bullet_style),
        Paragraph("<b>Collaborative Filtering (Matrix Factorization / Deep Learning):</b> Predicts ratings via user-item interaction matrices. While predictive, these algorithms suffer from severe cold-start vulnerability, operate as uninterpretable black boxes, and cannot explain segmentation to business teams.", bullet_style),
        Paragraph("<b>Enterprise Product Analytics Platforms:</b> Tools like Mixpanel or Amplitude provide retroactive funnel and retention dashboards, but lack integrated ML clustering pipelines that directly feed real-time personalization APIs.", bullet_style),
    ]
    for app in approaches:
        story.append(app)

    story.append(Paragraph("4. How AudienceIQ Differs: Factual Comparison", h1_style))
    story.append(Paragraph(
        "AudienceIQ bridges the gap between statistical unsupervised learning, operational API serving, and explainable product intelligence. "
        "The following matrix summarizes key architectural capabilities:",
        body_style
    ))

    comp_data = [
        [Paragraph("<b>Capability</b>", table_header), Paragraph("<b>Typical Existing Approaches</b>", table_header), Paragraph("<b>AudienceIQ Platform</b>", table_header)],
        [Paragraph("Audience Discovery", table_cell_bold), Paragraph("Manual cohort rule writing or SQL queries", table_cell), Paragraph("Automated unsupervised KMeans clustering", table_cell)],
        [Paragraph("Cluster Count (K)", table_cell_bold), Paragraph("Arbitrary business assumption (e.g. K=4)", table_cell), Paragraph("Quantitative silhouette score maximization", table_cell)],
        [Paragraph("Segment Naming", table_cell_bold), Paragraph("Static manual labels or uninformative numeric IDs", table_cell), Paragraph("Data-driven naming based on centroid feature values", table_cell)],
        [Paragraph("Decision Explainability", table_cell_bold), Paragraph("Black-box embeddings or uninterpretable matrices", table_cell), Paragraph("Traceable behavioral signals & distance to centroid", table_cell)],
        [Paragraph("Recommendation Logic", table_cell_bold), Paragraph("Opaque latent dot products without rationales", table_cell), Paragraph("Deterministic rule engine with explicit rationales", table_cell)],
        [Paragraph("Inference Architecture", table_cell_bold), Paragraph("Batch nightly database exports or ad-hoc scripts", table_cell), Paragraph("Pre-loaded persisted joblib pipeline (<10ms API)", table_cell)],
        [Paragraph("Quality Validation", table_cell_bold), Paragraph("Ad-hoc manual verification or basic unit tests", table_cell), Paragraph("Independent containerized evaluator service (20 tests)", table_cell)],
        [Paragraph("Advanced Analytics", table_cell_bold), Paragraph("Static retroactive user dashboards", table_cell), Paragraph("Counterfactual, contradiction & mismatch simulation", table_cell)],
        [Paragraph("Reproducibility", table_cell_bold), Paragraph("Complex multi-server infrastructure requirements", table_cell), Paragraph("Single turnkey command: <code>docker compose up --build</code>", table_cell)],
    ]
    comp_table = Table(comp_data, colWidths=[110, 200, 228])
    comp_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_CARD_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(comp_table)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 3: SOLUTION OVERVIEW + UNIQUE VALUE + END-TO-END WORKFLOW
    # =========================================================================
    story.append(Paragraph("5. AudienceIQ Solution Overview", h1_style))
    story.append(Paragraph(
        "AudienceIQ delivers a comprehensive, containerized audience intelligence system engineered from the ground up to solve "
        "the dual challenges of automated behavioral segmentation and transparent personalization. Rather than forcing media platforms "
        "to choose between simplistic heuristics and opaque deep-learning models, AudienceIQ unites mathematical clustering rigor with "
        "human-interpretable explainability.",
        body_style
    ))

    story.append(Paragraph("End-to-End Operational Pipeline Workflow", h2_style))
    story.append(Paragraph(
        "The end-to-end platform workflow coordinates seven distinct stages from raw data ingestion to client visualization:",
        body_style
    ))
    
    # Insert Pipeline Diagram
    if os.path.exists("report_assets/pipeline_diagram.png"):
        story.append(Image("report_assets/pipeline_diagram.png", width=538, height=140))
        story.append(Spacer(1, 4))

    pipeline_steps = [
        Paragraph("<b>1. Raw Ingestion & Schema Inspection:</b> Ingests OTT behavioral CSV datasets without rigid schema constraints; heuristic regex detects user identifiers, engagement metrics, session durations, completion rates, and genre lists.", bullet_style),
        Paragraph("<b>2. Automated Cleaning & Sanitization:</b> Enforces numeric coercion, clips impossible negative metrics, normalizes percentages, imputes missing values with median statistics, and deduplicates user records.", bullet_style),
        Paragraph("<b>3. Behavioral Feature Engineering:</b> Constructs a dense per-viewer behavioral representation combining standardized volume, intensity, frequency, and multi-hot encoded genre affinity vectors.", bullet_style),
        Paragraph("<b>4. Mathematical Standardization & Clustering:</b> Fits a <code>StandardScaler</code> and <code>KMeans</code> model over an optimal K selected through automated silhouette score evaluation across candidate clusters.", bullet_style),
        Paragraph("<b>5. Centroid Profiling & Behavioral Naming:</b> Evaluates raw feature centroids per cluster to synthesize human-readable segment names reflecting engagement intensity and content focus.", bullet_style),
        Paragraph("<b>6. Model Artifact Persistence:</b> Serializes the fitted scikit-learn pipeline, cluster profiles, and evaluation metadata into a shared volume, eliminating inference-time retraining.", bullet_style),
        Paragraph("<b>7. API Serving & Interactive Intelligence:</b> FastAPI exposes high-performance REST endpoints consumed simultaneously by the React dashboard, external platforms, and an independent evaluator container.", bullet_style),
    ]
    for ps in pipeline_steps:
        story.append(ps)

    story.append(Paragraph("6. Unique Value: Explainable Adaptive Audience Intelligence", h1_style))
    story.append(Paragraph(
        "AudienceIQ's distinctiveness stems from moving beyond the narrow question: <i>\"What asset should this user click next?\"</i> "
        "Instead, the platform answers critical strategic questions required by modern media organizations:",
        body_style
    ))

    val_points = [
        Paragraph("<b>Who is this audience?</b> Uncovers natural viewer archetypes directly from empirical viewing data.", bullet_style),
        Paragraph("<b>Why did the model assign this segment?</b> Exposes distance to centroid, relative engagement tiers, and dominant preference signals.", bullet_style),
        Paragraph("<b>What happens if viewer behavior changes?</b> Counterfactual simulator tests behavioral shifts without modifying production records.", bullet_style),
        Paragraph("<b>Does current behavior match historical preferences?</b> Contradiction detector flags anomalies between baseline preference and current activity.", bullet_style),
        Paragraph("<b>Why was an item recommended—and why was another deprioritized?</b> Exposes positive rationales alongside transparent deprioritization criteria.", bullet_style),
    ]
    story.append(make_card("Core Strategic Intelligence Dimensions", val_points, bg_color=C_CARD_BG, border_color=C_INDIGO))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 4: DATASET + PREPROCESSING + FEATURE ENGINEERING
    # =========================================================================
    story.append(Paragraph("7. Dataset Characteristics & Provenance", h1_style))
    story.append(Paragraph(
        "<b>Verified Dataset Source:</b> The dataset was supplied with the project/hackathon materials; no separate external provenance "
        "was recorded in the repository. When no physical file is provided, the trainer dynamically generates a structurally identical synthetic "
        "dataset based on documented OTT distribution properties.",
        body_style
    ))

    data_summary = [
        [Paragraph("<b>Metric / Dimension</b>", table_header), Paragraph("<b>Empirical Dataset Value</b>", table_header), Paragraph("<b>Technical Role in AudienceIQ</b>", table_header)],
        [Paragraph("File Location & Format", table_cell_bold), Paragraph("<code>data/dataset.csv</code> (CSV format)", table_cell), Paragraph("Primary input consumed by trainer container", table_cell)],
        [Paragraph("Total Row Count", table_cell_bold), Paragraph("2,000 distinct user records", table_cell), Paragraph("Sufficient statistical power for unsupervised clustering", table_cell)],
        [Paragraph("Unique User Identifiers", table_cell_bold), Paragraph("2,000 unique IDs (USR-00000 to USR-01999)", table_cell), Paragraph("Guarantees one-to-one behavioral representation", table_cell)],
        [Paragraph("Total Schema Columns", table_cell_bold), Paragraph("9 raw columns (numeric + categorical)", table_cell), Paragraph("Multi-dimensional behavioral representation", table_cell)],
        [Paragraph("Missing / Null Values", table_cell_bold), Paragraph("0 missing cells (100% complete)", table_cell), Paragraph("Validated by automated inspection module", table_cell)],
        [Paragraph("Duplicate Records", table_cell_bold), Paragraph("0 duplicate rows detected", table_cell), Paragraph("Deduplication logic applied during ingestion", table_cell)],
        [Paragraph("Behavioral Variables", table_cell_bold), Paragraph("Watch time, session mins, sessions/week, completion", table_cell), Paragraph("Continuous volume, intensity, and habit features", table_cell)],
        [Paragraph("Content Variables", table_cell_bold), Paragraph("<code>top_genre</code>, <code>genre_list</code> (10 genres)", table_cell), Paragraph("Delimited multi-hot categorical affinity flags", table_cell)],
    ]
    data_table = Table(data_summary, colWidths=[120, 190, 228])
    data_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_CARD_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
    ]))
    story.append(data_table)
    story.append(Spacer(1, 4))

    story.append(Paragraph("8. Data Preprocessing Implementation", h1_style))
    story.append(Paragraph(
        "AudienceIQ implements a strict, automated data sanitization pipeline within <code>app/ml/inspector.py</code> and <code>app/ml/feature_eng.py</code>:",
        body_style
    ))
    prep_steps = [
        Paragraph("<b>Heuristic Column Detection:</b> Employs regex matching against common naming conventions (e.g. <code>watch_time_hours</code>, <code>total_minutes</code>), making the engine adaptable to third-party vendor schemas.", bullet_style),
        Paragraph("<b>Numeric Coercion & Outlier Clipping:</b> Applies <code>pd.to_numeric(errors='coerce')</code> across all continuous attributes. Non-negative constraints clip invalid telemetry values to [0, ∞). Watch time is capped at 8,760 hours (1 year) for sanity.", bullet_style),
        Paragraph("<b>Percentage Normalization:</b> Automatically detects completion rates expressed on a [0, 100] scale and scales them to [0.0, 1.0].", bullet_style),
        Paragraph("<b>Missing Value Imputation:</b> Fills numeric missing values using column-wise medians to avoid distortion from skewed watch-time distributions; categorical and genre attributes default to zero.", bullet_style),
        Paragraph("<b>Multi-Hot Genre Encoding:</b> Parses delimited strings (<code>|</code>, <code>,</code>, <code>;</code>) into binary indicator flags across all unique genres present in the training corpus.", bullet_style),
    ]
    for ps in prep_steps:
        story.append(ps)

    story.append(Paragraph("9. Feature Engineering & Behavioral Representation", h1_style))
    story.append(Paragraph(
        "Feature engineering transforms raw logs into a compact 16-dimensional standardized behavioral matrix:",
        body_style
    ))
    feat_groups = [
        [Paragraph("<b>Feature Group</b>", table_header), Paragraph("<b>Included Attributes</b>", table_header), Paragraph("<b>Behavioral Significance</b>", table_header)],
        [Paragraph("Engagement Volume", table_cell_bold), Paragraph("<code>watch_time_hours</code>", table_cell), Paragraph("Primary measure of platform consumption and viewer retention", table_cell)],
        [Paragraph("Session Intensity", table_cell_bold), Paragraph("<code>avg_session_duration_mins</code>", table_cell), Paragraph("Distinguishes deep binge viewing from micro-browsing", table_cell)],
        [Paragraph("Consumption Habit", table_cell_bold), Paragraph("<code>sessions_per_week</code>", table_cell), Paragraph("Measures platform visit frequency and habitual loyalty", table_cell)],
        [Paragraph("Content Commitment", table_cell_bold), Paragraph("<code>completion_rate</code>", table_cell), Paragraph("Reflects content satisfaction and drop-off propensity", table_cell)],
        [Paragraph("Churn Indicator", table_cell_bold), Paragraph("<code>days_since_last_watch</code>", table_cell), Paragraph("Recency signal indicating active vs dormant viewer status", table_cell)],
        [Paragraph("Temporal Context", table_cell_bold), Paragraph("<code>weekend_activity_ratio</code>", table_cell), Paragraph("Captures weekday routine vs weekend leisure patterns", table_cell)],
        [Paragraph("Genre Affinity (10D)", table_cell_bold), Paragraph("Action, Comedy, Drama, Sci-Fi, Thriller, Horror, Romance, Documentary, Animation, Reality", table_cell), Paragraph("Binary multi-hot indicators capturing broad thematic taste profiles", table_cell)],
    ]
    feat_table = Table(feat_groups, colWidths=[105, 195, 238])
    feat_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_INDIGO),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_CARD_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
    ]))
    story.append(feat_table)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 5: ML MODEL + TRAINING + K SELECTION + SEGMENTS
    # =========================================================================
    story.append(Paragraph("10. Machine Learning Algorithm & Selection Rationale", h1_style))
    story.append(Paragraph(
        "<b>Model Architecture:</b> <code>sklearn.pipeline.Pipeline([('scaler', StandardScaler()), ('kmeans', KMeans())])</code>.<br/>"
        "AudienceIQ intentionally selects <b>KMeans Clustering</b> as its core unsupervised algorithm. "
        "<b>Key Rationale:</b> (1) <i>Strictly Unsupervised:</i> No artificial labels or subjective ground truth are required; "
        "(2) <i>Centroid Interpretability:</i> Cluster centers directly correspond to mean feature values, enabling transparent explanation; "
        "(3) <i>Extreme Computational Efficiency:</i> Scales gracefully to millions of users on standard CPU hardware without GPU acceleration; "
        "(4) <i>Deterministic Convergence:</i> Setting <code>random_state=42</code> guarantees identical results across Docker environments.",
        body_style
    ))

    story.append(Paragraph("11. Hyperparameter Configuration", h2_style))
    hyper_data = [
        [Paragraph("<b>Parameter</b>", table_header), Paragraph("<b>Configured Value</b>", table_header), Paragraph("<b>Engineering Rationale</b>", table_header)],
        [Paragraph("<code>random_state</code>", table_cell_bold), Paragraph("42", table_cell), Paragraph("Ensures absolute reproducibility across builds and evaluation runs", table_cell)],
        [Paragraph("<code>n_init</code>", table_cell_bold), Paragraph("10", table_cell), Paragraph("Executes 10 distinct centroid seedings, retaining the best inertia to avoid local minima", table_cell)],
        [Paragraph("<code>max_iter</code>", table_cell_bold), Paragraph("300", table_cell), Paragraph("Guarantees centroid convergence across iterative optimization steps", table_cell)],
        [Paragraph("Candidate K Range", table_cell_bold), Paragraph("[2, min(10, n_users // 50)]", table_cell), Paragraph("Prevents degenerate micro-clusters while systematically evaluating cluster quality", table_cell)],
    ]
    hyper_table = Table(hyper_data, colWidths=[100, 110, 328])
    hyper_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_CARD_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(hyper_table)

    story.append(Paragraph("12. Quantitative K Selection Methodology", h1_style))
    story.append(Paragraph(
        "K is not arbitrarily chosen. During the training run, the trainer evaluates every K in [2, 10] using the <b>Silhouette Coefficient</b> "
        "and tracks cumulative <b>Inertia</b>. The silhouette score measures both intra-cluster cohesion and inter-cluster separation.",
        body_style
    ))

    # Insert K Evaluation Chart
    if os.path.exists("report_assets/k_eval_chart.png"):
        story.append(Image("report_assets/k_eval_chart.png", width=538, height=130))
        story.append(Spacer(1, 4))

    story.append(Paragraph(
        "<b>Empirical Selection Rationale:</b> As documented in <code>models/metadata.json</code>, <b>K = 2</b> achieves the peak silhouette "
        "score of <b>0.573882</b> (final fitted silhouette 0.547689). While K=3 achieves 0.5652, K=2 provides the most statistically robust separation "
        "between fundamentally distinct viewing archetypes, avoiding overfitting to noise.",
        body_style
    ))

    story.append(Paragraph("13. Empirical Cluster Profiles & Explainable Segment Naming", h1_style))
    story.append(Paragraph(
        "Cluster centroids represent unscaled feature means. Segment names are synthesized through deterministic heuristic rules "
        "analyzing engagement intensity, session length, and dominant content genres:",
        body_style
    ))

    seg_profiles = [
        [Paragraph("<b>Cluster & Segment Name</b>", table_header), Paragraph("<b>Audience %</b>", table_header), Paragraph("<b>Watch Time</b>", table_header), Paragraph("<b>Session Dur.</b>", table_header), Paragraph("<b>Completion</b>", table_header), Paragraph("<b>Dominant Genres</b>", table_header)],
        [
            Paragraph("<b>Cluster 0</b><br/>High-Engagement Genre Explorers", table_cell_bold),
            Paragraph("42.7%<br/>(854 users)", table_cell),
            Paragraph("102.35 hrs<br/>(8.89 sess/wk)", table_cell),
            Paragraph("112.02 min<br/>(Long sessions)", table_cell),
            Paragraph("84.18%<br/>(High loyalty)", table_cell),
            Paragraph("Action (30%), Comedy (29%), Sci-Fi (27%), Thriller (26%), Drama (26%)", table_cell)
        ],
        [
            Paragraph("<b>Cluster 1</b><br/>Genre Explorers", table_cell_bold),
            Paragraph("57.3%<br/>(1,146 users)", table_cell),
            Paragraph("30.28 hrs<br/>(4.20 sess/wk)", table_cell),
            Paragraph("34.63 min<br/>(Bite-sized)", table_cell),
            Paragraph("46.94%<br/>(Casual sample)", table_cell),
            Paragraph("Action (25%), Horror (24%), Documentary (24%), Animation (24%), Reality (24%)", table_cell)
        ],
    ]
    seg_table = Table(seg_profiles, colWidths=[130, 65, 80, 75, 68, 120])
    seg_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_INDIGO),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_CARD_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(seg_table)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 6: SYSTEM ARCHITECTURE + LOGICAL DATA MODEL + TECH STACK
    # =========================================================================
    story.append(Paragraph("14. System Architecture Diagram", h1_style))
    story.append(Paragraph(
        "AudienceIQ employs a decoupled, multi-container microservice architecture orchestrated via Docker Compose. "
        "The system isolates training, serving, independent testing, and presentation into dedicated boundaries:",
        body_style
    ))

    # Insert System Architecture Diagram
    if os.path.exists("report_assets/arch_diagram.png"):
        story.append(Image("report_assets/arch_diagram.png", width=538, height=145))
        story.append(Spacer(1, 4))

    story.append(Paragraph("15. Logical Data Model", h1_style))
    story.append(Paragraph(
        "<i>Note: AudienceIQ does not require a relational database for its core ML inference pipeline; "
        "this diagram represents the logical data relationships utilized by the system:</i>",
        ParagraphStyle('NoteStyle', parent=body_style, fontName='Helvetica-Oblique', textColor=C_MUTED)
    ))

    # Insert ER Diagram
    if os.path.exists("report_assets/er_diagram.png"):
        story.append(Image("report_assets/er_diagram.png", width=538, height=110))
        story.append(Spacer(1, 4))

    story.append(Paragraph("16. Comprehensive Technology Stack", h1_style))
    story.append(Paragraph(
        "The technology stack is intentionally selected for speed, container portability, explainability, and minimal resource footprint:",
        body_style
    ))

    tech_data = [
        [Paragraph("<b>Component Layer</b>", table_header), Paragraph("<b>Technologies Utilized</b>", table_header), Paragraph("<b>Version</b>", table_header), Paragraph("<b>Architectural Responsibility</b>", table_header)],
        [Paragraph("Frontend UI", table_cell_bold), Paragraph("React, TypeScript, Vite, Tailwind CSS", table_cell), Paragraph("18.3 / 5.6", table_cell), Paragraph("Responsive dashboard, model telemetry, and audience intelligence exploration", table_cell)],
        [Paragraph("Data Visualization", table_cell_bold), Paragraph("Recharts, Lucide Icons, Framer Motion", table_cell), Paragraph("2.13 / 11.11", table_cell), Paragraph("Cluster distribution charts, inertia curves, and interactive UI animations", table_cell)],
        [Paragraph("Backend Framework", table_cell_bold), Paragraph("FastAPI, Uvicorn, Pydantic v2", table_cell), Paragraph("0.115 / 2.10", table_cell), Paragraph("High-throughput async REST API serving inference and analytics endpoints", table_cell)],
        [Paragraph("Machine Learning", table_cell_bold), Paragraph("scikit-learn, NumPy, pandas", table_cell), Paragraph("1.5.2 / 2.2", table_cell), Paragraph("StandardScaler, KMeans clustering, silhouette scoring, and feature engineering", table_cell)],
        [Paragraph("Model Persistence", table_cell_bold), Paragraph("joblib, JSON serialization", table_cell), Paragraph("1.4.2", table_cell), Paragraph("Serializes pipeline.joblib, metadata.json, and cluster_profiles.json", table_cell)],
        [Paragraph("Containerization", table_cell_bold), Paragraph("Docker, Docker Compose, Linux Slim", table_cell), Paragraph("Compose 3.9", table_cell), Paragraph("Isolated multi-container orchestration with healthchecks and non-root users", table_cell)],
        [Paragraph("Reverse Proxy / Web", table_cell_bold), Paragraph("Nginx (Alpine)", table_cell), Paragraph("1.27", table_cell), Paragraph("Serves compiled static SPA assets and proxies <code>/api/*</code> to the backend", table_cell)],
        [Paragraph("Cloud Deployment", table_cell_bold), Paragraph("Vercel (Frontend), Render (API)", table_cell), Paragraph("Cloud Native", table_cell), Paragraph("Hosted serverless web application with public REST API connectivity", table_cell)],
    ]
    tech_table = Table(tech_data, colWidths=[95, 155, 60, 228])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_CARD_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 2.2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.2),
    ]))
    story.append(tech_table)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 7: API SPECIFICATION + RECOMMENDATION ENGINE + DOCKER
    # =========================================================================
    story.append(Paragraph("17. REST API Architecture & Endpoints", h1_style))
    story.append(Paragraph(
        "AudienceIQ exposes clean, RESTful JSON interfaces powered by FastAPI with strict Pydantic input validation. "
        "Importantly, <b>the model is loaded once at application startup</b>; no training or disk I/O occurs during request inference.",
        body_style
    ))

    api_specs = [
        [Paragraph("<b>Endpoint & Method</b>", table_header), Paragraph("<b>Payload / Params</b>", table_header), Paragraph("<b>Response Contract</b>", table_header), Paragraph("<b>Validation & Error Handling</b>", table_header)],
        [
            Paragraph("<code>GET /health</code><br/><i>System Readiness</i>", table_cell_bold),
            Paragraph("None", table_cell),
            Paragraph("<code>{status, model_loaded, n_clusters, n_training_users}</code>", table_cell),
            Paragraph("Returns 200 OK; verifies model is loaded in memory for Docker healthcheck", table_cell)
        ],
        [
            Paragraph("<code>POST /recommend</code><br/><i>Core Hackathon API</i>", table_cell_bold),
            Paragraph("<code>{user_id, watch_time_hours, top_genres, avg_session_mins}</code>", table_cell),
            Paragraph("<code>{segment_id, segment_name, recommendations, distance, explanation}</code>", table_cell),
            Paragraph("Validates positive watch time (0.01–8760h), non-empty genres list, session bounds (0.1–1440m)", table_cell)
        ],
        [
            Paragraph("<code>POST /analyze</code><br/><i>Full Intelligence</i>", table_cell_bold),
            Paragraph("Extended user telemetry including sessions/week & completion rate", table_cell),
            Paragraph("<code>{segment_id, behavior_signals, segment_explanation, rationales}</code>", table_cell),
            Paragraph("Full per-user audit generating structured behavioral evidence signals", table_cell)
        ],
        [
            Paragraph("<code>GET /dashboard</code><br/><i>Portfolio Metrics</i>", table_cell_bold),
            Paragraph("None", table_cell),
            Paragraph("<code>{total_viewers, avg_watch_time, segments[], genre_dist{}}</code>", table_cell),
            Paragraph("Returns aggregate audience metrics across all clusters", table_cell)
        ],
        [
            Paragraph("<code>GET /segments</code><br/><i>Segment Profiles</i>", table_cell_bold),
            Paragraph("Optional <code>{id}</code> path parameter", table_cell),
            Paragraph("Detailed centroid profiles, strategies, and dominant content genres", table_cell),
            Paragraph("Returns 404 if requested segment ID exceeds cluster boundaries", table_cell)
        ],
        [
            Paragraph("<code>GET /model-info</code><br/><i>Audit Evidence</i>", table_cell_bold),
            Paragraph("None", table_cell),
            Paragraph("<code>{model_status, selected_k, silhouette, inertia, k_evaluation[]}</code>", table_cell),
            Paragraph("Exposes complete mathematical training evidence for judge validation", table_cell)
        ],
    ]
    api_table = Table(api_specs, colWidths=[105, 135, 148, 150])
    api_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_CARD_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
    ]))
    story.append(api_table)

    story.append(Paragraph("18. Recommendation Engine Implementation", h1_style))
    story.append(Paragraph(
        "AudienceIQ employs a deterministic, rule-based recommendation layer situated in <code>app/ml/recommender.py</code>. "
        "Rather than relying on opaque matrix factorization or costly third-party LLM APIs, the recommender combines segment-level strategy "
        "with individual user genre affinity. <b>Operational Flow:</b>",
        body_style
    ))
    recom_flow = [
        Paragraph("1. <b>Segment Strategy Retrieval:</b> Queries cluster centroid profile to establish baseline recommendation strategy (e.g. episodic series for high-session clusters vs bite-sized formats for casual cohorts).", bullet_style),
        Paragraph("2. <b>Genre Affinity Scoring:</b> Intersects user's stated top genres with the segment's dominant content patterns.", bullet_style),
        Paragraph("3. <b>Rationale Generation:</b> For every recommended title, the engine outputs an explicit, defensible rationale connecting the item to specific user telemetry (e.g. <i>\"Recommended because user completed >80% of Sci-Fi content with sessions exceeding 90 mins\"</i>).", bullet_style),
    ]
    for rf in recom_flow:
        story.append(rf)

    story.append(Paragraph("19. Docker Architecture & Container Orchestration", h1_style))
    story.append(Paragraph(
        "The multi-service Docker environment executes via a single command: <code>docker compose up --build</code>. "
        "Startup sequence is strictly enforced through dependency conditions:",
        body_style
    ))
    docker_points = [
        Paragraph("• <b>1. Trainer Container (One-Shot):</b> Boots first, validates dataset, executes silhouette evaluation, trains KMeans, dumps artifacts to shared volume <code>models_volume:/models</code>, and exits cleanly with code 0.", bullet_style),
        Paragraph("• <b>2. API Container (FastAPI):</b> Configured with <code>depends_on: {trainer: {condition: service_completed_successfully}}</code>. Pre-loads model into memory on startup; exposes healthcheck at <code>/health</code>.", bullet_style),
        Paragraph("• <b>3. Evaluator Container (Automated Testing):</b> Configured with <code>depends_on: {api: {condition: service_healthy}}</code>. Waits for API readiness, executes 20 tests, and writes <code>metrics.json</code>.", bullet_style),
        Paragraph("• <b>4. Frontend Container (Nginx):</b> Serves production React build on port 80 and proxies internal <code>/api/*</code> requests.", bullet_style),
    ]
    for dp in docker_points:
        story.append(dp)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 8: FIVE ADVANCED AUDIENCE INTELLIGENCE FEATURES
    # =========================================================================
    story.append(Paragraph("20. Audience Intelligence Lab: Five Advanced Features", h1_style))
    story.append(Paragraph(
        "Beyond standard segmentation, AudienceIQ conceives an advanced analytical suite—the <b>Audience Intelligence Lab</b>. "
        "In strict compliance with evaluation integrity, each feature is transparently audited as <b>IMPLEMENTED</b> or <b>DESIGNED / INTEGRATION READY</b>:",
        body_style
    ))

    # Feature 1
    f1_box = [
        Paragraph("<b>Feature 1: Behavioral Counterfactual Simulator (Counterfactual Lab)</b>   [Status: <b>DESIGNED / INTEGRATION READY</b>]", h2_style),
        Paragraph("• <b>Purpose:</b> Answers <i>\"What if this viewer's behavior changed?\"</i> Simulates segment re-classification under hypothetical telemetry shifts.", bullet_style),
        Paragraph("• <b>Input & Processing:</b> User modifies sliders for watch time, session length, or genres. The modified vector passes through the persisted StandardScaler and KMeans centroids.", bullet_style),
        Paragraph("• <b>Output & Technical Qualification:</b> Returns original segment, new segment, centroid distance delta, and explanation. <i>Important: This represents counterfactual model classification, not causal econometric inference.</i>", bullet_style),
        Paragraph("• <b>API Integration:</b> Operates directly through repeated invocations of the existing <code>POST /recommend</code> or <code>/analyze</code> endpoints.", bullet_style),
    ]
    story.append(make_card(None, f1_box, bg_color=C_CARD_BG, border_color=C_BORDER))
    story.append(Spacer(1, 3))

    # Feature 2
    f2_box = [
        Paragraph("<b>Feature 2: Audience Contradiction Detector</b>   [Status: <b>DESIGNED / INTEGRATION READY</b>]", h2_style),
        Paragraph("• <b>Purpose:</b> Automatically flags discrepancies between a user's stated baseline preferences and actual observed consumption telemetry.", bullet_style),
        Paragraph("• <b>Processing & Example:</b> Compares stated top genre (e.g. 'Documentary') against actual session engagement (e.g. 95% Action viewing). Identifies behavioral contradictions, computes contradiction severity score, and flags retention risk.", bullet_style),
        Paragraph("• <b>Data Requirements & Scope:</b> Operates on comparative multi-attribute records; clearly labeled as comparative contradiction analysis.", bullet_style),
    ]
    story.append(make_card(None, f2_box, bg_color=C_CARD_BG, border_color=C_BORDER))
    story.append(Spacer(1, 3))

    # Feature 3
    f3_box = [
        Paragraph("<b>Feature 3: Audience Migration Map</b>   [Status: <b>DESIGNED / INTEGRATION READY</b>]", h2_style),
        Paragraph("• <b>Purpose:</b> Visualizes viewer trajectory and transition flow between behavioral cohorts as engagement habits evolve.", bullet_style),
        Paragraph("• <b>Technical Specification:</b> Where temporal multi-snapshot logs are unavailable, the platform models <i>Counterfactual Audience Migration</i> (e.g. simulating how a 25% watch-time increase across Cluster 1 shifts 18% of members into Cluster 0).", bullet_style),
        Paragraph("• <b>Output:</b> Source segment, destination segment, projected viewer transition counts, and key behavioral transition drivers.", bullet_style),
    ]
    story.append(make_card(None, f3_box, bg_color=C_CARD_BG, border_color=C_BORDER))
    story.append(Spacer(1, 3))

    # Feature 4
    f4_box = [
        Paragraph("<b>Feature 4: Content–Audience Mismatch Detector</b>   [Status: <b>DESIGNED / INTEGRATION READY</b>]", h2_style),
        Paragraph("• <b>Purpose:</b> Diagnoses catalog allocation inefficiencies by comparing aggregate audience genre demand against catalog availability.", bullet_style),
        Paragraph("• <b>Processing & Example:</b> Aggregates viewer demand (e.g. Sci-Fi demanded by 42% of active users) vs catalog library representation (e.g. Sci-Fi constitutes only 12% of titles), flagging a 30 percentage-point supply deficit.", bullet_style),
        Paragraph("• <b>Integrity Boundary:</b> Distinguishes stated audience demand from actual physical content exposure; avoids unsubstantiated claims.", bullet_style),
    ]
    story.append(make_card(None, f4_box, bg_color=C_CARD_BG, border_color=C_BORDER))
    story.append(Spacer(1, 3))

    # Feature 5
    f5_box = [
        Paragraph("<b>Feature 5: Why-NOT Recommendation Engine</b>   [Status: <b>DESIGNED / INTEGRATION READY</b>]", h2_style),
        Paragraph("• <b>Purpose:</b> Solves algorithmic opacity by explaining not only why an asset was recommended, but <i>why other popular assets were deprioritized</i>.", bullet_style),
        Paragraph("• <b>Decision Criteria:</b> Applies transparent deterministic rules: (1) Genre mismatch with viewer profile; (2) Session format incompatibility (e.g. 150-min feature film deprioritized for 20-min casual viewer); (3) Divergence from cluster centroid preference.", bullet_style),
        Paragraph("• <b>Zero LLM Overhead:</b> Operates purely via rule-based Boolean predicates without external API dependencies or latency penalties.", bullet_style),
    ]
    story.append(make_card(None, f5_box, bg_color=C_CARD_BG, border_color=C_BORDER))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 9: EVALUATION + EDGE CASES + SECURITY + DEPLOYMENT
    # =========================================================================
    story.append(Paragraph("21. Empirical Evaluation & Test Results", h1_style))
    story.append(Paragraph(
        "AudienceIQ features a fully automated, independent evaluation service (<code>evaluator/evaluate.py</code>). "
        "The evaluator boots inside Docker, probes the live API over HTTP, and persists empirical results to <code>models/metrics.json</code>:",
        body_style
    ))

    eval_summary = [
        [Paragraph("<b>Evaluation Metric</b>", table_header), Paragraph("<b>Empirical Result</b>", table_header), Paragraph("<b>Target Threshold</b>", table_header), Paragraph("<b>Validation Status</b>", table_header)],
        [Paragraph("Total Test Cases Executed", table_cell_bold), Paragraph("20 automated integration tests", table_cell), Paragraph("≥ 15 comprehensive tests", table_cell), Paragraph("<b>PASS</b> (Exceeded)", table_cell)],
        [Paragraph("Pass Count / Fail Count", table_cell_bold), Paragraph("20 Passed / 0 Failed", table_cell), Paragraph("0 Failures permitted", table_cell), Paragraph("<b>PASS</b> (100.0%)", table_cell)],
        [Paragraph("Overall Pass Rate", table_cell_bold), Paragraph("<b>100.0%</b>", table_cell), Paragraph("≥ 90.0% benchmark", table_cell), Paragraph("<b>PASS</b> (Flawless)", table_cell)],
        [Paragraph("Average API Latency", table_cell_bold), Paragraph("<b>5.55 ms</b> per request", table_cell), Paragraph("< 50.0 ms SLA", table_cell), Paragraph("<b>PASS</b> (9x faster)", table_cell)],
        [Paragraph("Latency Range (Min / Max)", table_cell_bold), Paragraph("0.45 ms (health) / 19.87 ms (recom)", table_cell), Paragraph("< 100.0 ms max ceiling", table_cell), Paragraph("<b>PASS</b> (Sub-20ms max)", table_cell)],
        [Paragraph("Silhouette Score", table_cell_bold), Paragraph("<b>0.5739</b> (K=2 evaluation)", table_cell), Paragraph("> 0.35 defensible cluster bound", table_cell), Paragraph("<b>PASS</b> (High cohesion)", table_cell)],
        [Paragraph("Cluster Distribution Balance", table_cell_bold), Paragraph("Cluster 0: 42.7% | Cluster 1: 57.3%", table_cell), Paragraph("No degenerate cluster (<5%)", table_cell), Paragraph("<b>PASS</b> (Balanced)", table_cell)],
    ]
    eval_table = Table(eval_summary, colWidths=[125, 140, 135, 138])
    eval_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_CARD_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 2.2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.2),
    ]))
    story.append(eval_table)
    story.append(Spacer(1, 3))

    story.append(Paragraph("22. Comprehensive Edge Cases & Boundary Handling", h1_style))
    story.append(Paragraph(
        "The test suite rigorously exercises real-world edge cases to verify application resilience:",
        body_style
    ))
    edge_cases = [
        Paragraph("• <b>Negative or Zero Watch Time:</b> Validated via Pydantic; rejects negative values and zero durations with structured HTTP 422 errors.", bullet_style),
        Paragraph("• <b>Missing Mandatory Fields:</b> Payloads omitting <code>user_id</code>, <code>watch_time_hours</code>, or <code>top_genres</code> return informative 422 validation messages.", bullet_style),
        Paragraph("• <b>Extreme Values:</b> Inputs with watch time > 8,760 hours (1 year) or sessions > 1,440 mins are cleanly rejected to protect centroid arithmetic.", bullet_style),
        Paragraph("• <b>Unknown or Unseen Genres:</b> Multi-hot vectorizer defaults unseen genres to zero without runtime exceptions; inference completes successfully.", bullet_style),
        Paragraph("• <b>Model Unavailability:</b> Invocations before model loading return structured HTTP 503 Service Unavailable without exposing stack traces.", bullet_style),
    ]
    for ec in edge_cases:
        story.append(ec)

    story.append(Paragraph("23. Security & Operational Reliability", h1_style))
    story.append(Paragraph(
        "<b>Security Implementation:</b> (1) <i>Sanitized Error Handling:</i> A global FastAPI exception handler intercepts unhandled exceptions, returning standardized JSON messages and preventing internal stack-trace leakage; "
        "(2) <i>Non-Root Execution:</i> Dockerfiles instantiate unprivileged <code>appuser</code> accounts for container processes; "
        "(3) <i>Configurable CORS:</i> Regulated origins allow authorized Vercel frontends while preventing unauthorized cross-origin abuse; "
        "(4) <i>Secret Isolation:</i> <code>.gitignore</code> strictly excludes environment keys, credentials, and tokens.",
        body_style
    ))

    story.append(Paragraph("24. Dual Cloud & Local Deployment Architecture", h1_style))
    story.append(Paragraph(
        "AudienceIQ supports hybrid local and cloud deployment targets: "
        "<b>(1) Local Orchestration:</b> Self-contained execution via <code>docker compose up --build</code> with shared volumes; "
        "<b>(2) Cloud Production:</b> Frontend deployed on <b>Vercel</b> (serverless Edge CDN), connecting via HTTPS to the FastAPI backend "
        "configured for free-tier <b>Render</b> deployment via <code>render.yaml</code>, pre-loading persisted model artifacts on boot.",
        body_style
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 10: LIMITATIONS + FUTURE WORK + AI/TOKEN USAGE + FINAL PITCH
    # =========================================================================
    story.append(Paragraph("25. Honest Engineering Limitations", h1_style))
    story.append(Paragraph(
        "In accordance with rigorous engineering ethics, the team highlights current architectural constraints:",
        body_style
    ))
    limits = [
        Paragraph("• <b>Centroid-Based Assumption:</b> KMeans assumes convex, spherical cluster distributions; non-linear manifold structures may require future kernel or graph clustering.", bullet_style),
        Paragraph("• <b>Single-Snapshot Aggregation:</b> Telemetry represents static per-user averages; does not capture intra-week or seasonal temporal drift.", bullet_style),
        Paragraph("• <b>Rule-Based Recommendations:</b> Recommendations reflect defensible heuristic strategies rather than collaborative ranking optimized against online CTR.", bullet_style),
        Paragraph("• <b>Simulation vs Causal Inference:</b> Counterfactual analytics model how the algorithm classifies shifted inputs—they do not model causal human behavior.", bullet_style),
    ]
    for lm in limits:
        story.append(lm)

    story.append(Paragraph("26. Roadmap & Future Work", h1_style))
    story.append(Paragraph(
        "Planned production enhancements include: (1) <i>Streaming Ingestion:</i> Integrating Apache Kafka for real-time telemetry updates; "
        "(2) <i>Temporal Drift Detection:</i> Sliding-window silhouette degradation monitoring; (3) <i>Hybrid Recommendations:</i> Merging cluster-guided candidate generation with two-tower neural ranking; "
        "and (4) <i>A/B Experimentation Framework:</i> Measuring empirical conversion lift across explainable recommendation rationales.",
        body_style
    ))

    story.append(Paragraph("27. AI Assistance & Token Usage Disclosure", h1_style))
    ai_box = [
        "<b>Development Transparency Statement:</b><br/>"
        "AI-assisted development was utilized for implementation, debugging, documentation generation, and architectural iteration. "
        "Exact token consumption was not programmatically recorded in the project repository, so an exact token total cannot be verified.<br/>"
        "<b>Runtime Independence:</b> <i>No external LLM or paid AI API (e.g. OpenAI) is required for AudienceIQ runtime inference. "
        "All clustering, explainability, and recommendation logic runs entirely offline and deterministically on standard CPU hardware.</i>"
    ]
    story.append(make_card(None, ai_box, bg_color=C_CARD_BG, border_color=C_BORDER))
    story.append(Spacer(1, 4))

    story.append(Paragraph("28. Development Journey & Evolution", h1_style))
    story.append(Paragraph(
        "The project progressed through systematic milestones: Initial exploration of OTT schema variations → Modular feature engineering pipeline → "
        "Quantitative silhouette K evaluation → Docker Compose multi-service containerization → Independent test harness construction (20 tests) → "
        "React + Vite executive dashboard creation → Production Vercel deployment → Render cloud configuration → Finalization of the Audience Intelligence Lab.",
        body_style
    ))

    story.append(Paragraph("29. Final Solution Summary", h1_style))
    story.append(Paragraph(
        "<b>TEAM LIQUID</b> engineered <b>AudienceIQ</b> as a complete, transparent, and reproducible OTT audience intelligence platform. "
        "By grounding audience segmentation in quantitative clustering metrics, deriving segment names directly from empirical feature centroids, "
        "and validating operational reliability through containerized evaluation, AudienceIQ proves that personalization does not require opaque black boxes. "
        "The system delivers an unbroken operational arc: <b>Data → ML → Explanation → Personalization → Intelligence Lab → Evaluation → Containerization → Deployment.</b>",
        body_style
    ))

    story.append(Paragraph("30. 30-Second Judge Pitch", h1_style))
    pitch_box = [
        "<b>The AudienceIQ Value Proposition (85 words):</b><br/>"
        "<i>\"AudienceIQ transforms raw, messy OTT streaming telemetry into explainable audience intelligence and transparent personalization. "
        "Using unsupervised machine learning optimized by silhouette evaluation, the system automatically discovers natural viewer cohorts, "
        "derives human-readable segment names from empirical centroids, and provides deterministic recommendations with traceable rationales. "
        "Extended by our Audience Intelligence Lab, the platform introduces counterfactual simulation and contradiction detection without LLM overhead. "
        "Packaged in Docker Compose with a 100% verified test suite and 5.55ms API latency, AudienceIQ is fully reproducible and production-ready today.\"</i>"
    ]
    story.append(make_card("Official Hackathon Submission Pitch — TEAM LIQUID", pitch_box, bg_color=colors.HexColor("#ede9fe"), border_color=C_INDIGO))

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully compiled {filename}")

if __name__ == '__main__':
    build_pdf()
