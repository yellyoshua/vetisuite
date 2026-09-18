import { NotFoundError } from '@/lib/not-found-error'

type ErrorStateProps = {
  error: Error
}

export default function ErrorState({ error }: ErrorStateProps) {
  const title = error instanceof NotFoundError ? 'No encontrado' : 'No se pudo cargar'

  return (
    <div role="alert" className="px-5 py-[34px] text-center">
      <p className="font-head text-sm font-semibold text-red">{title}</p>
      <p className="mt-[3px] text-[12.5px] text-sub">{error.message}</p>
    </div>
  )
}
