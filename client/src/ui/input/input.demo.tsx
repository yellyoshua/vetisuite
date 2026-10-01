import Input from './input'
import useInputDemo from './input.demo.handlers'

export default function InputDemo() {
  const { value, setValue, result, handleSubmit } = useInputDemo()

  return (
    <form onSubmit={handleSubmit} className="grid w-full max-w-sm gap-3">
      <Input name="patient" aria-label="Paciente (controlado)" autoComplete="off" value={value} onValueChange={setValue} placeholder="Ej.: Luna…" />
      <p className="text-xs text-muted-foreground">Valor: {value}</p>
      <Input name="owner" aria-label="Tutor (no controlado)" autoComplete="name" defaultValue="Ana Pérez" placeholder="Ej.: Ana Pérez…" />
      <Input name="email" type="email" aria-label="Correo" aria-invalid aria-describedby="input-demo-email-error" autoComplete="email" spellCheck={false} placeholder="tutor@correo.com…" />
      <p id="input-demo-email-error" className="-mt-2 text-xs text-danger">Revisa el correo: falta el dominio.</p>
      <Input aria-label="Campo deshabilitado" placeholder="Deshabilitado…" disabled />
      <Input aria-label="className externo" placeholder="className externo gana…" className="border-primary" />
      <button type="submit" className="h-8 rounded-control bg-primary px-2.5 text-[13px] font-medium text-primary-foreground">Enviar</button>
      {result && <pre className="overflow-x-auto rounded-control bg-muted p-2 text-xs text-foreground">{result}</pre>}
    </form>
  )
}
