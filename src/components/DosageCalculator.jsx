// src/components/DosageCalculator.jsx
import React, { useState } from 'react';
import { dosageCalculators } from '../api/drugApi';

const calcTypes = [
  { id: 'weight', label: 'Weight-Based', icon: '⚖️' },
  { id: 'bsa', label: 'BSA-Based', icon: '📐' },
  { id: 'renal', label: 'Renal Adjustment', icon: '🫘' },
  { id: 'peds', label: 'Pediatric', icon: '👶' },
  { id: 'iv', label: 'IV Drip Rate', icon: '💉' },
];

export default function DosageCalculator() {
  const [type, setType] = useState('weight');
  const [form, setForm] = useState({});
  const [result, setResult] = useState(null);
  const [warning, setWarning] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const num = (k) => parseFloat(form[k]) || 0;

  const calculate = () => {
    setWarning('');
    try {
      if (type === 'weight') {
        const dose = num('dosePerKg'), wt = num('weight');
        if (!dose || !wt) return alert('Enter dose per kg and patient weight');
        const r = dosageCalculators.weightBased({ dosePerKg: dose, weight: wt, frequency: form.freq || 'OD' });
        setResult({
          primary: r.singleDose, primaryUnit: 'mg',
          label: 'Single Dose',
          extras: [
            { label: 'Daily Total', value: r.dailyDose, unit: 'mg' },
            { label: 'Frequency', value: form.freq || 'OD', unit: '' },
            { label: 'Patient Weight', value: wt, unit: 'kg' },
          ],
          note: `${dose} mg/kg × ${wt} kg = ${r.singleDose} mg`
        });
        if (wt > 120) setWarning('Consider using ideal body weight (IBW) for obese patients (BMI > 30).');
      } else if (type === 'bsa') {
        const dose = num('dosePerM2'), h = num('height'), w = num('weight');
        if (!dose || !h || !w) return alert('Enter all fields');
        const r = dosageCalculators.bsaBased({ dosePerM2: dose, height: h, weight: w });
        setResult({
          primary: r.dose, primaryUnit: 'mg',
          label: 'Total Dose',
          extras: [
            { label: 'BSA (Mosteller)', value: r.bsa, unit: 'm²' },
            { label: 'Dose per m²', value: dose, unit: 'mg/m²' },
          ],
          note: `BSA = √(H×W/3600) = ${r.bsa} m²`
        });
      } else if (type === 'renal') {
        const nd = num('normalDose'), crcl = num('crcl');
        if (!nd || !crcl) return alert('Enter normal dose and CrCl');
        const r = dosageCalculators.renalAdjustment({ normalDose: nd, crcl, renalFraction: parseFloat(form.renalFrac || 0.7) });
        setResult({
          primary: r.adjustedDose, primaryUnit: 'mg',
          label: 'Adjusted Dose',
          extras: [
            { label: 'Original Dose', value: nd, unit: 'mg' },
            { label: 'Dose Reduction', value: r.reduction, unit: '%' },
            { label: 'CrCl', value: crcl, unit: 'mL/min' },
          ],
          note: r.note
        });
        if (crcl < 15) setWarning('CRITICAL: CrCl < 15 mL/min. Most renally-cleared drugs should be avoided or require specialist input.');
        else if (crcl < 30) setWarning('Severe renal impairment. Major dose reduction required. Monitor closely.');
      } else if (type === 'peds') {
        const ad = num('adultDose'), age = num('age'), wt = num('childWeight');
        if (!ad || !age) return alert('Enter adult dose and child age');
        const r = dosageCalculators.pediatric({ adultDose: ad, age, weight: wt || 70 });
        setResult({
          primary: r.young, primaryUnit: 'mg',
          label: "Young's Rule",
          extras: [
            { label: "Clark's Rule (wt)", value: r.clark, unit: 'mg' },
            { label: "Dilling's Rule", value: r.dilling, unit: 'mg' },
            { label: 'Adult Dose', value: ad, unit: 'mg' },
          ],
          note: `Young's = (age/(age+12)) × adult dose`
        });
        if (age < 1) setWarning("Young's Rule is unreliable under 1 year. Use weight-based dosing and consult pediatric guidelines.");
        if (age > 12) setWarning("Young's Rule is designed for ages 1–12 years. Consider adult dosing for teenagers.");
      } else if (type === 'iv') {
        const vol = num('ivVol'), time = num('ivTime'), df = parseFloat(form.dropFactor || 20);
        if (!vol || !time) return alert('Enter volume and time');
        const r = dosageCalculators.ivDrip({ volume: vol, time, dropFactor: df });
        setResult({
          primary: r.gttsPerMin, primaryUnit: 'gtt/min',
          label: 'Drop Rate',
          extras: [
            { label: 'Flow Rate', value: r.mlPerHr, unit: 'mL/hr' },
            { label: 'Volume', value: vol, unit: 'mL' },
            { label: 'Infusion Time', value: time, unit: 'hours' },
          ],
          note: `(${vol} mL × ${df} gtt/mL) ÷ (${time} hr × 60 min)`
        });
      }
    } catch (e) {
      alert('Calculation error. Please check your inputs.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Dosage Calculator</h1>
        <p>Weight-based, BSA, renal adjustment, pediatric, and IV drip calculations</p>
      </div>

      <div className="disclaimer-bar">⚠️ Always verify calculated doses against current clinical guidelines and patient-specific factors.</div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {calcTypes.map(c => (
          <button
            key={c.id}
            className={`btn ${type === c.id ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setType(c.id); setResult(null); setWarning(''); setForm({}); }}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <div className="card-header"><span>📥</span><h2>Input Parameters</h2></div>
          <div className="card-body">

            {type === 'weight' && (
              <>
                <div className="form-group"><label>Dose (mg/kg)</label><input type="number" placeholder="e.g. 10" step="0.1" onChange={e => set('dosePerKg', e.target.value)} /></div>
                <div className="form-group"><label>Patient Weight (kg)</label><input type="number" placeholder="e.g. 70" step="0.1" onChange={e => set('weight', e.target.value)} /></div>
                <div className="form-group">
                  <label>Frequency</label>
                  <select onChange={e => set('freq', e.target.value)}>
                    <option value="OD">Once Daily (OD)</option>
                    <option value="BD">Twice Daily (BD)</option>
                    <option value="TDS">Three Times Daily (TDS)</option>
                    <option value="QID">Four Times Daily (QID)</option>
                    <option value="Q6H">Every 6 Hours (Q6H)</option>
                    <option value="Q8H">Every 8 Hours (Q8H)</option>
                    <option value="Q12H">Every 12 Hours (Q12H)</option>
                  </select>
                </div>
              </>
            )}

            {type === 'bsa' && (
              <>
                <div className="form-group"><label>Dose (mg/m²)</label><input type="number" placeholder="e.g. 100" onChange={e => set('dosePerM2', e.target.value)} /></div>
                <div className="form-group"><label>Height (cm)</label><input type="number" placeholder="e.g. 170" onChange={e => set('height', e.target.value)} /></div>
                <div className="form-group"><label>Weight (kg)</label><input type="number" placeholder="e.g. 70" onChange={e => set('weight', e.target.value)} /></div>
                <div className="alert alert-info text-sm">BSA-based dosing is commonly used in oncology/chemotherapy.</div>
              </>
            )}

            {type === 'renal' && (
              <>
                <div className="form-group"><label>Normal Dose (mg)</label><input type="number" placeholder="e.g. 500" onChange={e => set('normalDose', e.target.value)} /></div>
                <div className="form-group"><label>Creatinine Clearance (mL/min)</label><input type="number" placeholder="e.g. 45" step="0.1" onChange={e => set('crcl', e.target.value)} /></div>
                <div className="form-group">
                  <label>Renal Elimination Fraction</label>
                  <select onChange={e => set('renalFrac', e.target.value)}>
                    <option value="0.9">High (>70% renal) — e.g. aminoglycosides</option>
                    <option value="0.6" selected>Moderate (30–70%) — e.g. many antibiotics</option>
                    <option value="0.3">Low (&lt;30%) — e.g. hepatically metabolized</option>
                  </select>
                </div>
                <div className="alert alert-info text-sm">Use Cockcroft-Gault formula to estimate CrCl (see Clinical Tools).</div>
              </>
            )}

            {type === 'peds' && (
              <>
                <div className="form-group"><label>Adult Dose (mg)</label><input type="number" placeholder="e.g. 500" onChange={e => set('adultDose', e.target.value)} /></div>
                <div className="form-group"><label>Child Age (years)</label><input type="number" placeholder="e.g. 6" step="0.5" onChange={e => set('age', e.target.value)} /></div>
                <div className="form-group"><label>Child Weight (kg) — for Clark's Rule</label><input type="number" placeholder="e.g. 22" step="0.1" onChange={e => set('childWeight', e.target.value)} /></div>
                <div className="alert alert-warn text-sm">Young's Rule: valid for ages 1–12 only. Always cross-check with weight-based dosing.</div>
              </>
            )}

            {type === 'iv' && (
              <>
                <div className="form-group"><label>Total Volume (mL)</label><input type="number" placeholder="e.g. 500" onChange={e => set('ivVol', e.target.value)} /></div>
                <div className="form-group"><label>Infusion Time (hours)</label><input type="number" placeholder="e.g. 8" step="0.5" onChange={e => set('ivTime', e.target.value)} /></div>
                <div className="form-group">
                  <label>IV Set Drop Factor</label>
                  <select onChange={e => set('dropFactor', e.target.value)}>
                    <option value="20">20 gtt/mL — Macro drip (standard)</option>
                    <option value="15">15 gtt/mL — Macro drip</option>
                    <option value="10">10 gtt/mL — Macro drip</option>
                    <option value="60">60 gtt/mL — Micro drip (pediatric)</option>
                  </select>
                </div>
              </>
            )}

            <button className="btn btn-accent" style={{ width: '100%', marginTop: '0.5rem' }} onClick={calculate}>
              Calculate ⟶
            </button>
          </div>
        </div>

        <div>
          {result ? (
            <div className="result-box">
              <div className="result-label">{result.label}</div>
              <div>
                <span className="result-value">{result.primary}</span>
                <span className="result-unit">{result.primaryUnit}</span>
              </div>
              <div className="divider" style={{ margin: '1rem 0', background: 'rgba(255,255,255,0.08)' }}></div>
              <div className="result-grid">
                {result.extras?.map((e, i) => (
                  <div key={i} className="result-item">
                    <div className="label">{e.label}</div>
                    <div className="value" style={{ fontSize: e.value?.toString().length > 6 ? '1rem' : '1.4rem' }}>
                      {e.value} <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{e.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
              {result.note && <div className="result-note">Formula: {result.note}</div>}
            </div>
          ) : (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', textAlign: 'center', color: 'var(--text-faint)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⊡</div>
              <p>Fill in the inputs and click Calculate</p>
            </div>
          )}

          {warning && (
            <div className="alert alert-warn mt-2">
              ⚠️ {warning}
            </div>
          )}

          <div className="card mt-2">
            <div className="card-header"><span>📋</span><h2>Quick Reference</h2></div>
            <div className="card-body text-sm text-muted" style={{ lineHeight: 2 }}>
              <strong style={{ color: 'var(--text)' }}>CrCl Dosing Thresholds:</strong><br />
              ≥60 mL/min — Normal dose<br />
              30–59 — Reduce by 25–50%<br />
              15–29 — Reduce by 50–75%<br />
              &lt;15 — Avoid or specialist input<br />
              <div className="divider"></div>
              <strong style={{ color: 'var(--text)' }}>Common mg/kg doses:</strong><br />
              Amoxicillin: 25–50 mg/kg/day<br />
              Vancomycin: 15–20 mg/kg Q8-12H<br />
              Paracetamol: 10–15 mg/kg Q4-6H<br />
              Gentamicin: 5–7 mg/kg OD
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
