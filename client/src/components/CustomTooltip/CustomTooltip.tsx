import type { ComponentProps, ReactElement, ReactNode } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type CustomTooltipProps = {
  children: ReactElement
  content: ReactNode
  side?: ComponentProps<typeof TooltipContent>['side']
}

export default function CustomTooltip({ children, content, side }: CustomTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  )
}
