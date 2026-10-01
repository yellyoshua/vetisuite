import { Users } from 'lucide-react'
import Breadcrumb from './breadcrumb'

export default function BreadcrumbDemo() {
  return (
    <div className="flex flex-col gap-3">
      <Breadcrumb
        items={[
          { label: 'Tutores', href: '#tutores', icon: <Users /> },
          { label: 'María Fernández', href: '#tutor' },
          { label: 'Luna · Golden Retriever' },
        ]}
      />
      <Breadcrumb className="text-xs" items={[{ label: 'Inventario', href: '#inventario' }, { label: 'Vacuna antirrábica' }]} />
    </div>
  )
}
