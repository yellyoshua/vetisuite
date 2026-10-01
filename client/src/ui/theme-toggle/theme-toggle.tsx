import { Moon, Sun } from 'lucide-react'
import useThemeToggle, { type ThemeToggleProps } from './theme-toggle.handlers'

export default function ThemeToggle(props: ThemeToggleProps) {
  const { isDark, buttonProps } = useThemeToggle(props)

  return <button {...buttonProps}>{isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}</button>
}
