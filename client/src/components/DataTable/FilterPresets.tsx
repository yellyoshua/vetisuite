import type { FilterOption } from './DataTableToolbar'

type PresetCount = {
  shown: number
  total: number
}

type FilterPresetsProps = {
  label: string
  presets: FilterOption[]
  activeValue: string
  count: PresetCount | null
  onChange: (value: string) => void
}

export default function FilterPresets({ label, presets, activeValue, count, onChange }: FilterPresetsProps) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
        {presets.map((preset) => {
          const isActive = preset.value === activeValue

          return (
            <button
              key={preset.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(preset.value)}
              className={`cursor-pointer rounded-full border px-3 py-1.5 font-body text-xs whitespace-nowrap ${isActive ? 'border-transparent bg-green-soft font-semibold text-green' : 'border-line bg-card font-medium text-sub'}`}
            >
              {preset.label}
            </button>
          )
        })}
      </div>
      {count && (
        <span aria-live="polite" className="ml-auto text-xs text-sub tabular-nums">
          Mostrando {count.shown} de {count.total}
        </span>
      )}
    </div>
  )
}
