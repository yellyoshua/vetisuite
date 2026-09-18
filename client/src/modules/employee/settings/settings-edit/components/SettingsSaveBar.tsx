import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Icon from '@/components/ui/Icon'

type SettingsSaveBarProps = {
  formId: string
  status: string
  error: Error | null
}

export default function SettingsSaveBar({ formId, status, error }: SettingsSaveBarProps) {
  return (
    <Card className="sticky bottom-0 flex flex-wrap items-center gap-3 px-4 py-3">
      <span className="flex items-center gap-[7px] text-xs text-sub">
        <Icon name="info" size={14} />
        Los cambios se aplican a todos los módulos en cuanto guardas.
      </span>
      <p role="status" className="text-xs font-semibold text-green">
        {status}
      </p>
      {error && (
        <p role="alert" className="text-xs text-red">
          {error.message}
        </p>
      )}
      <div className="ml-auto flex items-center gap-2">
        <Button type="reset" form={formId} variant="ghost" size="sm">
          Descartar
        </Button>
        <Button type="submit" form={formId} size="sm">
          <Icon name="check" size={13} /> Guardar cambios
        </Button>
      </div>
    </Card>
  )
}
