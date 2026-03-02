<h1 align="center"> 💊 PharmaTools </h1>

A **clinical-grade drug information & pharmacology toolkit** built with **React** using **real FDA & NLM APIs**.

> 🚀 No API keys required • Live drug data • Free deployment

---

## 🧠 What is PharmaTools?

**PharTools** is a web application designed for:
- Pharmacy students
- Medical students
- Clinicians
- Researchers

It provides **real-time drug data**, **interaction checks**, **dosage calculators**, and **clinical tools** in one place.

---

## 🧩 Features Overview
```
┌────────────────────────────┐
│ PharmaTools │
├────────────────────────────┤
│ 🔍 Drug Database (FDA) │
│ ⚠️ Drug Interactions │
│ 🧮 Dosage Calculators │
│ 🩺 Clinical Tools │
│ 📝 ADR Reporting (FAERS) │
└────────────────────────────┘
```

---


### ✅ Key Features
- 🔍 **140,000+ real drugs** (OpenFDA)
- ⚠️ **Drug–Drug Interaction Checker** (RxNorm)
- 🧮 **Dosage Calculators**
  - Weight-based
  - Pediatric
  - Renal (CrCl)
  - IV drip
  - BSA
- 📝 **ADR Reporting & FAERS Lookup**
- 🩺 **Clinical Tools**
  - BMI
  - Creatinine Clearance
  - Ideal Body Weight
  - Unit Converter

---

## 🛠 Tech Stack
```
Frontend
────────
⚛️ React
🧭 React Router
📡 Axios
🎨 CSS

APIs
────
🧬 OpenFDA (Drug Labels, FAERS)
💊 RxNorm (Interactions)
```


---

## 📁 Project Structure
```
pharmatools/
│
├── public/
│ └── index.html
│
├── src/
│ ├── api/
│ │ └── drugApi.js
│ │
│ ├── hooks/
│ │ └── useDrugSearch.js
│ │
│ ├── components/
│ │ ├── Home.jsx
│ │ ├── DrugDatabase.jsx
│ │ ├── InteractionChecker.jsx
│ │ ├── DosageCalculator.jsx
│ │ ├── ADRReporting.jsx
│ │ └── ClinicalTools.jsx
│ │
│ ├── App.js
│ ├── App.css
│ └── index.js
│
└── package.json
```

---

## 🚀 Getting Started

### 1️⃣ Install Node.js
- Download **Node LTS (v18 or v20)**  
👉 https://nodejs.org

Check installation:
```bash
node -v
npm -v
```
### 2️⃣ Install Dependencies
```
npm install
```
### 3️⃣ Run the App
```
npm start
```

---

## 🔐 APIs Used
| API | Purpose | Key |
| :--- | :---: | ---: |
| OpenFDA | Drug labels & FAERS | ❌ No |
| RxNorm | Drug interactions | ❌ No |
| DrugBank | Extended data | ✅ Optional |

---

## 👨‍💻 Author
Amaan A

Pharmacy + Tech Enthusiast 💊💻
