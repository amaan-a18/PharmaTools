// src/components/PharmacyDatabase.jsx
import React, { useState, useMemo } from 'react';
import { searchDrugs, pharmaDrugs, scheduleInfo, allCategories } from '../data/pharmaDrugs';

const typeStyle = {
  allopathy:  { color: '#60a5fa', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)',  label: 'Allopathy' },
  ayurveda:   { color: '#34d399', bg: 'rgba(16,217,160,0.1)', border: 'rgba(16,217,160,0.2)',  label: 'Ayurveda' },
  homeopathy: { color: '#c084fc', bg: 'rgba(192,132,252,0.1)',border: 'rgba(192,132,252,0.2)', label: 'Homeopathy' },
};

const schStyle = {
  OTC: { color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
  H:   { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  H1:  { color: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
  X:   { color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
};

function ExpandSection({ title, text, accent }) {
  return (
    <div>
      <div style={{ fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-faint)', marginBottom: '0.35rem' }}>{title}</div>
      <p style={{ fontSize: '0.82rem', lineHeight: 1.65, color: accent || 'var(--text-muted)' }}>{text || '—'}</p>
    </div>
  );
}

function DrugCard({ drug }) {
  const [open, setOpen] = useState(false);
  const ts = typeStyle[drug.type] || typeStyle.allopathy;
  const ss = schStyle[drug.schedule] || schStyle.H;

  return (
    <div
      onClick={() => setOpen(v => !v)}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${open ? ts.color : 'var(--border)'}`,
        borderLeft: `4px solid ${ts.color}`,
        borderRadius: '10px',
        marginBottom: '0.55rem',
        cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: open ? `0 4px 24px rgba(0,0,0,0.25), 0 0 0 1px ${ts.color}22` : 'none',
      }}
    >
      {/* ── HEADER ── */}
      <div style={{ padding: '0.85rem 1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.8rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, fontSize: '0.98rem' }}>{drug.brand}</span>
            {drug.nlem && (
              <span style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '4px', fontSize: '0.62rem', padding: '0.1rem 0.4rem', fontWeight: 700, letterSpacing: '0.04em' }}>
                ★ NLEM
              </span>
            )}
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.76rem', color: '#94a3b8', marginTop: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {drug.generic}
          </div>
          <div style={{ fontSize: '0.73rem', color: 'var(--text-faint)', marginTop: '0.1rem' }}>{drug.manufacturer}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem', flexShrink: 0 }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#10d9a0' }}>₹{drug.mrp}</div>
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <span style={{ ...ss, borderRadius: '4px', fontSize: '0.62rem', padding: '0.12rem 0.4rem', fontWeight: 700 }}>
              Sch. {drug.schedule}
            </span>
            <span style={{ background: ts.bg, color: ts.color, border: `1px solid ${ts.border}`, borderRadius: '4px', fontSize: '0.62rem', padding: '0.12rem 0.4rem', fontWeight: 700 }}>
              {ts.label}
            </span>
          </div>
          <span style={{ color: 'var(--text-faint)', fontSize: '0.8rem', marginTop: '0.1rem' }}>{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* ── EXPANDED ── */}
      {open && (
        <div onClick={e => e.stopPropagation()} style={{ padding: '0 1.1rem 1.1rem', borderTop: '1px solid var(--border)', animation: 'fadeIn 0.18s ease' }}>
          {/* Composition strip */}
          <div style={{ background: `linear-gradient(90deg, ${ts.bg}, transparent)`, borderRadius: '8px', padding: '0.75rem 0.9rem', marginTop: '0.8rem', marginBottom: '0.8rem', border: `1px solid ${ts.border}` }}>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-faint)', marginBottom: '0.3rem', fontWeight: 700 }}>💊 Composition</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.83rem', color: ts.color, fontWeight: 600, lineHeight: 1.5 }}>{drug.composition}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '0.25rem' }}>📦 {drug.pack}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
            <ExpandSection title="Indications" text={drug.indications} />
            <ExpandSection title="Dosage & Administration" text={drug.dosage} />
            <ExpandSection title="Adverse Effects" text={drug.sideEffects} accent="#f87171" />
            <ExpandSection title="Contraindications" text={drug.contraindications} accent="#fbbf24" />
          </div>

          <div style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>🌡️ {drug.storage}</span>
            <span style={{ fontSize: '0.68rem', fontFamily: 'var(--mono)', color: 'var(--text-faint)' }}>{drug.id}</span>
          </div>

          <div style={{ marginTop: '0.6rem', background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.12)', borderRadius: '6px', padding: '0.45rem 0.75rem', fontSize: '0.72rem', color: '#ca8a04' }}>
            ⚖️ <strong>Schedule {drug.schedule}:</strong> {scheduleInfo[drug.schedule]}
          </div>
        </div>
      )}
    </div>
  );
}

const ALL_TYPES = [
  { value: 'all',        label: '🏥 All Types' },
  { value: 'allopathy',  label: '💊 Allopathy' },
  { value: 'ayurveda',   label: '🌿 Ayurveda' },
  { value: 'homeopathy', label: '⚗️ Homeopathy' },
];

export default function PharmacyDatabase() {
  const [query, setQuery]           = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [catFilter, setCatFilter]   = useState('all');
  const [schFilter, setSchFilter]   = useState('all');
  const [nlemOnly, setNlemOnly]     = useState(false);

  const results = useMemo(() => searchDrugs(query, {
    type: typeFilter,
    category: catFilter,
    schedule: schFilter,
    nlemOnly,
  }), [query, typeFilter, catFilter, schFilter, nlemOnly]);

  const stats = useMemo(() => ({
    total:       pharmaDrugs.length,
    allopathy:   pharmaDrugs.filter(d => d.type === 'allopathy').length,
    ayurveda:    pharmaDrugs.filter(d => d.type === 'ayurveda').length,
    homeopathy:  pharmaDrugs.filter(d => d.type === 'homeopathy').length,
    nlem:        pharmaDrugs.filter(d => d.nlem).length,
  }), []);

  const quickSearches = ['Dolo 650','Calpol','Combiflam','Telekast','Montair','Crocin','Azithral','Augmentin','Pan 40','Atorva','Metformin','Asthalin','Cetirizine','Warfarin','Liv.52','Ashwagandha'];

  const clearFilters = () => { setQuery(''); setTypeFilter('all'); setCatFilter('all'); setSchFilter('all'); setNlemOnly(false); };
  const hasFilters   = query || typeFilter !== 'all' || catFilter !== 'all' || schFilter !== 'all' || nlemOnly;

  return (
    <div>
      <div className="page-header">
        <h1>Pharmacy Drug Database</h1>
        <p>Brand names · Generic compositions · MRP · Manufacturers · Drug schedules · NLEM 2022</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '0.65rem', marginBottom: '1.2rem' }}>
        {[
          { label: 'Total Drugs', val: stats.total,      color: 'var(--primary)' },
          { label: 'Allopathy',   val: stats.allopathy,  color: '#60a5fa' },
          { label: 'Ayurveda',    val: stats.ayurveda,   color: '#34d399' },
          { label: 'Homeopathy',  val: stats.homeopathy, color: '#c084fc' },
          { label: 'NLEM 2022',   val: stats.nlem,       color: '#fbbf24' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '0.1rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-body">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by brand, generic, composition, manufacturer, or indication..."
            style={{ width: '100%', padding: '0.85rem 1rem', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontFamily: 'var(--sans)', fontSize: '0.95rem', outline: 'none', marginBottom: '0.75rem' }}
          />

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Type */}
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {ALL_TYPES.map(t => (
                <button key={t.value}
                  onClick={() => setTypeFilter(t.value)}
                  className={`btn btn-sm ${typeFilter === t.value ? 'btn-primary' : 'btn-ghost'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Schedule */}
            <select value={schFilter} onChange={e => setSchFilter(e.target.value)}
              style={{ padding: '0.42rem 0.75rem', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontFamily: 'var(--sans)', fontSize: '0.8rem', outline: 'none' }}>
              <option value="all">All Schedules</option>
              <option value="OTC">OTC (No Rx)</option>
              <option value="H">Schedule H (Rx)</option>
              <option value="H1">Schedule H1 (Controlled Rx)</option>
            </select>

            {/* Category */}
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
              style={{ padding: '0.42rem 0.75rem', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontFamily: 'var(--sans)', fontSize: '0.8rem', outline: 'none', maxWidth: '230px' }}>
              <option value="all">All Categories</option>
              {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* NLEM */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem', color: '#fbbf24', whiteSpace: 'nowrap' }}>
              <input type="checkbox" checked={nlemOnly} onChange={e => setNlemOnly(e.target.checked)} style={{ accentColor: '#fbbf24', width: '14px', height: '14px' }} />
              ★ NLEM Only
            </label>

            {hasFilters && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>✕ Clear</button>
            )}
          </div>

          {/* Quick search */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.75rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>Quick search:</span>
            {quickSearches.map(s => (
              <span key={s} onClick={() => setQuery(s)}
                style={{ cursor: 'pointer', fontSize: '0.74rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0.18rem 0.55rem', color: 'var(--primary)', transition: 'all 0.15s', userSelect: 'none' }}
                onMouseEnter={e => e.target.style.borderColor = 'var(--primary)'}
                onMouseLeave={e => e.target.style.borderColor = 'var(--border)'}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Results header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.7rem' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Showing <strong style={{ color: 'var(--text)' }}>{results.length}</strong> of {pharmaDrugs.length} drugs
          {nlemOnly && <span style={{ color: '#fbbf24', marginLeft: '0.3rem' }}>· NLEM 2022 only</span>}
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>Click any drug to expand</span>
      </div>

      {/* Drug list */}
      {results.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-faint)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <p>No drugs found. Try a different name or composition.</p>
        </div>
      ) : (
        results.map(drug => <DrugCard key={drug.id} drug={drug} />)
      )}

      {/* Info footer */}
      <div className="card mt-3">
        <div className="card-header"><span>📋</span><h2>Drug Schedules & Regulatory Information</h2></div>
        <div className="card-body">
          <div className="grid-2">
            <div>
              <h4 style={{ fontSize: '0.8rem', color: '#fbbf24', marginBottom: '0.6rem', fontFamily: 'var(--mono)' }}>★ NLEM 2022 — National List of Essential Medicines</h4>
              <p className="text-sm text-muted" style={{ lineHeight: 1.8 }}>
                The NLEM 2022 (MoHFW, Government of India) lists <strong style={{ color: 'var(--text)' }}>384 essential medicines</strong> to meet priority public health needs. These are available at government health facilities and are price-regulated under DPCO 2013. Drugs marked ★ NLEM are considered essential for the healthcare system.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '0.6rem', fontFamily: 'var(--mono)' }}>Drug Schedules (Drugs & Cosmetics Act, 1940)</h4>
              {Object.entries(scheduleInfo).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', alignItems: 'flex-start' }}>
                  <span style={{ ...(schStyle[k] || {}), borderRadius: '4px', padding: '0.1rem 0.4rem', fontSize: '0.68rem', fontWeight: 700, flexShrink: 0 }}>{k}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '1rem', background: 'var(--bg)', borderRadius: '8px', padding: '0.85rem 1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 2.1 }}>
              <strong style={{ color: 'var(--text)' }}>📞 Important Helplines:</strong><br />
              🔴 <strong>PvPI (ADR Reporting):</strong> 1800-180-3024 (Toll free) &nbsp;|&nbsp; pvpi@ipc.gov.in<br />
              🟠 <strong>CDSCO (Drug Regulation):</strong> 011-23236975 &nbsp;|&nbsp; cdsco@nic.in<br />
              🟢 <strong>Jan Aushadhi (Generic Drugs):</strong> 1800-180-8080 &nbsp;|&nbsp; janaushadhi.gov.in<br />
              🔵 <strong>NPPA (Drug Prices):</strong> 1800-111-255 &nbsp;|&nbsp; nppa.gov.in<br />
              🟡 <strong>Ayush Helpline:</strong> 14429
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
