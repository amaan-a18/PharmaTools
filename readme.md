# PharmaDesk — Complete Build & Deploy Guide

## What You're Building
A full React web app with:
- 140,000+ real drug database (OpenFDA API — free, no key)
- Real drug-drug interaction checker (RxNorm NLM API — free, no key)
- FDA FAERS adverse event data lookup
- Dosage calculators (weight-based, BSA, renal, pediatric, IV drip)
- ADR reporting form with pharmacovigilance logs
- Clinical tools: BMI, CrCl, IBW, unit converter

---

## STEP 1 — Install Prerequisites

### Install Node.js (required)
1. Go to https://nodejs.org
2. Download and install the **LTS version** (e.g. 20.x)
3. Verify installation — open Terminal / Command Prompt:
```
node --version    # Should show v18 or v20
npm --version     # Should show 9 or 10
```

---

## STEP 2 — Set Up the Project

### Option A: Use the files provided (recommended)
1. Create a folder called `pharmatools` on your computer
2. Copy all the provided files into it, maintaining this structure:

```
pharmatools/
├── package.json
├── public/
│   └── index.html
└── src/
    ├── index.js
    ├── App.js
    ├── App.css
    ├── api/
    │   └── drugApi.js
    ├── hooks/
    │   └── useDrugSearch.js
    └── components/
        ├── Home.jsx
        ├── DrugDatabase.jsx
        ├── DosageCalculator.jsx
        ├── InteractionChecker.jsx
        ├── ADRReporting.jsx
        └── ClinicalTools.jsx
```

### Option B: Create fresh (if you want to start from scratch)
```bash
npx create-react-app pharmatools
cd pharmatools
# Then replace the src/ folder with the provided files
```

---

## STEP 3 — Install Dependencies

Open Terminal, navigate to your project folder:
```bash
cd pharmatools
npm install
```

This installs:
- `react` + `react-dom` — core React
- `react-router-dom` — page navigation
- `axios` — HTTP requests to APIs
- `react-hot-toast` — notifications
- `lucide-react` — icons
- `date-fns` — date formatting

If you get errors, try:
```bash
npm install --legacy-peer-deps
```

---

## STEP 4 — Run Locally

```bash
npm start
```

The app opens at **http://localhost:3000**

✅ You should see the PharmaDesk homepage with live API status indicators.

**Test the APIs:**
1. Go to "Drug Database" → Search "amoxicillin" → Should return real FDA drug labels
2. Go to "Interactions" → Enter "warfarin" + "aspirin" → Should return real interaction data
3. Go to "ADR Report" → Search "aspirin" in FAERS → Should return real adverse event data

---

## STEP 5 — Deploy to the Web (Free)

### Option A: Vercel (Easiest — 2 minutes)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? **pharmatools**
   - Directory? **./**
   - Override settings? **N**

4. Your site is live at: `https://pharmatools.vercel.app` (or similar)

### Option B: Netlify (Drag & Drop)

1. Build the production version:
```bash
npm run build
```
This creates a `build/` folder.

2. Go to https://netlify.com → Sign up free
3. Drag the `build/` folder onto the Netlify dashboard
4. Your site is live instantly!

### Option C: GitHub Pages

1. Install the deploy package:
```bash
npm install --save-dev gh-pages
```

2. Add to `package.json`:
```json
"homepage": "https://yourusername.github.io/pharmatools",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```

3. Deploy:
```bash
npm run deploy
```

---

## STEP 6 — Expand the Drug Database

The app already connects to 140,000+ FDA labels. To customize further:

### Add more API search fields (in src/api/drugApi.js)
```javascript
// Search by drug class
`openfda.pharm_class_epc:"antihypertensive"`

// Search by manufacturer
`openfda.manufacturer_name:"pfizer"`

// Search by NDC code
`openfda.package_ndc:"0069-0069"`
```

### Add an Indian drug database (CDSCO)
```javascript
// CDSCO APIs available at: https://cdsco.gov.in
// You can scrape or use their open data portal
const res = await fetch('https://cdsco.gov.in/opencms/opencms/en/api/...');
```

### Add more interaction sources
```javascript
// DrugBank (requires free API key at drugbank.com)
const res = await axios.get('https://api.drugbank.com/v1/drug_interactions', {
  headers: { Authorization: `Bearer YOUR_KEY` },
  params: { q: 'warfarin' }
});
```

---

## STEP 7 — Add a Backend (Optional, for user accounts / persistence)

For saving ADR reports permanently and user login:

### Install Express + MongoDB
```bash
mkdir pharmatools-backend
cd pharmatools-backend
npm init -y
npm install express mongoose cors dotenv jsonwebtoken bcryptjs
```

### Create server.js
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

// ADR Report schema
const ADRSchema = new mongoose.Schema({
  patient: String,
  drug: String,
  description: String,
  severity: String,
  date: Date,
  createdAt: { type: Date, default: Date.now }
});

const ADR = mongoose.model('ADR', ADRSchema);

app.post('/api/adr', async (req, res) => {
  const report = new ADR(req.body);
  await report.save();
  res.json({ success: true, id: report._id });
});

app.get('/api/adr', async (req, res) => {
  const reports = await ADR.find().sort({ createdAt: -1 });
  res.json(reports);
});

app.listen(5000, () => console.log('Backend running on port 5000'));
```

### Free MongoDB hosting: https://mongodb.com/atlas (512MB free)

---

## API Reference

| API | Purpose | Cost | Key Required |
|-----|---------|------|-------------|
| OpenFDA Drug Labels | Drug monographs, 140k+ drugs | Free | No |
| OpenFDA FAERS | Adverse event reports | Free | No |
| RxNorm NLM | Drug normalization, RxCUI | Free | No |
| RxNorm Interactions | Drug-drug interactions | Free | No |
| DrugBank | Extended interactions, metabolism | Free tier | Yes (free signup) |
| CDSCO India | Indian approved drugs | Free | No |

---

## Troubleshooting

**CORS errors in browser console:**
The FDA and RxNorm APIs support CORS, so this shouldn't happen. If it does:
```bash
npm install http-proxy-middleware
```
Add `src/setupProxy.js`:
```javascript
const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function(app) {
  app.use('/fda-api', createProxyMiddleware({ target: 'https://api.fda.gov', changeOrigin: true, pathRewrite: {'^/fda-api': ''} }));
};
```

**"Module not found" errors:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**API rate limiting (429 errors):**
OpenFDA allows 1000 requests/day without a key. Get a free key at:
https://open.fda.gov/apis/authentication/
Add to your requests: `?api_key=YOUR_KEY&search=...`

---

## File Structure Summary

```
src/
├── api/drugApi.js          ← All API calls (OpenFDA + RxNorm)
├── hooks/useDrugSearch.js  ← React hooks for search + autocomplete  
├── components/
│   ├── Home.jsx            ← Landing page
│   ├── DrugDatabase.jsx    ← FDA drug search + monographs
│   ├── DosageCalculator.jsx← 5 calculator types
│   ├── InteractionChecker.jsx ← RxNorm interaction API
│   ├── ADRReporting.jsx    ← ADR form + FAERS lookup
│   └── ClinicalTools.jsx   ← BMI, CrCl, BSA, IBW, converters
├── App.js                  ← Routing + navigation
└── App.css                 ← All styles
```
