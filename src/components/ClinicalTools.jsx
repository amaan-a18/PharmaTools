// src/components/ClinicalTools.jsx
import React, { useState } from 'react';
import { dosageCalculators } from '../api/drugApi';

function MiniTool({ icon, title, children }) {
  return (
    <div className="mini-card">
      <div className="mini-card-header">{icon} {title}</div>
      <div className="mini-card-body">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      {children}
    </div>
  );
}

function Result({ value, color = 'var(--accent)', label = '' }) {
  if (!value) return null;
  return (
    <div className="mini-result" style={{ color }}>
      {value} {label && <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{label}</span>}
    </div>
  );
}

export default function ClinicalTools() {
  // BMI
  const [bmiW, setBmiW] = useState(''); const [bmiH, setBmiH] = useState(''); const [bmiR, setBmiR] = useState(null);
  const calcBMI = () => {
    const bmi = dosageCalculators.bmi({ weight: +bmiW, height: +bmiH });
    const cat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : bmi < 35 ? 'Obese I' : bmi < 40 ? 'Obese II' : 'Obese III';
    const color = bmi < 18.5 ? '#60a5fa' : bmi < 25 ? 'var(--accent)' : bmi < 30 ? 'var(--warn)' : 'var(--danger)';
    setBmiR({ val: `${bmi} — ${cat}`, color });
  };

  // CrCl
  const [cgAge, setCgAge] = useState(''); const [cgWt, setCgWt] = useState('');
  const [cgScr, setCgScr] = useState(''); const [cgSex, setCgSex] = useState('male');
  const [cgR, setCgR] = useState(null);
  const calcCrCl = () => {
    const crcl = dosageCalculators.crcl({ age: +cgAge, weight: +cgWt, scr: +cgScr, sex: cgSex });
    const note = crcl >= 90 ? 'Normal' : crcl >= 60 ? 'Mildly reduced' : crcl >= 30 ? 'Mod. reduced' : crcl >= 15 ? 'Severely reduced' : 'Renal failure';
    const color = crcl >= 60 ? 'var(--accent)' : crcl >= 30 ? 'var(--warn)' : 'var(--danger)';
    setCgR({ val: `${crcl} mL/min — ${note}`, color });
  };

  // BSA
  const [bsaH, setBsaH] = useState(''); const [bsaW, setBsaW] = useState(''); const [bsaR, setBsaR] = useState(null);
  const calcBSA = () => setBsaR(dosageCalculators.bsa({ height: +bsaH, weight: +bsaW }));

  // IBW
  const [ibwH, setIbwH] = useState(''); const [ibwSex, setIbwSex] = useState('male'); const [ibwR, setIbwR] = useState(null);
  const calcIBW = () => setIbwR(dosageCalculators.ibw({ height: +ibwH, sex: ibwSex }));

  // Unit converter
  const units = { mcg: 0.001, mg: 1, g: 1000, kg: 1000000 };
  const [convVal, setConvVal] = useState(''); const [convFrom, setConvFrom] = useState('mg'); const [convTo, setConvTo] = useState('mcg'); const [convR, setConvR] = useState(null);
  const convert = () => {
    const inMg = +convVal * units[convFrom];
    const result = inMg / units[convTo];
    setConvR(`${result.toLocaleString(undefined, { maximumSignificantDigits: 7 })} ${convTo}`);
  };

  // Infusion concentration
  const [infDrug, setInfDrug] = useState(''); const [infVol, setInfVol] = useState(''); const [infR, setInfR] = useState(null);
  const calcConc = () => {
    if (!infDrug || !infVol) return;
    const conc = (+infDrug / +infVol) * 1000;
    setInfR(`${conc.toFixed(2)} mcg/mL`);
  };

  // Quick reference
  const refRanges = [
    { label: 'Serum Creatinine', normal: '0.6–1.2 mg/dL (male), 0.5–1.1 (female)', flag: '>1.5 watch renal function' },
    { label: 'INR (therapeutic)', normal: '2.0–3.0 (most indications)', flag: '>3.5 risk of bleeding' },
    { label: 'Potassium', normal: '3.5–5.0 mEq/L', flag: '<3 or >5.5 arrhythmia risk' },
    { label: 'Sodium', normal: '135–145 mEq/L', flag: '<130 or >150 critical' },
    { label: 'Blood Glucose (fasting)', normal: '70–100 mg/dL', flag: '>126 diabetes threshold' },
    { label: 'HbA1c', normal: '<5.7% (normal)', flag: '≥6.5% diabetes diagnosis' },
    { label: 'eGFR', normal: '>60 mL/min/1.73m²', flag: '<30 significant CKD' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Clinical Tools</h1>
        <p>Calculators, converters, and quick reference for clinical pharmacy</p>
      </div>

      <div className="tools-grid">
        <MiniTool icon="📏" title="BMI Calculator">
          <Field label="Weight (kg)"><input type="number" placeholder="70" value={bmiW} onChange={e => setBmiW(e.target.value)} /></Field>
          <Field label="Height (cm)"><input type="number" placeholder="170" value={bmiH} onChange={e => setBmiH(e.target.value)} /></Field>
          <button className="btn btn-accent btn-sm" onClick={calcBMI} style={{ width: '100%' }}>Calculate BMI</button>
          {bmiR && <Result value={bmiR.val} color={bmiR.color} />}
        </MiniTool>

        <MiniTool icon="🫘" title="Creatinine Clearance (Cockcroft-Gault)">
          <div className="grid-2">
            <Field label="Age (yrs)"><input type="number" placeholder="55" value={cgAge} onChange={e => setCgAge(e.target.value)} /></Field>
            <Field label="Weight (kg)"><input type="number" placeholder="70" value={cgWt} onChange={e => setCgWt(e.target.value)} /></Field>
          </div>
          <Field label="Serum Creatinine (mg/dL)"><input type="number" placeholder="1.2" step="0.01" value={cgScr} onChange={e => setCgScr(e.target.value)} /></Field>
          <Field label="Sex">
            <select value={cgSex} onChange={e => setCgSex(e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female (×0.85 correction)</option>
            </select>
          </Field>
          <button className="btn btn-accent btn-sm" onClick={calcCrCl} style={{ width: '100%' }}>Calculate CrCl</button>
          {cgR && <Result value={cgR.val} color={cgR.color} />}
          <p className="text-xs text-muted mt-1">Formula: (140−age)×weight×0.85(F) / (72×SCr)</p>
        </MiniTool>

        <MiniTool icon="📐" title="Body Surface Area (Mosteller)">
          <Field label="Height (cm)"><input type="number" placeholder="170" value={bsaH} onChange={e => setBsaH(e.target.value)} /></Field>
          <Field label="Weight (kg)"><input type="number" placeholder="70" value={bsaW} onChange={e => setBsaW(e.target.value)} /></Field>
          <button className="btn btn-accent btn-sm" onClick={calcBSA} style={{ width: '100%' }}>Calculate BSA</button>
          {bsaR && <Result value={`${bsaR} m²`} color="var(--primary)" />}
          <p className="text-xs text-muted mt-1">Mosteller: √(H×W / 3600)</p>
        </MiniTool>

        <MiniTool icon="⚖️" title="Ideal Body Weight (Devine)">
          <Field label="Height (cm)"><input type="number" placeholder="170" value={ibwH} onChange={e => setIbwH(e.target.value)} /></Field>
          <Field label="Sex">
            <select value={ibwSex} onChange={e => setIbwSex(e.target.value)}>
              <option value="male">Male: 50 + 2.3×(inches over 5ft)</option>
              <option value="female">Female: 45.5 + 2.3×(inches over 5ft)</option>
            </select>
          </Field>
          <button className="btn btn-accent btn-sm" onClick={calcIBW} style={{ width: '100%' }}>Calculate IBW</button>
          {ibwR && <Result value={`${ibwR} kg`} color="var(--primary)" />}
        </MiniTool>

        <MiniTool icon="🔄" title="Drug Unit Converter">
          <Field label="Value"><input type="number" placeholder="500" value={convVal} onChange={e => setConvVal(e.target.value)} /></Field>
          <div className="grid-2">
            <Field label="From">
              <select value={convFrom} onChange={e => setConvFrom(e.target.value)}>
                <option value="mcg">mcg (microgram)</option>
                <option value="mg">mg (milligram)</option>
                <option value="g">g (gram)</option>
                <option value="kg">kg (kilogram)</option>
              </select>
            </Field>
            <Field label="To">
              <select value={convTo} onChange={e => setConvTo(e.target.value)}>
                <option value="mcg">mcg</option>
                <option value="mg">mg</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
              </select>
            </Field>
          </div>
          <button className="btn btn-accent btn-sm" onClick={convert} style={{ width: '100%' }}>Convert</button>
          {convR && <Result value={convR} color="var(--accent)" />}
        </MiniTool>

        <MiniTool icon="💉" title="Infusion Concentration">
          <Field label="Drug Amount (mg)"><input type="number" placeholder="e.g. 500" value={infDrug} onChange={e => setInfDrug(e.target.value)} /></Field>
          <Field label="Diluent Volume (mL)"><input type="number" placeholder="e.g. 250" value={infVol} onChange={e => setInfVol(e.target.value)} /></Field>
          <button className="btn btn-accent btn-sm" onClick={calcConc} style={{ width: '100%' }}>Calculate Concentration</button>
          {infR && <Result value={infR} color="var(--primary)" />}
          <p className="text-xs text-muted mt-1">Useful for setting infusion pump rates</p>
        </MiniTool>
      </div>

      {/* Reference Ranges */}
      <div className="card mt-2">
        <div className="card-header"><span>📊</span><h2>Clinical Reference Ranges</h2></div>
        <div className="card-body">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '0.6rem 0.8rem', color: 'var(--text-faint)', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Parameter</th>
                  <th style={{ textAlign: 'left', padding: '0.6rem 0.8rem', color: 'var(--text-faint)', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Normal Range</th>
                  <th style={{ textAlign: 'left', padding: '0.6rem 0.8rem', color: 'var(--text-faint)', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Clinical Flag</th>
                </tr>
              </thead>
              <tbody>
                {refRanges.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--bg)' : 'transparent' }}>
                    <td style={{ padding: '0.65rem 0.8rem', fontWeight: 600, color: 'var(--text)' }}>{r.label}</td>
                    <td style={{ padding: '0.65rem 0.8rem', fontFamily: 'var(--mono)', fontSize: '0.82rem', color: 'var(--accent)' }}>{r.normal}</td>
                    <td style={{ padding: '0.65rem 0.8rem', fontSize: '0.82rem', color: 'var(--warn)' }}>⚠️ {r.flag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
