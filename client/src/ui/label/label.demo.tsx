import Label from './label'

export default function LabelDemo() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <div className="grid gap-1.5">
        <Label htmlFor="label-demo-name" required>
          Nombre de la mascota
        </Label>
        <input id="label-demo-name" required className="h-8 rounded-control border border-border bg-card px-2.5 text-[13px] text-foreground shadow-lift dark:shadow-none" />
      </div>
      <Label className="text-muted-foreground">className externo gana</Label>
    </div>
  )
}
