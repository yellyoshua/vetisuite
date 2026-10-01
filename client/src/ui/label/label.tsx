import useLabel, { type LabelProps } from './label.handlers'

export default function Label(props: LabelProps) {
  const { required, labelProps } = useLabel(props)

  return (
    <label {...labelProps}>
      {labelProps.children}
      {required && (
        <span aria-hidden="true" className="text-danger">
          *
        </span>
      )}
    </label>
  )
}
