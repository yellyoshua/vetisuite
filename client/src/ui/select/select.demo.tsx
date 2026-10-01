import Select from './select'
import useSelectDemo from './select.demo.handlers'

const species = [
  { value: 'perro', label: 'Perro' },
  { value: 'gato', label: 'Gato' },
  { value: 'ave', label: 'Ave' },
  { value: 'reptil', label: 'Reptil', disabled: true },
]

export default function SelectDemo() {
  const { value, setValue, result, handleSubmit } = useSelectDemo()

  return (
    <form onSubmit={handleSubmit} className="grid w-full max-w-sm gap-3">
      <Select name="species" options={species} value={value} onValueChange={setValue} aria-label="Especie controlada" />
      <p className="text-xs text-muted-foreground">Valor: {value}</p>
      <Select name="size" defaultValue="" placeholder="Elige un tamaño…" aria-label="Tamaño" options={[{ value: 'chico', label: 'Chico' }, { value: 'grande', label: 'Grande' }]} />
      <Select aria-invalid aria-label="Con error" options={species} />
      <Select disabled aria-label="Deshabilitado" options={species} />
      <button type="submit" className="h-8 rounded-control bg-primary px-2.5 text-[13px] font-medium text-primary-foreground">Enviar</button>
      {result && <pre className="overflow-x-auto rounded-control bg-muted p-2 text-xs text-foreground">{result}</pre>}
    </form>
  )
}
