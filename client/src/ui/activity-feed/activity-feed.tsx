import useActivityFeed, { type ActivityFeedProps } from './activity-feed.handlers'

export default function ActivityFeed(props: ActivityFeedProps) {
  const f = useActivityFeed(props)

  return (
    <ol {...f.listProps}>
      {f.items.map((item) => (
        <li key={item.id} className={item.itemClassName}>
          {item.connectorClassName && <span aria-hidden="true" className={item.connectorClassName} />}
          <span aria-hidden="true" className={item.iconClassName}>
            {item.icon}
          </span>
          <div className={f.bodyClassName}>
            <div className={f.headClassName}>
              <p className={f.titleClassName}>{item.title}</p>
              <time dateTime={item.dateTime} className={f.timeClassName}>
                {item.time}
              </time>
            </div>
            <p className={f.descriptionClassName}>{item.description}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
