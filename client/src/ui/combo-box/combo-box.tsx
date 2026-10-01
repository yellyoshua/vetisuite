import useComboBox, { type ComboBoxProps } from './combo-box.handlers'

export default function ComboBox(props: ComboBoxProps) {
  const { rootProps, inputProps, hiddenProps, listProps, options, isEmpty, emptyText, emptyProps } = useComboBox(props)

  return (
    <div {...rootProps}>
      <input {...inputProps} />
      <input {...hiddenProps} />
      <ul {...listProps}>
        {options.map((option) => (
          <li key={option.key} {...option.props}>
            {option.label}
          </li>
        ))}
        {isEmpty && (
          <li role="presentation">
            <span {...emptyProps}>{emptyText}</span>
          </li>
        )}
      </ul>
    </div>
  )
}
