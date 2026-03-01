// src/components/DrugDatabase.jsx
import React, { useState, useRef } from 'react';
import { useDrugSearch, useAutocomplete } from '../hooks/useDrugSearch';

function truncate(str, n = 300) {
  if (!str) return '—';
  return str.length > n ? str.slice(0, n) + '…' : str;
}

function DrugCard({ drug }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`drug-card ${open ? 'expanded' : ''}`} onClick={() => setOpen(!open)}>
      <div className="drug-card-header">
        <div>
          <div className="drug-name">{drug.brandName}</div>
          <div className="drug-generic">{drug.genericName}</div>
        </div>
        <div className="drug-meta">
          {drug.route && <span className="badge badge-info">{drug.route}</span>}
          {drug.productType && <span className="tag tag-blue text-mono" style={{fontSize:'0.7rem'}}>{drug.productType}</span>}
          <span style={{ color: 'var(--text-faint)', fontSize: '1.2rem', marginLeft: '0.3rem' }}>
            {open ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {open && (
        <div className="drug-body" onClick={e => e.stopPropagation()}>
          {drug.manufacturer !== 'Unknown' && (
            <p className="text-xs text-muted mt-1">Manufacturer: <strong>{drug.manufacturer}</strong>{drug.ndc ? ` · NDC: ${drug.ndc}` : ''}</p>
          )}

          {drug.substanceName?.length > 0 && (
            <div className="mt-2">
              <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-faint)', marginBottom: '0.4rem' }}>Active Substance(s)</h4>
              <div>{drug.substanceName.map((s, i) => <span key={i} className="tag tag-green text-mono">{s}</span>)}</div>
            </div>
          )}

          <div className="drug-body-grid">
            {drug.indications && (
              <div className="drug-section">
                <h4>Indications & Usage</h4>
                <p>{truncate(drug.indications, 400)}</p>
              </div>
            )}
            {drug.dosageAdmin && (
              <div className="drug-section">
                <h4>Dosage & Administration</h4>
                <p className="mono-text">{truncate(drug.dosageAdmin, 400)}</p>
              </div>
            )}
            {drug.contraindications && (
              <div className="drug-section">
                <h4>Contraindications</h4>
                <p style={{ color: 'var(--danger)', opacity: 0.9 }}>{truncate(drug.contraindications, 300)}</p>
              </div>
            )}
            {drug.adverseReactions && (
              <div className="drug-section">
                <h4>Adverse Reactions</h4>
                <p>{truncate(drug.adverseReactions, 300)}</p>
              </div>
            )}
            {drug.warnings && (
              <div className="drug-section">
                <h4>Warnings</h4>
                <p style={{ color: 'var(--warn)', opacity: 0.85 }}>{truncate(drug.warnings, 300)}</p>
              </div>
            )}
            {drug.mechanism && (
              <div className="drug-section">
                <h4>Mechanism of Action</h4>
                <p>{truncate(drug.mechanism, 350)}</p>
              </div>
            )}
            {drug.drugInteractions && (
              <div className="drug-section">
                <h4>Drug Interactions</h4>
                <p>{truncate(drug.drugInteractions, 300)}</p>
              </div>
            )}
            {drug.pharmacokinetics && (
              <div className="drug-section">
                <h4>Pharmacokinetics</h4>
                <p>{truncate(drug.pharmacokinetics, 300)}</p>
              </div>
            )}
          </div>

          {drug.overdosage && (
            <div className="mt-2 alert alert-danger text-sm">
              <strong>Overdosage:</strong> {truncate(drug.overdosage, 250)}
            </div>
          )}

          <div className="mt-2 text-xs text-muted">
            Source: OpenFDA Drug Label · Set ID: {drug.id || 'N/A'}
            {drug.rxcui && <span> · RxCUI: <span className="text-mono">{drug.rxcui}</span></span>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DrugDatabase() {
  const [query, setQuery] = useState('');
  const { results, loading, error, search } = useDrugSearch();
  const { suggestions, getSuggestions, clear } = useAutocomplete();
  const [showSugg, setShowSugg] = useState(false);
  const inputRef = useRef(null);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    getSuggestions(val);
    setShowSugg(true);
  };

  const handleSearch = () => {
    clear(); setShowSugg(false);
    search(query);
  };

  const selectSuggestion = (s) => {
    setQuery(s); clear(); setShowSugg(false);
    search(s);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') { clear(); setShowSugg(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Drug Database</h1>
        <p>Search 140,000+ FDA-approved drug labels in real time</p>
      </div>

      <div className="disclaimer-bar">⚠️ Data sourced from OpenFDA. Always verify with current prescribing information.</div>

      <div className="card mb-2">
        <div className="card-body">
          <div className="search-wrap">
            <div className="search-input-row">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInput}
                onKeyDown={handleKey}
                onFocus={() => setShowSugg(true)}
                onBlur={() => setTimeout(() => setShowSugg(false), 200)}
                placeholder="Search by brand name, generic name, or active ingredient..."
                style={{ padding: '0.85rem 1rem', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontFamily: 'var(--sans)', fontSize: '0.95rem', outline: 'none', flex: 1 }}
              />
              <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
                {loading ? <span className="spinner"></span> : '🔍'} Search
              </button>
            </div>

            {showSugg && suggestions.length > 0 && (
              <div className="autocomplete-dropdown">
                {suggestions.map((s, i) => (
                  <div key={i} className="autocomplete-item" onMouseDown={() => selectSuggestion(s)}>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.85rem' }}>💊</span>
                    <span style={{ fontSize: '0.88rem' }}>{s}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-muted mt-1">
            Try: <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => { setQuery('amoxicillin'); search('amoxicillin'); }}>amoxicillin</span>
            {' · '}
            <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => { setQuery('metformin'); search('metformin'); }}>metformin</span>
            {' · '}
            <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => { setQuery('lisinopril'); search('lisinopril'); }}>lisinopril</span>
            {' · '}
            <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => { setQuery('atorvastatin'); search('atorvastatin'); }}>atorvastatin</span>
          </p>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <span className="spinner"></span>
          Searching OpenFDA drug label database…
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && results.length > 0 && (
        <div>
          <p className="text-xs text-muted mb-2" style={{ marginBottom: '0.8rem' }}>
            {results.length} results · Click a drug to expand full monograph
          </p>
          {results.map((drug, i) => <DrugCard key={drug.id || i} drug={drug} />)}
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <div className="alert alert-info">
          No results found for "<strong>{query}</strong>". Try a generic name or check spelling.
        </div>
      )}

      {!loading && results.length === 0 && !query && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-faint)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>◉</div>
          <p>Search for any drug to view its full FDA label</p>
        </div>
      )}
    </div>
  );
}
