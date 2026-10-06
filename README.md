# NavOk Heal 🌿

**NavOk Heal** is a next-generation AI healthcare platform designed to bridge the gap between patients and immediate clinical guidance. It features an interactive, real-time AI specialist (Dr. Maya), comprehensive lab report OCR, OpenFDA-grounded medication search, and live mapping of nearby healthcare facilities.

---

## 🌟 Key Features

*   **🎙️ Audio-Visual AI Intake:** Speak naturally with our conversational AI specialist, Dr. Maya. Supports real-time text-to-speech (TTS), speech-to-text (STT), and multimodal visual input via webcam for active symptom evaluation.
*   **📄 Lab Report Analysis:** Upload PDF lab results, blood work, or prescriptions for instant OCR and structured breakdown.
*   **💊 Medicine Directory (OpenFDA):** Search over 250,000 verified generic active ingredients, brand equivalents, and FDA safety guidelines directly within the platform.
*   **🗺️ Facility Navigator:** GPS-powered medical locator using OpenStreetMap and MapLibre GL JS to find nearby pharmacies, clinics, and hospitals with real-time radius escalation.
*   **👨‍⚕️ Specialist Registry:** Connect directly with certified practitioners, cardiologists, and telehealth physicians.
*   **🔐 Patient Command Center:** Manage active consultations, health summaries, and clinical access in a unified, secure dashboard.

## 🛠️ Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (App Router, v16) & React 19
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & Framer Motion
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand)
*   **AI/LLM Engine:** Google Gemini (Multimodal capabilities for vision & chat)
*   **Database & Auth:** Firebase (Firestore, Authentication)
*   **Mapping:** MapLibre GL JS & Overpass API (OpenStreetMap)

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js (v18+) and npm installed.

### 1. Clone & Install
```bash
git clone https://github.com/your-username/navok-heal.git
cd navok-heal
npm install
```

### 2. Environment Variables
Copy the example environment file and fill in your API credentials:
```bash
cp .env.example .env.local
```
You will need to provide:
*   `GEMINI_API_KEY`
*   Firebase Client Configuration variables (`NEXT_PUBLIC_FIREBASE_API_KEY`, etc.)

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to experience NavOk Heal.

## 🎨 UI & Design Principles

NavOk Heal utilizes a bespoke **"Healink" design system**:
*   **Color Palette:** Deep Teal (`#14332F`, `#2A6A5E`), Cream (`#FAF7F0`), and Soft Mint accents.
*   **Typography:** Plus Jakarta Sans (Primary UI) and Newsreader (Serif Accents for trust/clinical feel).
*   **Aesthetics:** Pill buttons, soft glows, micro-interactions, and a warm, non-clinical feel.

## 🛡️ Medical Disclaimer

*NavOk Heal provides educational guidance and intake organization only. It is not a substitute for professional medical advice, diagnosis, or emergency care. Always consult a qualified healthcare provider for medical decisions.*
