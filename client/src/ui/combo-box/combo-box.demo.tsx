import ComboBox from './combo-box'

const species = [
  { value: 'dog', label: 'Perro' },
  { value: 'cat', label: 'Gato' },
  { value: 'rabbit', label: 'Conejo' },
  { value: 'bird', label: 'Ave' },
  { value: 'hamster', label: 'Hámster' },
  { value: 'turtle', label: 'Tortuga' },
]

export default function ComboBoxDemo() {
  return (
    <form className="flex max-w-sm flex-col gap-3">
      <label htmlFor="combo-box-demo-species" className="text-xs font-medium text-foreground">
        Especie
      </label>
      <ComboBox id="combo-box-demo-species" name="species" options={species} placeholder="Buscar especie…" />
      <ComboBox aria-label="Especie con valor inicial" name="species-default" options={species} defaultValue="cat" />
      <ComboBox aria-label="Especie inválida" options={species} aria-invalid disabled placeholder="Deshabilitado…" />
    </form>
  )
}
