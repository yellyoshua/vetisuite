import useBadge, { type BadgeProps } from './badge.handlers'

export default function Badge(props: BadgeProps) {
  const { badgeProps } = useBadge(props)

  return <span {...badgeProps} />
}
