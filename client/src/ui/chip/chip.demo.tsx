import Chip from './chip'

export default function ChipDemo() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <Chip label="Canino" />
        <Chip variant="primary" label="Vacunado" />
        <Chip variant="destructive" label="Alérgico" />
        <Chip variant="info" label="Control" />
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Chip label="Peluquería" onRemove={() => undefined} />
        <Chip variant="primary" label="Esterilizado" onRemove={() => undefined} />
      </div>
    </div>
  )
}
