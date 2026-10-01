import Grid from "./grid";

const stats = [
  { label: "Citas de hoy", value: "14" },
  { label: "Pacientes activos", value: "382" },
  { label: "Vacunas pendientes", value: "27" },
  { label: "Stock bajo", value: "5" },
];

export default function GridDemo() {
  return (
    <div className="flex flex-col gap-4">
      <Grid cols={4}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-2 rounded-row border border-border bg-card p-3"
          >
            <span className="text-[13px] text-muted-foreground">
              {stat.label}
            </span>
            <span className="text-2xl font-medium tabular-nums">
              {stat.value}
            </span>
          </div>
        ))}
      </Grid>
      <Grid cols={6} gap="sm">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <div
            key={day}
            className="rounded-control border border-border bg-card py-2 text-center text-[13px] text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </Grid>
    </div>
  );
}
