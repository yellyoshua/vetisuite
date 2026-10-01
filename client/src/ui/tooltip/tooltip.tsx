import useTooltip, { type TooltipProps } from './tooltip.handlers'

export default function Tooltip(props: TooltipProps) {
  const { trigger, wrapperProps, tooltipProps } = useTooltip(props)

  return (
    <span {...wrapperProps}>
      {trigger}
      <span {...tooltipProps}>{props.content}</span>
    </span>
  )
}
