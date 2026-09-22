export type ButtonVariant = 'primary' | 'dark' | 'ghost' | 'danger' | 'amber'

export type ButtonSize = 'md' | 'sm'

const VARIANT_CLASS_NAMES: Record<ButtonVariant, string> = {
  primary: 'border-transparent bg-green text-white',
  dark: 'border-transparent bg-dark text-white',
  ghost: 'border-line bg-transparent text-ink',
  danger: 'border-transparent bg-red-soft text-red',
  amber: 'border-transparent bg-amber-soft text-amber',
}

const SIZE_CLASS_NAMES: Record<ButtonSize, string> = {
  md: 'px-[15px] py-[9px] text-[13.5px]',
  sm: 'px-2.5 py-1.5 text-[12.5px]',
}

export function buttonClassName(variant: ButtonVariant, size: ButtonSize): string {
  return `inline-flex cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-control border font-body font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASS_NAMES[variant]} ${SIZE_CLASS_NAMES[size]}`
}
