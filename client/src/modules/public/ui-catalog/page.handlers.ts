import { useState, useSyncExternalStore } from 'react'
import { catalogGroups, type CatalogGroup } from './catalog-sections'

function subscribeToHash(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

function readHash() {
  return window.location.hash.slice(1)
}

function matches(query: string, text: string) {
  return text.toLocaleLowerCase('es').includes(query)
}

export default function useUiCatalogPage() {
  const [query, setQuery] = useState('')
  const activeId = useSyncExternalStore(subscribeToHash, readHash, () => '')
  const normalizedQuery = query.trim().toLocaleLowerCase('es')

  const visibleGroups: CatalogGroup[] = catalogGroups
    .map((group) => ({ ...group, items: group.items.filter((item) => matches(normalizedQuery, `${item.title} ${item.id}`)) }))
    .filter((group) => group.items.length > 0)

  const sidebarSections = visibleGroups.map((group) => ({
    label: group.label,
    items: group.items.map((item) => ({ label: item.title, href: `#${item.id}`, active: item.id === activeId })),
  }))

  const componentCount = catalogGroups.reduce((total, group) => total + group.items.length, 0)

  return {
    query,
    setQuery,
    visibleGroups,
    sidebarSections,
    componentCount,
    isEmpty: visibleGroups.length === 0,
  }
}
