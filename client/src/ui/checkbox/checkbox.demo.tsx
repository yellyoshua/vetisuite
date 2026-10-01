import Checkbox from './checkbox'
import useCheckboxDemo from './checkbox.demo.handlers'

export default function CheckboxDemo() {
  const { value, setValue, result, handleSubmit } = useCheckboxDemo()

  return (
    <form onSubmit={handleSubmit} className="grid w-full max-w-sm gap-3 text-sm text-foreground">
      <label className="flex items-center gap-2">
        <Checkbox name="vaccinated" checked={value} onCheckedChange={setValue} />
        Vacunado (controlado: {value ? 'sí' : 'no'})
      </label>
      <label className="flex items-center gap-2">
        <Checkbox name="sterilized" value="si" defaultChecked />
        Esterilizado (no controlado)
      </label>
      <label className="flex items-center gap-2">
        <Checkbox name="terms" aria-invalid required />
        Acepto los términos (con error)
      </label>
      <label className="flex items-center gap-2 text-muted-foreground">
        <Checkbox disabled />
        Deshabilitado
      </label>
      <button type="submit" className="h-8 rounded-control bg-primary px-2.5 text-[13px] font-medium text-primary-foreground">Enviar</button>
      {result && <pre className="overflow-x-auto rounded-control bg-muted p-2 text-xs">{result}</pre>}
    </form>
  )
}
