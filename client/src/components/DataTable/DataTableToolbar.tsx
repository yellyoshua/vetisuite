import Button from '@/components/legacy-ui/Button'
import Icon from '@/components/legacy-ui/Icon'
import Input from '@/components/legacy-ui/Input'
import Select from '@/components/legacy-ui/Select'

export type FilterOption = {
  value: string
  label: string
}

export type ToolbarSelect<TFilterKey extends string> = {
  key: TFilterKey
  label: string
  options: FilterOption[]
}

type DataTableToolbarProps<TFilterKey extends string> = {
  searchPlaceholder: string
  search: string
  selects: ToolbarSelect<TFilterKey>[]
  filters: Record<TFilterKey, string>
  onSearchChange: (search: string) => void
  onFilterChange: (key: TFilterKey, value: string) => void
}

export default function DataTableToolbar<TFilterKey extends string>({
  searchPlaceholder,
  search,
  selects,
  filters,
  onSearchChange,
  onFilterChange,
}: DataTableToolbarProps<TFilterKey>) {
  return (
    <search className="mb-3 flex flex-wrap items-center gap-2">
      <div className="min-w-0 flex-[1_1_220px]">
        <Input
          type="search"
          name="search"
          autoComplete="off"
          aria-label={searchPlaceholder}
          placeholder={searchPlaceholder}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      {selects.map((select) => (
        <div key={select.key} className="w-[180px] flex-[0_1_180px]">
          <Select
            name={select.key}
            aria-label={select.label}
            value={filters[select.key]}
            onChange={(event) => onFilterChange(select.key, event.target.value)}
          >
            {select.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      ))}
      <Button variant="ghost" size="sm" isDisabled>
        <Icon name="sliders-horizontal" size={13} /> Más filtros
      </Button>
    </search>
  )
}
