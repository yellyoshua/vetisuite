import RadioGroup from './radio-group'
import useRadioGroupDemo from './radio-group.demo.handlers'

const shifts = [
  { value: 'manana', label: 'Mañana' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noche', label: 'Noche', disabled: true },
]

export default function RadioGroupDemo() {
  const { value, setValue, result, handleSubmit } = useRadioGroupDemo()

  return (
    <form onSubmit={handleSubmit} className="grid w-full max-w-sm gap-4">
      <RadioGroup name="shift" aria-label="Turno" options={shifts} value={value} onValueChange={setValue} />
      <p className="text-xs text-muted-foreground">Valor: {value}</p>
      <RadioGroup
        name="sex"
        aria-label="Sexo"
        orientation="horizontal"
        defaultValue="hembra"
        options={[{ value: 'hembra', label: 'Hembra' }, { value: 'macho', label: 'Macho' }]}
      />
      <RadioGroup name="size" aria-label="Tamaño" aria-invalid required orientation="horizontal" options={[{ value: 'chico', label: 'Chico' }, { value: 'grande', label: 'Grande' }]} />
      <button type="submit" className="h-8 rounded-control bg-primary px-2.5 text-[13px] font-medium text-primary-foreground">Enviar</button>
      {result && <pre className="overflow-x-auto rounded-control bg-muted p-2 text-xs text-foreground">{result}</pre>}
    </form>
  )
}
