# MedGraph AI — Agentic personal health navigator (JacHacks Spring 2026)

MedGraph models **your** conditions, medications, and labs as a **Jac knowledge graph** (object–spatial programming). Specialized **walkers** traverse that graph to flag drug–drug considerations, preventive-care gaps, and lab follow-ups—and `SymptomTriageWalker` reasons about new symptoms in the context of the graph.

**Important:** MedGraph is **educational decision-support**, not a medical device and not a substitute for a licensed clinician. Use demo mode for reliable hackathon demos; use live LLM mode only when you understand latency and limits.

---

## Tracks

Consumer Healthcare • Best Use of Jac • (Optional) Featherless-compatible via LiteLLM / OpenAI-style base URL • Best Startup Idea narrative

---

## Features

| Layer | Details |
|--------|---------|
| **Profile intake** | Web wizard sends structured data → `walker:pub rebuild_patient_from_profile`; prior active patients are deactivated via `DeactivatePatientsWalker`. |
| **Jac graph** | `Patient`, `Condition`, `Medication`, `LabResult`, `CareGap`, `HealthInsight` nodes; analysis walks your graph, not static copy-paste prose. |
| **Walkers** | `DrugInteractionWalker`, `PreventiveCareWalker`, `LabAnalyzerWalker`, `SymptomTriageWalker`, `CareCoordinatorWalker` + `DeactivatePatientsWalker`. |
| **API** | `jac start main.jac` exposes `health`, `ensure_graph`, `get_snapshot`, `run_analysis`, `run_triage`, `rebuild_patient_from_profile`, `reset_demo`. |
| **UI** | `frontend/` + `serve.py` proxies `/walker/*` and `/docs` to avoid CORS issues. |

---

## Quick start (full stack)

```bash
cd medgraph
pip install -r requirements.txt
./start.sh
```

Open **http://127.0.0.1:5500** — use **Build profile** to enter your data, or **Sample: Sarah Chen** to restore the reference graph.

- **OpenAPI:** http://127.0.0.1:8000/docs (also linked from the UI header; proxied when using `serve.py` on 5500).

---

## Demo vs live LLM

| Mode | Env | Behavior |
|------|-----|-----------|
| **Stable demo (default)** | `MEDGRAPH_DEMO=1` (default) | Walkers still run on the graph; LLM-heavy steps use scripted fallbacks (`demo_*`). Best for judging and screenshare. |
| **Live reasoning** | `MEDGRAPH_DEMO=0` + API key | `by llm()` calls Groq/Qwen-compatible models via LiteLLM (see keys below). Higher latency / cost. |

```bash
# Live (Groq via default BYLLM model in main.jac)
export MEDGRAPH_DEMO=0
export GROQ_API_KEY="your-key"
./start.sh

# Or Featherless / other OpenAI-compatible endpoint (adjust BYLLM_MODEL + env as supported by LiteLLM)
export FEATHERLESS_API_KEY="your-key"
export BYLLM_MODEL="openrouter/..." # example only — set to whatever your LiteLLM provider expects
```

`jac.toml` documents default `groq/llama-3.3-70b-versatile`; runtime uses `BYLLM_MODEL` env when set from `main.jac`'s Model configuration.

---

## CLI only

```bash
MEDGRAPH_DEMO=1 jac run main.jac
RUN_ANALYSIS=1 MEDGRAPH_DEMO=1 jac run main.jac   # run coordinators once after graph build (uses sample CLI path)
```

---

## Export

From the dashboard header: **Export summary (JSON)** downloads the last coordinator report (interactions, care gaps, labs, risk text) — useful for bringing notes to an appointment (**not PHI storage** guaranteed; treat this as a prototype).

---

## Screenshots / design

Place reference PNGs under `screenshots/` (see `screenshots/README.md`).

---

## Limitations

- Single-session MVP; SQLite graph under `.jac/` — wipe `.jac/data` if deserialization errors appear.
- No HIPAA compliance claims; no EHR connectivity in this hackathon scope.
- Triage output is probabilistic guidance only when live LLMs are enabled.
