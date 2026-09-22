type AvatarSize = 32 | 34

const SIZE_CLASS_NAMES: Record<AvatarSize, string> = {
  32: 'size-8 text-xs',
  34: 'size-[34px] text-[13px]',
}

type AvatarProps = {
  initials: string
  size?: AvatarSize
}

export default function Avatar({ initials, size = 34 }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-avatar bg-green-soft font-head font-bold text-green ${SIZE_CLASS_NAMES[size]}`}
    >
      {initials}
    </span>
  )
}
