import Textarea from './textarea'
import useTextareaDemo from './textarea.demo.handlers'

export default function TextareaDemo() {
  const { value, setValue, result, handleSubmit } = useTextareaDemo()

  return (
    <form onSubmit={handleSubmit} className="grid w-full max-w-sm gap-3">
      <Textarea name="notes" value={value} onValueChange={setValue} aria-label="Notas (controlado)" placeholder="Ej.: Vacuna al día…" />
      <p className="text-xs text-muted-foreground">Caracteres: {value.length}</p>
      <Textarea name="history" defaultValue="Sin antecedentes" aria-label="Antecedentes (no controlado)" placeholder="Ej.: Alergia a penicilina…" />
      <Textarea aria-label="Diagnóstico" aria-invalid aria-describedby="textarea-demo-error" placeholder="Describe el diagnóstico…" />
      <p id="textarea-demo-error" className="-mt-2 text-xs text-danger">Escribe al menos 10 caracteres.</p>
      <Textarea aria-label="Campo deshabilitado" disabled placeholder="Deshabilitado…" />
      <button type="submit" className="h-8 rounded-control bg-primary px-2.5 text-[13px] font-medium text-primary-foreground">Enviar</button>
      {result && <pre className="overflow-x-auto rounded-control bg-muted p-2 text-xs text-foreground">{result}</pre>}
    </form>
  )
}
