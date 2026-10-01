import { Search } from 'lucide-react'
import useSearchInput, { type SearchInputProps } from './search-input.handlers'

export default function SearchInput(props: SearchInputProps) {
  const { shortcut, rootClassName, iconClassName, kbdClassName, inputProps } = useSearchInput(props)

  return (
    <div className={rootClassName}>
      <Search aria-hidden="true" className={iconClassName} />
      <input {...inputProps} />
      {shortcut && (
        <kbd aria-hidden="true" className={kbdClassName}>
          {shortcut}
        </kbd>
      )}
    </div>
  )
}
