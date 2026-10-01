import useRadioGroup, { type RadioGroupProps } from './radio-group.handlers'

export default function RadioGroup(props: RadioGroupProps) {
  const { items, groupProps } = useRadioGroup(props)

  return (
    <div {...groupProps}>
      {items.map((item) => (
        <label key={item.key} className={item.labelClassName}>
          <span className={item.rootClassName}>
            <input {...item.inputProps} />
            <span aria-hidden="true" className={item.circleClassName}>
              <span className="size-1.5 rounded-full bg-primary-foreground" />
            </span>
          </span>
          {item.label}
        </label>
      ))}
    </div>
  )
}
