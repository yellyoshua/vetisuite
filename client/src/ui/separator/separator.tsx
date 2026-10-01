import useSeparator, { type SeparatorProps } from './separator.handlers'

export default function Separator(props: SeparatorProps) {
  const { separatorProps } = useSeparator(props)

  return <div {...separatorProps} />
}
