import type { ComponentType, SVGProps } from 'react'
import { Link } from 'react-router'
import { Home } from 'lucide-react'

type NotFoundScreenProps = {
  title?: string
  description?: string
  redirectPath?: string
  buttonText?: string
  icon?: ComponentType<SVGProps<SVGSVGElement>>
}

export default function NotFoundScreen({
  title = '¡Ups! Página no encontrada',
  description = 'Parece que te has perdido en el espacio.',
  redirectPath = '/',
  buttonText = 'Volver al inicio',
  icon: Icon = Home,
}: NotFoundScreenProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-[340px] sm:max-w-md text-center space-y-6 sm:space-y-8 animate-fade-in">

        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-accent-green opacity-20 blur-xl rounded-full animate-pulse-gentle"></div>
          <Icon aria-hidden="true" className="w-16 h-16 text-accent-green relative z-10 animate-bounce-gentle" />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-brand-text-primary font-head uppercase">
            {title}
          </h1>
          <p className="text-brand-text-primary text-base sm:text-lg text-balance">
            {description}
          </p>
        </div>

        <Link to={redirectPath} className="flex justify-center items-center gap-2 group bg-accent-green text-brand-secondary px-6 py-3 rounded-xl">
          <Icon aria-hidden="true" className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>{buttonText}</span>
        </Link>
      </div>
    </div>
  )
}
