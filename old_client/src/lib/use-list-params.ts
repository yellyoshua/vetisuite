import { useSearchParams } from "react-router-dom";

/* Estado de un listado (búsqueda, página y filtros) en la URL: así se comparte
   y sobrevive a una recarga. El reseteo de página ocurre en el handler, nunca
   en un effect — `setState` síncrono en effects está prohibido (AGENTS.md §3). */
export function useListParams() {
  const [params, setParams] = useSearchParams();
  const write = (mutate: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(params);
    mutate(next);
    setParams(next, { replace: true });
  };
  const put = (next: URLSearchParams, key: string, value: string) => {
    if (value) next.set(key, value);
    else next.delete(key);
  };
  return {
    q: params.get("q") ?? "",
    page: Math.max(0, Number(params.get("page")) || 0),
    param: (key: string, fallback = "") => params.get(key) ?? fallback,
    setQ: (value: string) => write((next) => { put(next, "q", value); next.delete("page"); }),
    setPage: (value: number) => write((next) => put(next, "page", value > 0 ? String(value) : "")),
    /** Cambiar un filtro devuelve el listado a la primera página. */
    setParam: (key: string, value: string) => write((next) => { put(next, key, value); next.delete("page"); }),
  };
}
