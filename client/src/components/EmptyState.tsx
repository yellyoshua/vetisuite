type EmptyStateProps = {
  title: string
  hint: string
}

export default function EmptyState({ title, hint }: EmptyStateProps) {
  return (
    <div className="px-5 py-[34px] text-center">
      <p className="font-head text-sm font-semibold text-ink">{title}</p>
      <p className="mt-[3px] text-[12.5px] text-sub">{hint}</p>
    </div>
  )
}
