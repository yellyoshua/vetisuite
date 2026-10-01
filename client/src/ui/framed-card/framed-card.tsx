import useFramedCard, { type FramedCardProps } from './framed-card.handlers'

export default function FramedCard(props: FramedCardProps) {
  const { title, icon, actions, children, titleId, rootProps, stripesClassName, headerClassName, titleClassName, iconClassName, bodyClassName } =
    useFramedCard(props)

  return (
    <section {...rootProps}>
      <span aria-hidden="true" className={stripesClassName} />
      <header className={headerClassName}>
        <h2 id={titleId} className={titleClassName}>
          {title}
        </h2>
        <span className={iconClassName}>
          {actions}
          {icon && <span aria-hidden="true">{icon}</span>}
        </span>
      </header>
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}
