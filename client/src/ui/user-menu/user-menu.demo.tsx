import UserMenu from './user-menu'

export default function UserMenuDemo() {
  return (
    <div className="grid max-w-md gap-3 sm:grid-cols-2">
      <UserMenu name="Laura Méndez" email="laura@clinicacentral.vet" aria-haspopup="menu" />
      <UserMenu name="Andrés Paredes" email="andres@clinicacentral.vet" status="away" />
      <UserMenu name="Sofía Rivas" email="sofia@clinicacentral.vet" status="offline" />
    </div>
  )
}
