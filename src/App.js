// src/App.js
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import PharmacyDatabase from './components/PharmacyDatabase';
import DrugDatabase from './components/DrugDatabase';
import DosageCalculator from './components/DosageCalculator';
import InteractionChecker from './components/InteractionChecker';
import ADRReporting from './components/ADRReporting';
import ClinicalTools from './components/ClinicalTools';
import Home from './components/Home';
import './App.css';

function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: '/',             label: 'Home',             icon: '⌂' },
    { to: '/pharmacy',     label: 'Drug Database',    icon: '💊' },
    { to: '/fda',          label: 'FDA Reference',    icon: '◉' },
    { to: '/dosage',       label: 'Dose Calculator',  icon: '⊡' },
    { to: '/interactions', label: 'Interactions',     icon: '⇌' },
    { to: '/adr',          label: 'ADR Report',       icon: '⚑' },
    { to: '/tools',        label: 'Clinical Tools',   icon: '⊞' },
  ];

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <div className="nav-logo">
          <span className="logo-mark">Rx</span>
          <span className="logo-text">PharmaDesk</span>
          <span className="logo-badge">Live</span>
        </div>
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <span className="nav-icon">{l.icon}</span>
              <span>{l.label}</span>
            </NavLink>
          ))}
        </div>
        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.9rem',
            background: '#1c2330',
            color: '#e2e8f0',
            border: '1px solid rgba(100,140,200,0.15)',
          },
        }}
      />
      <Nav />
      <main className="main-content">
        <Routes>
          <Route path="/"             element={<Home />} />
          <Route path="/pharmacy"     element={<PharmacyDatabase />} />
          <Route path="/fda"          element={<DrugDatabase />} />
          <Route path="/dosage"       element={<DosageCalculator />} />
          <Route path="/interactions" element={<InteractionChecker />} />
          <Route path="/adr"          element={<ADRReporting />} />
          <Route path="/tools"        element={<ClinicalTools />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <p>PharmaDesk — Drug Database · OpenFDA · RxNorm NLM · FAERS</p>
        <p className="footer-disclaimer">⚠️ Educational reference only. Not a substitute for professional clinical judgment. Verify with current prescribing information.</p>
        <p>ADR Reporting: <strong>PvPI 1800-180-3024</strong> · <strong>CDSCO 011-23236975</strong> · <strong>Jan Aushadhi 1800-180-8080</strong> · <strong>FDA MedWatch 1-800-FDA-1088</strong></p>
      </footer>
    </BrowserRouter>
  );
}

export default App;
