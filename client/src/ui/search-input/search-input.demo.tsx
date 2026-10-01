import SearchInput from './search-input'
import useSearchInputDemo from './search-input.demo.handlers'

export default function SearchInputDemo() {
  const { query, setQuery } = useSearchInputDemo()

  return (
    <div className="grid w-full max-w-sm gap-3">
      <SearchInput aria-label="Buscar pacientes" name="q" autoComplete="off" placeholder="Buscar paciente o tutor…" value={query} onValueChange={setQuery} />
      <p className="text-xs text-muted-foreground">Consulta: {query || 'vacía'}</p>
      <SearchInput aria-label="Buscar citas" placeholder="Buscar cita…" defaultValue="pendiente" />
      <SearchInput aria-label="Búsqueda deshabilitada" placeholder="Deshabilitado…" disabled />
    </div>
  )
}
