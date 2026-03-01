// src/components/ADRReporting.jsx
import React, { useState } from 'react';
import { getDrugADRs } from '../api/drugApi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

let reportCounter = 1;

export default function ADRReporting() {
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0] });
  const [severity, setSeverity] = useState('');
  const [reports, setReports] = useState([]);
  const [faersQuery, setFaersQuery] = useState('');
  const [faersResults, setFaersResults] = useState([]);
  const [faersLoading, setFaersLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const lookupFAERS = async () => {
    if (!faersQuery.trim()) return;
    setFaersLoading(true);
    setFaersResults([]);
    try {
      const data = await getDrugADRs(faersQuery, 15);
      setFaersResults(data);
      if (!data.length) toast('No FAERS data found for that drug name. Try the generic name.', { icon: 'ℹ️' });
    } catch {
      toast.error('FAERS lookup failed');
    } finally {
      setFaersLoading(false);
    }
  };

  const submit = () => {
    if (!form.patient || !form.drug || !form.description || !severity) {
      toast.error('Fill in patient initials, drug, reaction description, and severity.');
      return;
    }
    const id = `ADR-${String(reportCounter++).padStart(4, '0')}-${new Date().getFullYear()}`;
    const report = { ...form, severity, id, submittedAt: new Date().toLocaleString() };
    setReports(r => [report, ...r]);
    setForm({ date: new Date().toISOString().split('T')[0] });
    setSeverity('');
    toast.success(`Report ${id} submitted successfully!`);
  };

  const severityColor = { mild: 'var(--accent)', moderate: 'var(--warn)', severe: 'var(--danger)' };

  return (
    <div>
      <div className="page-header">
        <h1>ADR Reporting</h1>
        <p>Report adverse drug reactions and look up FAERS data</p>
      </div>

      <div className="disclaimer-bar">
        ⚠️ For official pharmacovigilance reporting: <strong>India PvPI: 1800-180-3024</strong> · <strong>FDA MedWatch: 1-800-FDA-1088</strong> · <strong>WHO VigiAccess: vigiaccess.org</strong>
      </div>

      {/* FAERS Lookup */}
      <div className="card mb-2">
        <div className="card-header"><span>🔍</span><h2>FDA FAERS Adverse Event Lookup</h2></div>
        <div className="card-body">
          <p className="text-sm text-muted mb-2">Look up real adverse event data from the FDA Adverse Event Reporting System (FAERS) database.</p>
          <div style={{ display: 'flex', gap: '0.75rem', maxWidth: '500px' }}>
            <input
              type="text"
              value={faersQuery}
              onChange={e => setFaersQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && lookupFAERS()}
              placeholder="Enter drug name (generic preferred)..."
              style={{ flex: 1, padding: '0.75rem 1rem', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontFamily: 'var(--sans)', fontSize: '0.9rem', outline: 'none' }}
            />
            <button className="btn btn-ghost" onClick={lookupFAERS} disabled={faersLoading}>
              {faersLoading ? <span className="spinner"></span> : '🔍'} Lookup FAERS
            </button>
          </div>

          {faersResults.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <p className="text-xs text-muted mb-2">Top reported adverse events for <strong>{faersQuery}</strong> in FAERS database:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {faersResults.map((r, i) => (
                  <div key={i} style={{
                    background: 'var(--surface2)', border: '1px solid var(--border)',
                    borderRadius: '6px', padding: '0.4rem 0.8rem',
                    display: 'flex', alignItems: 'center', gap: '0.6rem'
                  }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '600' }}>{r.term}</span>
                    <span style={{
                      fontSize: '0.7rem', background: 'var(--danger-dim)', color: 'var(--danger)',
                      border: '1px solid rgba(248,113,113,0.2)', borderRadius: '4px', padding: '0.1rem 0.4rem',
                      fontFamily: 'var(--mono)'
                    }}>{r.count?.toLocaleString()} reports</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted mt-2">Source: FDA FAERS Public Dashboard — reporting does not establish causality.</p>
            </div>
          )}
        </div>
      </div>

      {/* Report Form */}
      <div className="card mb-2">
        <div className="card-header"><span>⚑</span><h2>Submit ADR Report</h2></div>
        <div className="card-body">
          <div className="grid-2">
            <div className="form-group"><label>Patient Initials *</label><input type="text" placeholder="e.g. R.K." value={form.patient||''} onChange={e => set('patient', e.target.value)} /></div>
            <div className="form-group"><label>Age (years)</label><input type="number" placeholder="e.g. 45" value={form.age||''} onChange={e => set('age', e.target.value)} /></div>
            <div className="form-group">
              <label>Gender</label>
              <select value={form.gender||''} onChange={e => set('gender', e.target.value)}>
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div className="form-group"><label>Suspected Drug (+ dose) *</label><input type="text" placeholder="e.g. Amoxicillin 500mg" value={form.drug||''} onChange={e => set('drug', e.target.value)} /></div>
            <div className="form-group"><label>Date of Reaction</label><input type="date" value={form.date||''} onChange={e => set('date', e.target.value)} /></div>
            <div className="form-group"><label>Indication for Use</label><input type="text" placeholder="What was it prescribed for?" value={form.indication||''} onChange={e => set('indication', e.target.value)} /></div>
          </div>

          <div className="form-group">
            <label>Description of Adverse Reaction *</label>
            <textarea placeholder="Describe symptoms, onset, timeline, and any treatment given..." value={form.description||''} onChange={e => set('description', e.target.value)} rows={3} />
          </div>

          <div className="form-group">
            <label>Severity *</label>
            <div className="severity-grid">
              {['mild', 'moderate', 'severe'].map(s => (
                <button key={s} className={`severity-btn ${s} ${severity === s ? 'active' : ''}`} onClick={() => setSeverity(s)}>
                  {s === 'mild' ? '😟' : s === 'moderate' ? '😰' : '🚨'} {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Outcome</label>
              <select value={form.outcome||''} onChange={e => set('outcome', e.target.value)}>
                <option value="">Select outcome</option>
                <option>Recovered / Resolved</option>
                <option>Recovering</option>
                <option>Not recovered</option>
                <option>Recovered with sequelae</option>
                <option>Fatal</option>
                <option>Unknown</option>
              </select>
            </div>
            <div className="form-group">
              <label>Causality (WHO-UMC)</label>
              <select value={form.causality||''} onChange={e => set('causality', e.target.value)}>
                <option value="">Select</option>
                <option>Certain</option>
                <option>Probable / Likely</option>
                <option>Possible</option>
                <option>Unlikely</option>
                <option>Conditional / Unclassified</option>
                <option>Unassessable</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Concomitant Medications</label>
            <textarea placeholder="List other drugs the patient is taking..." value={form.concomitant||''} onChange={e => set('concomitant', e.target.value)} rows={2} />
          </div>

          <div className="form-group">
            <label>Reporter Name / Hospital</label>
            <input type="text" placeholder="Optional" value={form.reporter||''} onChange={e => set('reporter', e.target.value)} />
          </div>

          <button className="btn btn-danger" style={{ width: '100%', marginTop: '0.5rem' }} onClick={submit}>
            ⚑ Submit ADR Report
          </button>
        </div>
      </div>

      {/* Submitted reports */}
      <div className="card">
        <div className="card-header">
          <span>📋</span>
          <h2>Submitted Reports (Session)</h2>
          {reports.length > 0 && <span className="badge badge-danger" style={{ marginLeft: 'auto' }}>{reports.length}</span>}
        </div>
        <div className="card-body">
          {reports.length === 0 ? (
            <p className="text-sm text-muted" style={{ textAlign: 'center', padding: '1.5rem' }}>No reports submitted in this session.</p>
          ) : (
            reports.map(r => (
              <div key={r.id} className="adr-item">
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{r.drug}</div>
                  <div className="text-sm text-muted">Patient: {r.patient}, {r.age || '?'} yrs, {r.gender || '?'} · {r.date}</div>
                  <div className="text-sm" style={{ marginTop: '0.3rem' }}>{r.description}</div>
                  {r.outcome && <div className="text-xs text-muted" style={{ marginTop: '0.3rem' }}>Outcome: {r.outcome} · Causality: {r.causality || 'Not assessed'}</div>}
                  <div className="adr-item-id" style={{ marginTop: '0.4rem' }}>{r.id} · Submitted: {r.submittedAt}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', flexShrink: 0, marginLeft: '1rem' }}>
                  <span className={`badge badge-${r.severity === 'mild' ? 'success' : r.severity === 'moderate' ? 'warn' : 'danger'}`}>
                    {r.severity}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
