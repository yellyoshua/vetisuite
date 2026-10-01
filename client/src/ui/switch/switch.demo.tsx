import Switch from './switch'
import useSwitchDemo from './switch.demo.handlers'

export default function SwitchDemo() {
  const { value, setValue, result, handleSubmit } = useSwitchDemo()

  return (
    <form onSubmit={handleSubmit} className="grid w-full max-w-sm gap-3 text-sm text-foreground">
      <div className="flex items-center gap-3">
        <Switch id="reminders" name="reminders" checked={value} onCheckedChange={setValue} />
        <label htmlFor="reminders">Recordatorios (controlado: {value ? 'sí' : 'no'})</label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="newsletter" name="newsletter" value="si" defaultChecked />
        <label htmlFor="newsletter">Boletín (no controlado)</label>
      </div>
      <div className="flex items-center gap-3 text-muted-foreground">
        <Switch id="sms" disabled />
        <label htmlFor="sms">Deshabilitado</label>
      </div>
      <button type="submit" className="h-8 rounded-control bg-primary px-2.5 text-[13px] font-medium text-primary-foreground">Enviar</button>
      {result && <pre className="overflow-x-auto rounded-control bg-muted p-2 text-xs">{result}</pre>}
    </form>
  )
}
