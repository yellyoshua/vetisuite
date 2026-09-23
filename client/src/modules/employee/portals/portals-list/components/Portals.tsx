import { PlusIcon, SearchIcon } from 'lucide-react'
import useQueryParams from '@/hooks/use-query-params'
import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import CustomTable from '@/components/CustomTable/CustomTable'
import FilterChips from '@/components/FilterChips/FilterChips'
import OptionSelect, { type SelectOption } from '@/components/OptionSelect/OptionSelect'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BADGE_TONE_CLASS_NAMES } from '@/constants/badge-tones'
import { PORTAL_STATUS_LABELS, PORTAL_STATUS_TONES, PORTAL_PURPOSE_LABELS, PORTAL_PURPOSE_VALUES } from '@/constants/portals'
import type { Portal } from '@/modules/employee/portals/portals.schema'

type PortalsProps = {
  portals: Portal[]
}

const SPACE_GROUPED_NUMBER = new Intl.NumberFormat('fr-FR')

const PURPOSE_OPTIONS: SelectOption[] = [
  { value: '', label: 'Todos los tipos' },
  ...PORTAL_PURPOSE_VALUES.map((value) => ({ value, label: PORTAL_PURPOSE_LABELS[value] })),
]

const PRESET_OPTIONS: SelectOption[] = [
  { value: '', label: 'Todos' },
  { value: 'published', label: 'Publicados' },
  { value: 'drafts', label: 'Borradores' },
]

export default function Portals({ portals }: PortalsProps) {
  const { nextPage, prevPage, search, changeQuery, query } = useQueryParams()
  const currentPage = Number(query.page) || 1

  return (
    <CustomPage
      title="Portales"
      description="Páginas por las que entran las visitas y las reservas de cita."
      actions={
        <Button disabled>
          <PlusIcon /> Nuevo portal
        </Button>
      }
    >
      <CustomPageContainer className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              aria-label="Buscar portales"
              placeholder="Busca un portal…"
              defaultValue={query.search || ''}
              onChange={({ target }) => search(target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-foreground"
            />
          </div>
          <OptionSelect label="Tipo" value={query.purpose || query.type || ''} options={PURPOSE_OPTIONS} onChange={(purpose) => changeQuery({ purpose, type: null, page: null })} />
        </div>
        <FilterChips label="Filtros rápidos de portales" options={PRESET_OPTIONS} value={query.preset || ''} onChange={(preset) => changeQuery({ preset, page: null })} />
      </CustomPageContainer>

      <CustomTable dataSize={portals.length} currentPage={currentPage} nextPage={nextPage} prevPage={prevPage}>
        <CustomTable.Thead>
          <CustomTable.TableRow header={true}>
            <CustomTable.TheadItem>Portal</CustomTable.TheadItem>
            <CustomTable.TheadItem>Tipo</CustomTable.TheadItem>
            <CustomTable.TheadItem>Citas agendadas</CustomTable.TheadItem>
            <CustomTable.TheadItem>Estado</CustomTable.TheadItem>
          </CustomTable.TableRow>
        </CustomTable.Thead>
        <CustomTable.TBody>
          {portals.map((portal) => (
            <CustomTable.TableRow key={portal.id}>
              <CustomTable.TBodyItem className="flex flex-col">
                <span className="font-medium">{portal.name}</span>
                <span className="text-sub">{portal.slug}</span>
              </CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{PORTAL_PURPOSE_LABELS[portal.purpose]}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{SPACE_GROUPED_NUMBER.format(portal.bookedAppointments)}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem>
                <Badge variant="outline" className={BADGE_TONE_CLASS_NAMES[PORTAL_STATUS_TONES[portal.status]]}>
                  {PORTAL_STATUS_LABELS[portal.status]}
                </Badge>
              </CustomTable.TBodyItem>
            </CustomTable.TableRow>
          ))}
        </CustomTable.TBody>
      </CustomTable>
    </CustomPage>
  )
}
