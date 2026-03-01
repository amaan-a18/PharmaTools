// src/hooks/useDrugSearch.js
import { useState, useCallback, useRef } from 'react';
import { searchDrugs, autocompleteDrug } from '../api/drugApi';

export function useDrugSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  const search = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await searchDrugs(query, 15);
      setResults(data);
    } catch (e) {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback((query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 500);
  }, [search]);

  return { results, loading, error, search, debouncedSearch };
}

export function useAutocomplete() {
  const [suggestions, setSuggestions] = useState([]);
  const debounceRef = useRef(null);

  const getSuggestions = useCallback((query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      const data = await autocompleteDrug(query);
      setSuggestions(data);
    }, 300);
  }, []);

  const clear = () => setSuggestions([]);

  return { suggestions, getSuggestions, clear };
}
