import useSelect, { type SelectProps } from './select.handlers'

export default function Select(props: SelectProps) {
  const { options, placeholder, selectProps } = useSelect(props)

  return (
    <select {...selectProps}>
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
      {selectProps.children}
    </select>
  )
}
