import usePageHeader, { type PageHeaderProps } from './page-header.handlers'

export default function PageHeader(props: PageHeaderProps) {
  const h = usePageHeader(props)

  return (
    <header {...h.rootProps}>
      {h.breadcrumb}
      <div className={h.rowClassName}>
        <div className={h.textClassName}>
          <h1 className={h.titleClassName}>{h.title}</h1>
          {h.subtitle && <p className={h.subtitleClassName}>{h.subtitle}</p>}
        </div>
        {h.actions && <div className={h.actionsClassName}>{h.actions}</div>}
      </div>
    </header>
  )
}
