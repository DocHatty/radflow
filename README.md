<div align="center">

# RADFLOW

*Context-Aware Intelligence | AI Augmented + Streamlined Reporting | High Yield Checklist Manifesto Workflow*

---

<img width="3746" height="1821" alt="image" src="https://github.com/user-attachments/assets/e1dd7c42-974b-4810-8bc8-39027251ed49" />


[![License](https://img.shields.io/badge/license-Personal%20%2F%20Research-orange.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Powered by](https://img.shields.io/badge/powered%20by-Google%20Gemini%201.5%2F2.0-4285F4.svg)](https://deepmind.google/gemini/)

</div>

---

## 🎯 What is RADFLOW?

**RADFLOW** is the AI-powered cognitive co-pilot for elite radiologists who refuse to compromise on precision, speed, or excellence.

Built on **Google Gemini's** most advanced multi-modal architecture (supporting Gemini 1.5 Pro/Flash and Gemini 2.0 Flash), RADFLOW deploys a **sophisticated multi-agent AI system** that works in parallel to provide:
- **Real-time clinical intelligence** across 8 simultaneous guidance streams
- **Adaptive differential diagnosis** that evolves with your findings
- **Context-aware orchestration** routing each cognitive task to specialized AI models
- **Evidence-grounded recommendations** with automatic web search when needed
- **Interactive AI consultation** for complex case discussions

This isn't just software. It's **high-performance AI meeting high-stakes medicine**—seamlessly integrated into a distraction-free workspace engineered to maintain your flow state, where your best diagnostic work happens.

---

## ✨ Experience the Difference

### **🧠 Real-World Rundown: AI Clinical Intelligence**
Your attending radiologist's knowledge, instantly available. RADFLOW's groundbreaking **parallel AI architecture** simultaneously generates **8 comprehensive clinical guidance sections** plus a separate appropriateness evaluation in real-time:
- **Most Likely Diagnoses** - Weighted differentials based on imaging findings
- **Top Facts** - High-yield pearls for rapid decision-making  
- **What to Look For** - Systematic search strategy for the specific case
- **Pitfalls & Mimics** - Critical don't-miss warnings and lookalikes
- **Search Pattern** - Optimized workflow checklists
- **Pertinent Negatives** - Key findings to document for completeness
- **Classic Signs** - Pathognomonic features to confirm diagnoses
- **Bottom Line** - Synthesized clinical recommendation

Plus: **ACR Appropriateness Criteria** evaluation with intelligent web grounding—when the AI needs more context, it automatically searches authoritative sources to provide evidence-based guidance.

### **🎙️ Seamless Voice Dictation**
Native, low-latency speech recognition engineered for radiology workflows. Speak naturally, report effortlessly. Your voice becomes structured findings instantly.

### **🔍 Intelligent Differential Diagnosis**
Experience AI that **evolves with your case**. RADFLOW generates weighted differential diagnoses in real-time, then intelligently refines them as you add findings—removing outdated possibilities and suggesting new considerations. Get ranked differentials with clinical rationale, imaging features, and next-step recommendations. It's like having a diagnostic reasoning consultant at your fingertips.

### **✅ Finalize with Confidence**
A comprehensive AI-powered review system ensures excellence:
- **Interactive Q&A** - Chat with the AI about complex cases, ask for clarifications, explore alternative diagnoses
- **Guideline-Aware Review** - Integrated knowledge base of major radiology guidelines (Fleischer, Bosniak, ACR, LI-RADS) ensures follow-up recommendations meet best practices
- **Language Refinement** - AI polishes your prose while preserving your medical precision
- **Quality Assurance** - Final checklist review before sign-off

Every report, clinically sound and eloquently presented.

### **🎨 Digital Impressionism**
A revolutionary ambient workspace powered by **Imagen 3/4** (automatically selects the best available model). Each session generates unique, AI-created medical concept art in the style of master impressionists—dynamic visualizations of neurological landscapes, cardiovascular systems, and cellular structures. Beautiful enough to inspire, subtle enough to prevent distraction during marathon reading sessions.

---

## 🧬 The AI Architecture

RADFLOW represents a paradigm shift in how AI assists radiological interpretation. Unlike simple chatbots, RADFLOW implements a **multi-agent orchestration system** with specialized intelligence at every stage:

### Parallel Processing Pipeline
When you input a case, RADFLOW's **Real-World Rundown** launches **8 independent AI tasks** that process simultaneously (plus a separate appropriateness evaluation):
- Each task is optimized for a specific cognitive function (differential generation, pitfall detection, search pattern creation, etc.)
- Responses arrive asynchronously as they complete, keeping you in flow
- Total guidance generation: **~15-30 seconds** for comprehensive clinical intelligence that would take humans hours to research

### Intelligent Task Routing
The **AI Orchestrator** analyzes each request and routes it to the optimal model:
- **JSON-structured tasks** (categorization, differentials) → High-precision schema-validated models
- **Streaming tasks** (report drafting, impression synthesis) → Models optimized for natural language generation
- **Grounding-enabled tasks** (appropriateness evaluation) → Models with web search capabilities when local knowledge is insufficient
- **Image generation** (ambient backgrounds) → Imagen 3.0+ with carefully crafted impressionist prompts (auto-selects best available model)

### Context-Aware Intelligence
Unlike isolated AI calls, RADFLOW maintains **semantic context** across the entire workflow:
- Clinical history informs appropriateness evaluation
- Appropriateness insights guide the Real-World Rundown sections
- Dictated findings automatically trigger differential refinement
- Selected differentials integrate seamlessly into impression synthesis
- Every AI interaction builds on previous understanding

### Adaptive Learning
The differential diagnosis system demonstrates true **reactive intelligence**:
1. Initial generation based on clinical history and study type
2. **Continuous monitoring** of your dictated findings
3. **Automatic refinement** when findings change—removing outdated differentials, adding newly relevant ones
4. Ranking and weighting based on supporting/refuting evidence
5. Clinical rationale for each diagnosis with key imaging features

This is **AI that thinks alongside you**, not just responds to prompts.

---

## 🚀 Getting Started

### **Prerequisites**

Before experiencing RADFLOW, ensure you have:

- **Node.js** (v18 or higher) — [Download](https://nodejs.org/)
- **Google Gemini API Key** — [Get Your Key](https://ai.google.dev/)

> **⚡ Power Requires Fuel**  
> RADFLOW's intelligence and Digital Impressionism engine are powered by the Google Gemini API. Without a valid API key, functionality will be limited to basic features.

---

### **Installation**

#### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/radflow.git
cd radflow
```

#### **2. Install Dependencies**
```bash
npm install
```

#### **3. Configure Your API Key**

**Option A:** Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

**Option B:** Enter your API key directly in the application's Settings panel after launch.

#### **4. Launch RADFLOW**
```bash
npm run dev
```

Access your workspace at **[http://localhost:5173](http://localhost:5173)**

---

## 💡 How to Use RADFLOW

RADFLOW's **multi-stage AI workflow** orchestrates sophisticated intelligence at every step:

| Stage | What Happens | AI Power at Work |
|-------|--------------|------------------|
| **1. Input** | Paste clinical history or use voice dictation | **Smart Categorization AI** extracts structured data: demographics, allergies, medications, labs, prior imaging—organized instantly |
| **2. Guidance** | Real-World Rundown activates | **8 parallel AI tasks + appropriateness evaluation** simultaneously generate: clinical context, differential diagnoses, search patterns, pitfalls, classic signs, and clinical synthesis |
| **3. Dictate Findings** | Voice or text entry of imaging observations | **AI monitors your findings** and auto-generates/refines differential diagnoses in real-time as you work |
| **4. Build Impression** | Select relevant differentials | **Impression Synthesis AI** crafts a cohesive, evidence-based impression integrating your findings and selected diagnoses |
| **5. Refine & Review** | Interactive AI consultation | **Chat with the AI** about the case, apply **guideline-aware recommendations**, polish language with AI assistance |
| **6. Finalize** | Quality assurance check | **Final Review AI** validates completeness, consistency, and adherence to best practices before sign-off |

### The Intelligence Behind the Interface

RADFLOW's **AI Orchestrator** intelligently routes each task to specialized models optimized for that specific cognitive function—categorization, clinical reasoning, guideline retrieval, language refinement. Context flows seamlessly between stages, creating a truly intelligent co-pilot that understands your case holistically.

---

## 🏆 Why RADFLOW?

<table>
<tr>
<td align="center"><b>🎯 Precision</b><br/>Multi-stage AI workflow with context preservation across all phases</td>
<td align="center"><b>⚡ Speed</b><br/>8 parallel AI tasks + native dictation = Maximum throughput</td>
<td align="center"><b>🧘 Flow State</b><br/>Ambient design eliminates cognitive switching costs</td>
</tr>
<tr>
<td align="center"><b>🔬 Evidence-Based</b><br/>ACR criteria, web grounding, and curated guideline knowledge base</td>
<td align="center"><b>🤖 Intelligent</b><br/>AI orchestrator routes tasks to specialized models for optimal performance</td>
<td align="center"><b>🎨 Inspired</b><br/>Dynamic impressionist medical art reduces fatigue during long sessions</td>
</tr>
<tr>
<td align="center"><b>💬 Interactive</b><br/>Chat with AI about complex cases, get second opinions on demand</td>
<td align="center"><b>🔄 Adaptive</b><br/>Differentials auto-refine as findings evolve—your AI thinks with you</td>
<td align="center"><b>🚀 Modern</b><br/>Built on Google Gemini's most advanced multi-modal architecture</td>
</tr>
</table>

---

## 📋 Roadmap

- [ ] DICOM viewer integration
- [ ] Multi-modal reporting (CT, MRI, US, X-ray templates)
- [ ] Team collaboration features
- [ ] Custom template library
- [ ] Advanced analytics dashboard

---

## 🤝 Contributing

RADFLOW is built for radiologists, by those who understand radiology. We welcome contributions from the community.

Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

---

## 📄 License

This project is available for **personal use and research only**. Commercial use requires express written permission from the creator. See the [LICENSE](LICENSE) file for details.

---

## 🌟 Support the Project

If RADFLOW enhances your practice, consider:
- ⭐ Starring this repository
- 📢 Sharing with colleagues
- 🐛 Reporting bugs or suggesting features

---

<div align="center">

**Engineered for radiologists who demand excellence.**

Made with precision and purpose | Powered by Google Gemini 1.5/2.0 + Imagen 3/4

[Report Bug](mailto:DoctorHatkoff14@gmail.com) · [Request Feature](mailto:DoctorHatkoff14@gmail.com)

</div>
