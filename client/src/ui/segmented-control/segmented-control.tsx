import useSegmentedControl, { type SegmentedControlProps } from './segmented-control.handlers'

export default function SegmentedControl(props: SegmentedControlProps) {
  const { groupProps, hiddenProps, items } = useSegmentedControl(props)

  return (
    <div {...groupProps}>
      {items.map((item) => (
        <button key={item.key} {...item.props}>
          {item.icon && <span aria-hidden="true">{item.icon}</span>}
          {item.label}
        </button>
      ))}
      {hiddenProps && <input {...hiddenProps} />}
    </div>
  )
}
