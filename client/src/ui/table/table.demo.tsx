import { CalendarDays, CircleCheck, CircleDashed, CircleX, Download, EllipsisVertical, ListFilter, Search, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Table from './table'
import { useColumnWidths, useTableSelection, useTableSort } from './table.handlers'
import TableBody from './components/table-body'
import TableCaption from './components/table-caption'
import TableCell from './components/table-cell'
import TableEmpty from './components/table-empty'
import TableHead from './components/table-head'
import TableHeader from './components/table-header'
import TableResizer from './components/table-resizer'
import TableRow from './components/table-row'
import TableSelectAll from './components/table-select-all'
import TableSelectionBar from './components/table-selection-bar'
import TableToolbar from './components/table-toolbar'

type Priority = 'alta' | 'media' | 'baja'
type Status = 'confirmada' | 'pendiente' | 'cancelada'

type Appointment = {
  id: string
  patient: string
  priority: Priority
  vet: string
  status: Status
  date: string
  time: string
}

type ColumnKey = Exclude<keyof Appointment, 'id'>

const appointments: Appointment[] = [
  { id: '#C-1042', patient: 'Luna', priority: 'alta', vet: 'Dra. Sofía Herrera', status: 'confirmada', date: '2026-09-24', time: '09:00' },
  { id: '#C-1043', patient: 'Michi', priority: 'media', vet: 'Dr. Andrés Molina', status: 'pendiente', date: '2026-09-24', time: '09:30' },
  { id: '#C-1044', patient: 'Rocky', priority: 'baja', vet: 'Dra. Sofía Herrera', status: 'confirmada', date: '2026-09-24', time: '10:15' },
  { id: '#C-1045', patient: 'Kiwi', priority: 'media', vet: 'Dra. Paula Rivas', status: 'cancelada', date: '2026-09-24', time: '11:00' },
  { id: '#C-1046', patient: 'Toby', priority: 'alta', vet: 'Dr. Andrés Molina', status: 'pendiente', date: '2026-09-24', time: '12:30' },
]

const columns: { key: ColumnKey; label: string; sortable: boolean }[] = [
  { key: 'patient', label: 'Paciente', sortable: true },
  { key: 'priority', label: 'Prioridad', sortable: true },
  { key: 'vet', label: 'Veterinario', sortable: true },
  { key: 'status', label: 'Estado', sortable: true },
  { key: 'date', label: 'Fecha', sortable: true },
  { key: 'time', label: 'Hora', sortable: false },
]

const priorityLevel: Record<Priority, number> = { alta: 3, media: 2, baja: 1 }
const priorityFill: Record<Priority, string> = { alta: 'bg-danger', media: 'bg-warning', baja: 'bg-warning/60' }
const barHeights = ['h-1.5', 'h-[9px]', 'h-3']

const statusStyle: Record<Status, { Icon: typeof CircleCheck; className: string }> = {
  confirmada: { Icon: CircleCheck, className: 'text-primary' },
  pendiente: { Icon: CircleDashed, className: 'text-warning' },
  cancelada: { Icon: CircleX, className: 'text-danger' },
}

const checkboxWidth = 44
const idWidth = 96
const iconButton = 'inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-control text-muted-foreground transition-colors duration-150 motion-reduce:transition-none hover:bg-muted hover:text-foreground [&_svg]:size-4'

const initials = (name: string) => name.split(' ').slice(-2).map((part) => part[0]).join('')

export default function TableDemo() {
  const { sortedRows, getSortDirection, toggleSort } = useTableSort<Appointment, keyof Appointment>(appointments, { key: 'time', direction: 'ascending' })
  const { selected, isAllSelected, isSomeSelected, toggle, toggleAll, clear } = useTableSelection(appointments.map((appointment) => appointment.id))
  const { widths, setWidth, min, max } = useColumnWidths<ColumnKey>({ patient: 130, priority: 120, vet: 200, status: 140, date: 120, time: 90 })

  const renderCell = (row: Appointment, key: ColumnKey) => {
    if (key === 'priority') {
      return (
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="inline-flex items-end gap-0.5">
            {barHeights.map((height, index) => (
              <span key={height} className={cn('w-[3px] rounded-full', height, index < priorityLevel[row.priority] ? priorityFill[row.priority] : 'bg-border')} />
            ))}
          </span>
          {row.priority}
        </span>
      )
    }
    if (key === 'vet') {
      return (
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">{initials(row.vet)}</span>
          {row.vet}
        </span>
      )
    }
    if (key === 'status') {
      const { Icon, className } = statusStyle[row.status]
      return (
        <span className={cn('inline-flex items-center gap-1.5', className)}>
          <Icon aria-hidden="true" className="size-4 shrink-0" />
          {row.status}
        </span>
      )
    }
    return row[key]
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <section aria-label="Citas del día" className="relative isolate flex min-w-0 flex-col overflow-hidden rounded-card bg-neutral-frame p-1 ring-1 ring-border ring-inset">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-stripes" />
        <TableToolbar
          title="Citas del día"
          icon={<CalendarDays aria-hidden="true" />}
          search={
            <label className="flex h-8 w-full min-w-0 items-center gap-2 rounded-control border border-border bg-card pr-2 pl-2.5 shadow-lift transition-colors duration-150 motion-reduce:transition-none focus-within:border-muted-foreground sm:w-56 dark:shadow-none">
              <Search aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
              <span className="sr-only">Buscar citas</span>
              <input type="search" placeholder="Buscar…" className="min-w-0 flex-1 bg-transparent text-[13px] placeholder:text-muted-foreground" />
            </label>
          }
          actions={
            <>
              <button type="button" className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-control border border-border bg-card px-2.5 text-[13px] font-medium text-muted-foreground transition-[color,border-color] duration-150 motion-reduce:transition-none hover:border-muted-foreground/40 hover:text-foreground [&_svg]:size-4">
                <ListFilter aria-hidden="true" />
                Filtrar
              </button>
              <button type="button" aria-label="Más opciones" className={iconButton}>
                <EllipsisVertical aria-hidden="true" />
              </button>
            </>
          }
        />
        <Table className="w-max min-w-full table-fixed" containerClassName="max-h-96">
          <TableCaption className="sr-only">Citas del día</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead sticky="left" style={{ width: checkboxWidth }}>
                <TableSelectAll checked={isAllSelected} indeterminate={isSomeSelected} onChange={toggleAll} />
              </TableHead>
              <TableHead sticky="left" stickyOffset={checkboxWidth} style={{ width: idWidth }}>ID</TableHead>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  sticky={column.key === 'patient' ? 'left' : undefined}
                  stickyOffset={checkboxWidth + idWidth}
                  style={{ width: widths[column.key] }}
                  sortDirection={column.sortable ? getSortDirection(column.key) : undefined}
                  onSort={column.sortable ? () => toggleSort(column.key) : undefined}
                  resizer={<TableResizer label={`Ancho de columna ${column.label}`} value={widths[column.key]} min={min} max={max} onResize={(px) => setWidth(column.key, px)} />}
                >
                  {column.label}
                </TableHead>
              ))}
              <TableHead style={{ width: 56 }}><span className="sr-only">Acciones</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.map((row) => (
              <TableRow key={row.id} data-state={selected.has(row.id) ? 'selected' : undefined}>
                <TableCell sticky="left">
                  <TableSelectAll label={`Seleccionar ${row.patient}`} checked={selected.has(row.id)} onChange={() => toggle(row.id)} />
                </TableCell>
                <TableCell sticky="left" stickyOffset={checkboxWidth} className="text-muted-foreground">{row.id}</TableCell>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    sticky={column.key === 'patient' ? 'left' : undefined}
                    stickyOffset={checkboxWidth + idWidth}
                    className="overflow-hidden text-ellipsis"
                  >
                    {renderCell(row, column.key)}
                  </TableCell>
                ))}
                <TableCell className="py-0 text-right">
                  <button type="button" aria-label={`Acciones para ${row.patient}`} className={iconButton}>
                    <EllipsisVertical aria-hidden="true" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
      <TableSelectionBar count={selected.size} onClear={clear}>
        <button type="button"><Download aria-hidden="true" />Exportar</button>
        <button type="button" className="text-danger"><Trash2 aria-hidden="true" />Cancelar citas</button>
      </TableSelectionBar>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paciente</TableHead>
            <TableHead>Veterinario</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableEmpty colSpan={2}>No hay citas para hoy</TableEmpty>
        </TableBody>
      </Table>
    </div>
  )
}
