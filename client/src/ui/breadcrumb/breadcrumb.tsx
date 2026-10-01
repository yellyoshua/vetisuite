import useBreadcrumb, { type BreadcrumbProps } from './breadcrumb.handlers'

export default function Breadcrumb(props: BreadcrumbProps) {
  const { navProps, listClassName, itemClassName, separatorClassName, items } = useBreadcrumb(props)

  return (
    <nav {...navProps}>
      <ol className={listClassName}>
        {items.map((item) => {
          const content = (
            <>
              {item.icon && <span aria-hidden="true">{item.icon}</span>}
              <span className="truncate">{item.label}</span>
            </>
          )

          return (
            <li key={item.key} className={itemClassName}>
              {item.showSeparator && (
                <span aria-hidden="true" className={separatorClassName}>
                  /
                </span>
              )}
              {item.href ? (
                <a href={item.href} className={item.className}>
                  {content}
                </a>
              ) : (
                <span aria-current={item.ariaCurrent} className={item.className}>
                  {content}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
