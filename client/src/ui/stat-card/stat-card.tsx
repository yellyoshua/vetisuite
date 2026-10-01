import useStatCard, { type StatCardProps } from './stat-card.handlers'

export default function StatCard(props: StatCardProps) {
  const { rootProps, title, titleId, value, unit, icon, delta, deltaLabel, ...classes } = useStatCard(props)

  return (
    <div {...rootProps}>
      <span aria-hidden="true" className={classes.stripesClassName} />
      <div className={classes.headerClassName}>
        <p id={titleId} className={classes.titleClassName}>
          {title}
        </p>
        {icon ? (
          <span aria-hidden="true" className={classes.iconClassName}>
            {icon}
          </span>
        ) : (
          <span aria-hidden="true" className={classes.swatchClassName} />
        )}
      </div>
      <div className={classes.bodyClassName}>
        <p className={classes.rowClassName}>
          <span className={classes.valueClassName}>{value}</span>
          {unit && <span className={classes.unitClassName}>{unit}</span>}
        </p>
        {delta && (
          <p className={classes.footClassName}>
            <span className="sr-only">Variación: </span>
            <span className={delta.className}>{delta.text}</span> {deltaLabel}
          </p>
        )}
      </div>
    </div>
  )
}
