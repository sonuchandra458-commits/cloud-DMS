'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import api from '../lib/api';

export const useSearch = () => {
  const [query,     setQuery]     = useState('');
  const [results,   setResults]   = useState([]);
  const [tags,      setTags]      = useState([]);
  const [selTags,   setSelTags]   = useState([]);
  const [fileType,  setFileType]  = useState('');
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    api.get('/search/tags')
      .then(res => setTags(res.data.data || []))
      .catch(console.error);
  }, []);

  const search = useCallback(async (q, options = {}) => {
    setSearching(true);
    try {
      const res = await api.get('/search', {
        params: {
          q,
          tags:     (options.tags     || selTags).join(','),
          fileType: options.fileType  || fileType,
          from:     options.from,
          to:       options.to,
        },
      });
      setResults(res.data.data || []);
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [selTags, fileType]);

  const debouncedSearch = useCallback((q) => {
    setQuery(q);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (q.length > 1 || selTags.length > 0) search(q);
      else setResults([]);
    }, 400);
  }, [search, selTags]);

  const toggleTag = useCallback((tagName) => {
    setSelTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  }, []);

  const createTag = useCallback(async (name, color = '#3b82f6') => {
    try {
      const res = await api.post('/search/tags', { name, color });
      setTags(prev => [...prev, res.data.data]);
      return res.data.data;
    } catch (err) {
      console.error('Failed to create tag:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    if (query.length > 1 || selTags.length > 0) search(query);
  }, [selTags, fileType]);

  return {
    query,
    results,
    tags,
    selTags,
    fileType,
    searching,
    setFileType,
    toggleTag,
    createTag,
    debouncedSearch,
    search,
  };
};