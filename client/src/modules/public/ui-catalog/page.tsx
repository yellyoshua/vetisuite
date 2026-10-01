import { LayoutGrid, SearchX } from 'lucide-react'
import Breadcrumb from '@/ui/breadcrumb/breadcrumb'
import FramedCard from '@/ui/framed-card/framed-card'
import PageHeader from '@/ui/page-header/page-header'
import SearchInput from '@/ui/search-input/search-input'
import Sidebar from '@/ui/sidebar/sidebar'
import ThemeToggle from '@/ui/theme-toggle/theme-toggle'
import UserMenu from '@/ui/user-menu/user-menu'
import useUiCatalogPage from './page.handlers'

export default function Page() {
  const { query, setQuery, visibleGroups, sidebarSections, componentCount, isEmpty } = useUiCatalogPage()

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <Sidebar
        aria-label="Componentes del catálogo"
        className="sticky top-0 h-dvh"
        header={
          <span className="flex items-center gap-2 text-sm font-medium">
            <LayoutGrid aria-hidden="true" className="size-4" />
            Veti Suite UI
          </span>
        }
        search={<SearchInput aria-label="Buscar componente" placeholder="Buscar componente" shortcut="⌘ K" value={query} onValueChange={setQuery} />}
        sections={sidebarSections}
        footer={<UserMenu name="Lucía Ferreyra" email="lucia@clinicacentral.vet" status="online" />}
      />
      <main className="flex min-w-0 flex-1 flex-col bg-card ring-1 ring-border">
        <div className="flex h-12 items-center justify-between gap-3 border-b border-border px-4">
          <Breadcrumb items={[{ label: 'Veti Suite', href: '/', icon: <LayoutGrid aria-hidden="true" /> }, { label: 'Catálogo UI' }]} />
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-8 px-4 py-6 sm:px-6">
          <PageHeader title="Catálogo de componentes" subtitle={`${componentCount} componentes de src/ui con sus variantes, en claro y oscuro.`} />
          {isEmpty && (
            <p role="status" className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <SearchX aria-hidden="true" className="size-4" />
              Ningún componente coincide con «{query}». Prueba con otro nombre.
            </p>
          )}
          {visibleGroups.map((group) => (
            <section key={group.id} aria-label={group.label} className="flex flex-col gap-4">
              <p aria-hidden="true" className="text-xs text-muted-foreground uppercase">
                {group.label}
              </p>
              {group.items.map(({ id, title, Demo, framed }) =>
                framed ? (
                  <section key={id} id={id} aria-label={title} className="flex scroll-mt-4 flex-col gap-2">
                    <h2 className="font-body text-sm font-medium text-muted-foreground">{title}</h2>
                    <Demo />
                  </section>
                ) : (
                  <FramedCard key={id} id={id} title={title} className="scroll-mt-4" bodyClassName="p-4">
                    <Demo />
                  </FramedCard>
                ),
              )}
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
