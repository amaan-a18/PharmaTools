// src/components/InteractionChecker.jsx
import React, { useState } from 'react';
import { checkInteractionsByName } from '../api/drugApi';
import toast from 'react-hot-toast';

const severityConfig = {
  'high': { color: 'var(--danger)', bg: 'var(--danger-dim)', badge: 'badge-danger', label: '🚨 HIGH' },
  'moderate': { color: 'var(--warn)', bg: 'var(--warn-dim)', badge: 'badge-warn', label: '⚠️ MODERATE' },
  'low': { color: 'var(--accent)', bg: 'var(--accent-dim)', badge: 'badge-success', label: 'ℹ️ LOW' },
  'unknown': { color: 'var(--text-muted)', bg: 'var(--surface2)', badge: 'badge-info', label: '? UNKNOWN' },
};

export default function InteractionChecker() {
  const [drugs, setDrugs] = useState(['', '', '']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [resolved, setResolved] = useState([]);

  const setDrug = (i, val) => {
    const next = [...drugs];
    next[i] = val;
    setDrugs(next);
  };

  const check = async () => {
    const entered = drugs.map(d => d.trim()).filter(Boolean);
    if (entered.length < 2) {
      toast.error('Please enter at least 2 drug names');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await checkInteractionsByName(entered);
      setResult(res.interactions || []);
      setResolved(res.resolved || []);
      if (res.error) toast.error(res.error);
    } catch (e) {
      toast.error('Failed to check interactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setDrugs(['', '', '']);
    setResult(null);
    setResolved([]);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Interaction Checker</h1>
        <p>Real-time drug-drug interaction checking via NLM RxNorm Interaction API</p>
      </div>

      <div className="disclaimer-bar">⚠️ This uses the NLM RxNorm Interaction API. For comprehensive checking use Lexicomp/Micromedex in clinical settings.</div>

      <div className="card mb-2">
        <div className="card-header"><span>⇌</span><h2>Enter Drugs to Check</h2></div>
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '600px' }}>
            {drugs.map((d, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-faint)', width: '55px', flexShrink: 0 }}>
                  Drug {i + 1}{i >= 2 ? ' (opt)' : ''}
                </span>
                <input
                  type="text"
                  value={d}
                  onChange={e => setDrug(i, e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && check()}
                  placeholder={i === 0 ? 'e.g. warfarin' : i === 1 ? 'e.g. aspirin' : 'Optional third drug...'}
                  style={{ flex: 1, padding: '0.75rem 1rem', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontFamily: 'var(--sans)', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.2rem' }}>
            <button className="btn btn-primary" onClick={check} disabled={loading}>
              {loading ? <><span className="spinner"></span> Checking…</> : '⇌ Check Interactions'}
            </button>
            <button className="btn btn-ghost" onClick={clear}>Clear</button>
          </div>

          <p className="text-xs text-muted mt-1">
            Try: <span style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => { setDrugs(['warfarin', 'aspirin', '']); }}>warfarin + aspirin</span>
            {' · '}
            <span style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => { setDrugs(['metformin', 'alcohol', '']); }}>metformin + alcohol</span>
            {' · '}
            <span style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => { setDrugs(['simvastatin', 'amlodipine', 'warfarin']); }}>simvastatin + amlodipine + warfarin</span>
          </p>
        </div>
      </div>

      {/* Resolved RxCUI info */}
      {resolved.length > 0 && (
        <div className="card mb-2">
          <div className="card-header"><span>🔗</span><h2>RxNorm Resolution</h2></div>
          <div className="card-body">
            <div style={{ display: 'flex', flex: 'wrap', gap: '0.6rem' }}>
              {resolved.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem 0.9rem' }}>
                  <span className="text-sm" style={{ fontWeight: '700' }}>{r.name}</span>
                  {r.rxcui
                    ? <span className="badge badge-success text-mono">RxCUI: {r.rxcui}</span>
                    : <span className="badge badge-danger">Not resolved</span>}
                </div>
              ))}
            </div>
            {resolved.some(r => !r.rxcui) && (
              <div className="alert alert-warn mt-2 text-sm">
                Some drugs could not be resolved to RxCUI. Try using the exact generic name (e.g., "acetaminophen" instead of "panadol").
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {result !== null && (
        <div className="card">
          <div className="card-header">
            <span>{result.length === 0 ? '✅' : result.some(r => r.severity?.toLowerCase() === 'high') ? '🚨' : '⚠️'}</span>
            <h2>
              {result.length === 0 ? 'No Interactions Found' : `${result.length} Interaction(s) Detected`}
            </h2>
          </div>
          <div className="card-body">
            {result.length === 0 ? (
              <div className="interaction-card interaction-none">
                <div className="interaction-title" style={{ color: 'var(--accent)' }}>✅ No known interactions detected</div>
                <div className="interaction-desc">No interactions were found in the RxNorm database between the entered drugs. This does not guarantee safety — always verify with a complete clinical database.</div>
              </div>
            ) : (
              result.map((inter, i) => {
                const sev = inter.severity?.toLowerCase() || 'unknown';
                const cfg = severityConfig[sev] || severityConfig.unknown;
                return (
                  <div key={i} style={{ background: cfg.bg, border: `1px solid ${cfg.color}33`, borderLeft: `4px solid ${cfg.color}`, borderRadius: 'var(--radius)', padding: '1rem 1.2rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {inter.drugs?.map((d, j) => (
                          <span key={j} className="tag tag-blue text-mono">{d.name}</span>
                        ))}
                      </div>
                      <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
                    </div>
                    <p style={{ fontSize: '0.87rem', color: 'var(--text)', lineHeight: 1.6 }}>{inter.description}</p>
                    {inter.source && <p className="text-xs text-muted mt-1">Source: {inter.source}</p>}
                  </div>
                );
              })
            )}

            <div className="alert alert-info mt-2 text-sm">
              <strong>💡 Clinical Note:</strong> The RxNorm Interaction API uses multiple sources including DrugBank, NDF-RT, and ONCHigh. For comprehensive interaction checking in clinical practice, use Lexicomp, Micromedex, or consult a clinical pharmacist.
            </div>
          </div>
        </div>
      )}

      {/* Reference table */}
      <div className="card mt-2">
        <div className="card-header"><span>📚</span><h2>Common High-Risk Interactions Reference</h2></div>
        <div className="card-body">
          {[
            { drugs: 'Warfarin + NSAIDs', risk: 'High', desc: 'Increased bleeding risk; NSAIDs inhibit platelet function and may increase warfarin absorption.' },
            { drugs: 'Statins + CYP3A4 inhibitors (clarithromycin, azole antifungals)', risk: 'High', desc: 'Greatly increased statin levels → rhabdomyolysis risk.' },
            { drugs: 'SSRIs + MAOIs', risk: 'High', desc: 'Serotonin syndrome — potentially fatal. Washout period required.' },
            { drugs: 'Methotrexate + NSAIDs', risk: 'High', desc: 'NSAIDs reduce methotrexate clearance → toxicity.' },
            { drugs: 'Clopidogrel + PPIs (omeprazole)', risk: 'Moderate', desc: 'Omeprazole reduces clopidogrel antiplatelet effect via CYP2C19 inhibition. Use pantoprazole instead.' },
            { drugs: 'ACE inhibitors + Potassium supplements/sparing diuretics', risk: 'Moderate', desc: 'Hyperkalemia risk — monitor serum potassium.' },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.75rem', background: i % 2 === 0 ? 'var(--bg)' : 'transparent', borderRadius: '6px', marginBottom: '0.3rem' }}>
              <span className={`badge ${row.risk === 'High' ? 'badge-danger' : 'badge-warn'}`} style={{ flexShrink: 0 }}>{row.risk}</span>
              <div>
                <div style={{ fontSize: '0.87rem', fontWeight: '700', marginBottom: '0.2rem', fontFamily: 'var(--mono)', color: 'var(--primary)' }}>{row.drugs}</div>
                <div className="text-sm text-muted">{row.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
