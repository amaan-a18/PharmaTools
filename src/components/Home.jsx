// src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const cards = [
  {
    to: '/pharmacy', icon: '💊', color: '#10d9a0',
    title: 'Drug Database',
    desc: '106 drugs — brand names, generic compositions, MRP (₹), manufacturers, NLEM 2022 status, allopathy, ayurveda & homeopathy.',
  },
  {
    to: '/fda', icon: '◉', color: '#3b82f6',
    title: 'FDA Drug Reference',
    desc: 'Search 140,000+ FDA drug labels in real-time via OpenFDA. Full monographs, mechanisms, warnings.',
  },
  {
    to: '/dosage', icon: '⊡', color: '#a78bfa',
    title: 'Dosage Calculator',
    desc: 'Weight-based, BSA, renal dose adjustment, pediatric rules (Young\'s, Clark\'s), and IV drip rate.',
  },
  {
    to: '/interactions', icon: '⇌', color: '#fbbf24',
    title: 'Interaction Checker',
    desc: 'Real-time drug-drug interaction checking via NLM RxNorm API. Severity classification, clinical notes.',
  },
  {
    to: '/adr', icon: '⚑', color: '#f87171',
    title: 'ADR Reporting',
    desc: 'Report adverse drug reactions. FDA FAERS data lookup, WHO-UMC causality assessment, PvPI submission.',
  },
  {
    to: '/tools', icon: '⊞', color: '#fb923c',
    title: 'Clinical Tools',
    desc: 'BMI, CrCl (Cockcroft-Gault), BSA (Mosteller), IBW (Devine), infusion concentration, unit converter.',
  },
];

export default function Home() {
  return (
    <div>
      <div className="hero-section">
        <h1>Clinical Pharmacy<br /><span className="hl">Toolkit</span></h1>
        <p>Drug database with brand names, compositions & MRP — plus live OpenFDA and RxNorm APIs. Built for pharmacists, clinicians and students.</p>
        <div className="api-pills" style={{ marginTop: '1.2rem' }}>
          <div className="api-pill"><span className="dot"></span>Local Drug Database</div>
          <div className="api-pill"><span className="dot"></span>OpenFDA Labels API</div>
          <div className="api-pill"><span className="dot"></span>RxNorm Interactions</div>
          <div className="api-pill"><span className="dot"></span>FAERS Adverse Events</div>
          <div className="api-pill" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
            <span className="dot" style={{ background: '#fbbf24' }}></span>NLEM 2022
          </div>
        </div>
      </div>

      <div className="disclaimer-bar">
        ⚠️ <strong>Educational Reference Only</strong> — Not a substitute for professional clinical judgment. Always verify with current prescribing information.
      </div>

      <div className="home-grid">
        {cards.map(c => (
          <Link key={c.to} to={c.to} className="home-card">
            <div className="home-card-icon" style={{ background: c.color + '18', color: c.color, fontSize: '1.5rem' }}>
              {c.icon}
            </div>
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--display)', fontSize: '1.15rem', marginBottom: '0.9rem' }}>Database Coverage</h2>
        <div className="grid-2">
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--accent)', marginBottom: '0.5rem', fontFamily: 'var(--mono)' }}>Drug Database Highlights</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 2.1 }}>
              <li>✅ Brand names (Dolo 650, Calpol, Combiflam, Telekast L, Montair LC…)</li>
              <li>✅ Generic composition with exact strengths</li>
              <li>✅ MRP in ₹ and pack details</li>
              <li>✅ Manufacturer (Sun Pharma, Cipla, Mankind, GSK, Abbott…)</li>
              <li>✅ Drug schedule (OTC / H / H1)</li>
              <li>✅ NLEM 2022 — National List of Essential Medicines</li>
              <li>✅ Allopathy · Ayurveda · Homeopathy</li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '0.5rem', fontFamily: 'var(--mono)' }}>Therapeutic Categories</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 2.1 }}>
              <li>🦠 Antibiotics — Augmentin, Azithral, Cifran, Taxim-O, Novamox</li>
              <li>💊 Analgesics — Dolo 650, Calpol, Combiflam, Brufen, Nimulid</li>
              <li>❤️ Cardiac — Ecosprin, Clopilet, Sorbitrate, Warfarin, Atenolol</li>
              <li>🫁 Respiratory — Asthalin, Seroflo, Telekast L, Montair, Budecort</li>
              <li>🩺 Endocrine — Glycomet, Thyronorm, Amaryl, Forxiga, Lantus</li>
              <li>🌿 Ayurveda — Liv.52, Ashwagandha, Triphala, Septilin, Cystone</li>
              <li>⚗️ Homeopathy — Arnica, Bakson formulae</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
