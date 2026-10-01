import { CalendarCheck, PackageMinus, PawPrint, Syringe } from 'lucide-react'
import StatCard from './stat-card'

export default function StatCardDemo() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Citas de hoy" value="14" delta={12} icon={<CalendarCheck />} />
      <StatCard title="Pacientes activos" value="382" unit="pacientes" tone="info" delta="+3,1%" icon={<PawPrint />} />
      <StatCard title="Vacunas vencidas" value="27" tone="destructive" delta={-8} deltaLabel="vs mes pasado" icon={<Syringe />} />
      <StatCard title="Stock bajo" value="5" unit="productos" tone="warning" icon={<PackageMinus />} />
    </div>
  )
}
