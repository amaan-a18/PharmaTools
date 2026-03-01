// src/api/drugApi.js
// Real API integrations: OpenFDA + RxNorm + NLM Drug Interaction API

import axios from 'axios';

const FDA_BASE = 'https://api.fda.gov/drug';
const RXNORM_BASE = 'https://rxnav.nlm.nih.gov/REST';
const RXNORM_INTERACTION = 'https://rxnav.nlm.nih.gov/REST/interaction';

// ─── OPEN FDA ────────────────────────────────────────────────

/**
 * Search drugs by name using OpenFDA drug label endpoint
 * Returns brand name, generic name, purpose, indications, warnings, dosage
 */
export async function searchDrugs(query, limit = 10) {
  if (!query || query.trim().length < 2) return [];

  try {
    // Search across brand name, generic name, and substance name
    const searches = [
      `openfda.brand_name:"${query}"`,
      `openfda.generic_name:"${query}"`,
      `openfda.substance_name:"${query}"`,
    ];

    const results = await Promise.allSettled(
      searches.map(s =>
        axios.get(`${FDA_BASE}/label.json`, {
          params: { search: s, limit: Math.ceil(limit / 2) },
        })
      )
    );

    // Merge and deduplicate
    const seen = new Set();
    const merged = [];

    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.data.results) {
        for (const item of r.value.data.results) {
          const id = item.id || item.set_id;
          if (!seen.has(id)) {
            seen.add(id);
            merged.push(normalizeFDADrug(item));
          }
        }
      }
    }

    return merged.slice(0, limit);
  } catch (err) {
    console.error('FDA search error:', err);
    return [];
  }
}

/**
 * Get detailed drug info from OpenFDA by set_id or application number
 */
export async function getDrugDetail(setId) {
  try {
    const res = await axios.get(`${FDA_BASE}/label.json`, {
      params: { search: `set_id:"${setId}"`, limit: 1 },
    });
    if (res.data.results?.[0]) {
      return normalizeFDADrug(res.data.results[0]);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get drug adverse events from FDA FAERS
 */
export async function getDrugADRs(drugName, limit = 10) {
  try {
    const res = await axios.get(`${FDA_BASE}event.json`, {
      params: {
        search: `patient.drug.medicinalproduct:"${drugName}"`,
        count: 'patient.reaction.reactionmeddrapt.exact',
        limit,
      },
    });
    return res.data.results || [];
  } catch {
    return [];
  }
}

/**
 * Normalize FDA raw drug label into clean object
 */
function normalizeFDADrug(raw) {
  const openfda = raw.openfda || {};
  return {
    id: raw.set_id || raw.id,
    brandName: openfda.brand_name?.[0] || 'Unknown',
    genericName: openfda.generic_name?.[0] || openfda.substance_name?.[0] || 'Unknown',
    manufacturer: openfda.manufacturer_name?.[0] || 'Unknown',
    rxcui: openfda.rxcui?.[0] || null,
    ndc: openfda.package_ndc?.[0] || null,
    route: openfda.route?.[0] || 'Unknown',
    productType: openfda.product_type?.[0] || '',
    substanceName: openfda.substance_name || [],
    // Clinical info
    indications: raw.indications_and_usage?.[0] || '',
    dosageAdmin: raw.dosage_and_administration?.[0] || '',
    warnings: raw.warnings?.[0] || raw.warnings_and_cautions?.[0] || '',
    contraindications: raw.contraindications?.[0] || '',
    adverseReactions: raw.adverse_reactions?.[0] || '',
    drugInteractions: raw.drug_interactions?.[0] || '',
    mechanism: raw.mechanism_of_action?.[0] || '',
    pharmacokinetics: raw.pharmacokinetics?.[0] || '',
    overdosage: raw.overdosage?.[0] || '',
    description: raw.description?.[0] || '',
    howSupplied: raw.how_supplied?.[0] || '',
    storage: raw.storage_and_handling?.[0] || '',
  };
}

// ─── RXNORM ──────────────────────────────────────────────────

/**
 * Get RxCUI (RxNorm Concept Unique Identifier) for a drug name
 */
export async function getRxCUI(drugName) {
  try {
    const res = await axios.get(`${RXNORM_BASE}/rxcui.json`, {
      params: { name: drugName, search: 1 },
    });
    return res.data.idGroup?.rxnormId?.[0] || null;
  } catch {
    return null;
  }
}

/**
 * Get drug info from RxNorm by RxCUI
 */
export async function getRxNormInfo(rxcui) {
  try {
    const [props, related] = await Promise.allSettled([
      axios.get(`${RXNORM_BASE}/rxcui/${rxcui}/properties.json`),
      axios.get(`${RXNORM_BASE}/rxcui/${rxcui}/related.json?tty=IN+BN+SCD`),
    ]);

    return {
      properties: props.status === 'fulfilled' ? props.value.data.properties : null,
      related: related.status === 'fulfilled' ? related.value.data.relatedGroup : null,
    };
  } catch {
    return null;
  }
}

/**
 * Check drug-drug interactions using RxNorm Interaction API
 * Pass array of RxCUI strings
 */
export async function checkDrugInteractions(rxcuiList) {
  if (rxcuiList.length < 2) return { interactions: [] };

  try {
    const res = await axios.get(`${RXNORM_INTERACTION}/list.json`, {
      params: { rxcuis: rxcuiList.join('+') },
    });

    const fullInteractionTypeGroup = res.data?.fullInteractionTypeGroup || [];
    const interactions = [];

    for (const group of fullInteractionTypeGroup) {
      for (const type of group.fullInteractionType || []) {
        for (const pair of type.interactionPair || []) {
          interactions.push({
            severity: pair.severity || 'unknown',
            description: pair.description || '',
            drugs: pair.interactionConcept?.map(c => ({
              name: c.minConceptItem?.name,
              rxcui: c.minConceptItem?.rxcui,
            })) || [],
            source: group.sourceName || 'RxNorm',
          });
        }
      }
    }

    return { interactions };
  } catch (err) {
    console.error('Interaction check error:', err);
    return { interactions: [], error: 'Could not fetch interactions' };
  }
}

/**
 * Resolve drug name to RxCUI, then check interactions
 * Convenience function for the UI
 */
export async function checkInteractionsByName(drugNames) {
  const rxcuiPromises = drugNames.map(n => getRxCUI(n));
  const rxcuis = await Promise.all(rxcuiPromises);
  const validRxcuis = rxcuis.filter(Boolean);

  if (validRxcuis.length < 2) {
    return {
      interactions: [],
      resolved: drugNames.map((n, i) => ({ name: n, rxcui: rxcuis[i] })),
      error: rxcuis.filter(Boolean).length < 2 ? 'Could not resolve enough drug names to RxCUI. Try generic names.' : null,
    };
  }

  const result = await checkDrugInteractions(validRxcuis);
  return {
    ...result,
    resolved: drugNames.map((n, i) => ({ name: n, rxcui: rxcuis[i] })),
  };
}

/**
 * Get drug spelling suggestions from RxNorm
 */
export async function getDrugSuggestions(query) {
  if (!query || query.length < 2) return [];
  try {
    const res = await axios.get(`${RXNORM_BASE}/spellingsuggestions.json`, {
      params: { name: query },
    });
    return res.data.suggestionGroup?.suggestionList?.suggestion || [];
  } catch {
    return [];
  }
}

/**
 * Autocomplete drug names from RxNorm
 */
export async function autocompleteDrug(query) {
  if (!query || query.length < 2) return [];
  try {
    const res = await axios.get(`${RXNORM_BASE}/drugs.json`, {
      params: { name: query },
    });
    const groups = res.data.drugGroup?.conceptGroup || [];
    const names = [];
    for (const g of groups) {
      for (const c of g.conceptProperties || []) {
        if (c.name && !names.includes(c.name)) names.push(c.name);
      }
    }
    return names.slice(0, 8);
  } catch {
    return [];
  }
}

// ─── DOSAGE HELPERS ──────────────────────────────────────────

export const dosageCalculators = {
  weightBased: ({ dosePerKg, weight, frequency }) => {
    const single = dosePerKg * weight;
    const freqMap = { 'OD': 1, 'BD': 2, 'TDS': 3, 'QID': 4, 'Q6H': 4, 'Q8H': 3, 'Q12H': 2 };
    const mult = freqMap[frequency] || 1;
    return {
      singleDose: single.toFixed(2),
      dailyDose: (single * mult).toFixed(2),
      unit: 'mg',
    };
  },

  bsaBased: ({ dosePerM2, height, weight }) => {
    const bsa = Math.sqrt((height * weight) / 3600); // Mosteller
    const dose = dosePerM2 * bsa;
    return {
      bsa: bsa.toFixed(2),
      dose: dose.toFixed(2),
      unit: 'mg',
    };
  },

  renalAdjustment: ({ normalDose, crcl, renalFraction }) => {
    let adjustedDose = normalDose;
    let interval = 'standard';
    let note = '';

    if (crcl >= 60) {
      note = 'No dose adjustment required';
    } else if (crcl >= 30) {
      adjustedDose = normalDose * (1 - renalFraction * 0.4);
      note = 'Moderate reduction recommended';
      interval = 'extended';
    } else if (crcl >= 15) {
      adjustedDose = normalDose * (1 - renalFraction * 0.7);
      note = 'Significant reduction required';
      interval = 'significantly extended';
    } else {
      adjustedDose = normalDose * (1 - renalFraction * 0.85);
      note = 'Avoid if possible or use with extreme caution';
      interval = 'greatly extended';
    }

    return {
      adjustedDose: adjustedDose.toFixed(0),
      originalDose: normalDose,
      reduction: (((normalDose - adjustedDose) / normalDose) * 100).toFixed(0),
      note,
      interval,
    };
  },

  pediatric: ({ adultDose, age, weight }) => {
    const young = (age / (age + 12)) * adultDose;
    const clark = (weight / 70) * adultDose;
    const dilling = (age / 20) * adultDose;
    return {
      young: young.toFixed(1),
      clark: clark.toFixed(1),
      dilling: dilling.toFixed(1),
    };
  },

  ivDrip: ({ volume, time, dropFactor }) => {
    const mlPerHr = volume / time;
    const gttsPerMin = (volume * dropFactor) / (time * 60);
    return {
      mlPerHr: mlPerHr.toFixed(1),
      gttsPerMin: Math.round(gttsPerMin),
    };
  },

  crcl: ({ age, weight, scr, sex }) => {
    const mult = sex === 'female' ? 0.85 : 1.0;
    return (((140 - age) * weight * mult) / (72 * scr)).toFixed(1);
  },

  bmi: ({ weight, height }) => {
    const h = height / 100;
    return (weight / (h * h)).toFixed(1);
  },

  bsa: ({ height, weight }) => {
    return Math.sqrt((height * weight) / 3600).toFixed(2);
  },

  ibw: ({ height, sex }) => {
    const inches = height / 2.54;
    const over60 = Math.max(0, inches - 60);
    return sex === 'male'
      ? (50 + 2.3 * over60).toFixed(1)
      : (45.5 + 2.3 * over60).toFixed(1);
  },
};
