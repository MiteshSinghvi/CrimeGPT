# CrimeGPT - Local AI Copilot for Law Enforcement

CrimeGPT is a completely offline, secure, and locally hosted AI Copilot designed to assist law enforcement officers in analyzing Cybercrime FIR (First Information Report) narratives, classifying severity, extracting key entities, and automatically mapping them to relevant Indian Penal Code (BNS 2023) and IT Act provisions.

## 🏗️ Architecture & Tech Stack

This project is built using a modern, lightweight, and completely localized multi-tier stack:

- **Frontend:** React, Vite, and Tailwind CSS (v4)
- **Backend API:** FastAPI (Python), providing asynchronous non-blocking inference endpoints
- **Local AI Engine:** Ollama running **Llama 3** (or Mistral) for offline language generation
- **Vector Database (RAG):** ChromaDB with Nomic Embeddings to strictly retrieve statutory text and penal codes

## 💡 Core Innovation Focus

1. **100% Data Privacy & Offline Compliance:** By relying completely on local execution (Ollama & ChromaDB), highly sensitive law enforcement and victim data never leaves the physical machine. There is absolutely zero reliance on external APIs like OpenAI, ensuring complete compliance with critical public safety and data sovereignty regulations.
2. **Zero External API Costs:** Operations scale infinitely at the local hardware level, removing the burden of subscription costs, API rate limits, or network dependency.
3. **Automated Statutory Mapping (RAG):** Instantly connects unstructured citizen narratives to specific, actionable legal statutes (BNS 2023 / IT Act).
4. **Actionable Evidence Checklist Generator:** Automatically distills complex laws into an immediate "To-Do" checklist for the responding officer, severely cutting down initial investigation latency.

## 🚀 How to Run

Use the provided single-command launchpad scripts to boot the entire stack simultaneously:

### Windows
```cmd
.\launch_crimegpt.bat
```

### macOS / Linux
```bash
bash launch_crimegpt.sh
```
