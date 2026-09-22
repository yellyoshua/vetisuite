import Spinner from '@/components/legacy-ui/Spinner'

type LoadingStateProps = {
  label?: string
}

export default function LoadingState({ label = 'Cargando…' }: LoadingStateProps) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 px-5 py-[34px] text-[12.5px] text-sub">
      <Spinner />
      {label}
    </div>
  )
}
