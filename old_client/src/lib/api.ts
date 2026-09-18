import { useEffect, useState } from "react";
import { useVetStore } from "@/states/app.state";
import type { Client } from "./types";

/* ================================================================
   Simulated "API" layer — pattern for 6,000+ clients.
   With real volume the frontend NEVER downloads the full catalog:
   it asks an indexed endpoint for matches (typeahead with LIMIT)
   or pages (LIMIT/OFFSET or cursor). Here we simulate that network
   latency and the { results/rows, total } contract the backend
   would return.
================================================================ */
const netDelay = () => 280 + Math.random() * 320;

export function searchClientsApi(query: string, limit = 8): Promise<{ results: Client[]; total: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const q = query.trim().toLowerCase();
      const all = useVetStore.getState().clients.filter((c) => (c.name + " " + c.phone + " " + c.email).toLowerCase().includes(q));
      resolve({ results: all.slice(0, limit), total: all.length });
    }, netDelay());
  });
}

export function fetchClientsPageApi(query: string, page: number, pageSize: number): Promise<{ rows: Client[]; total: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const q = query.trim().toLowerCase();
      const all = useVetStore.getState().clients.filter((c) => !q || (c.name + " " + c.phone + " " + c.email).toLowerCase().includes(q));
      resolve({ rows: all.slice(page * pageSize, page * pageSize + pageSize), total: all.length });
    }, netDelay());
  });
}

export function useDebounced<V>(value: V, ms = 300): V {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}
