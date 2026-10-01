import Avatar from './avatar'

export default function AvatarDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Avatar name="María Fernández" size="sm" />
      <Avatar name="Carlos Ruiz" />
      <Avatar name="Luna" size="lg" />
      <Avatar name="Clínica Veterinaria" src="https://placehold.co/80x80/png" />
      <Avatar name="Imagen rota" src="/no-existe.png" />
      <Avatar name="Pedro Gómez" className="rounded-control bg-primary text-primary-foreground" />
    </div>
  )
}
