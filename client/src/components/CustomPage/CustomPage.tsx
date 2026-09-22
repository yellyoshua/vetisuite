import type { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { useNavigate } from 'react-router'
import { ArrowLeftIcon } from 'lucide-react'
import { Button } from '../ui/button'

type CustomPageProps = {
  className?: string
  children?: ReactNode
  title: ReactNode
  description?: ReactNode
  goBack?: boolean
  goBackPath?: string
  actions?: ReactNode
}

type CustomPageContainerProps = {
  children?: ReactNode
  className?: string
}

export default function CustomPage({ className, children, title, description, goBack = false, goBackPath, actions }: CustomPageProps) {
  const navigate = useNavigate()

  return (
    <div className={twMerge('space-y-6 mb-10', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {description}
          </p>
        </div>
        <div className="flex gap-2 justify-end items-center">
          {actions && <div className="flex min-w-0 flex-1 gap-2 justify-end items-center sm:flex-none">{actions}</div>}
          {(goBack || goBackPath) && <Button
            variant="destructive" size="icon-lg" aria-label="Regresar"
            className="cursor-pointer shrink-0"
            onClick={() => (goBackPath ? navigate(goBackPath) : navigate(-1))}>
            <ArrowLeftIcon className="text-white" />
          </Button>}
        </div>
      </div>
      {children}
    </div>
  )
}

export function CustomPageContainer({ children, className = '' }: CustomPageContainerProps) {
  return (
    <div className={twMerge('bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700', className)}>
      {children}
    </div>
  )
}
