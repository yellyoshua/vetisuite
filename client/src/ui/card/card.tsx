import type { ComponentProps } from 'react'
import useCard, { type CardProps } from './card.handlers'

type PartProps = ComponentProps<'div'>

export default function Card(props: CardProps) {
  const { cardProps } = useCard(props)

  return <div {...cardProps} />
}

export function CardHeader(props: PartProps) {
  const { cardProps } = useCard({ ...props, part: 'header' })

  return <div {...cardProps} />
}

export function CardTitle(props: PartProps) {
  const { cardProps } = useCard({ ...props, part: 'title' })

  return <div {...cardProps} />
}

export function CardDescription(props: PartProps) {
  const { cardProps } = useCard({ ...props, part: 'description' })

  return <div {...cardProps} />
}

export function CardContent(props: PartProps) {
  const { cardProps } = useCard({ ...props, part: 'content' })

  return <div {...cardProps} />
}

export function CardFooter(props: PartProps) {
  const { cardProps } = useCard({ ...props, part: 'footer' })

  return <div {...cardProps} />
}
