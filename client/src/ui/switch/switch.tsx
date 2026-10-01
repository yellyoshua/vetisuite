import useSwitch, { type SwitchProps } from './switch.handlers'

export default function Switch(props: SwitchProps) {
  const { switchProps, thumbClassName, hiddenInputProps } = useSwitch(props)

  return (
    <>
      <button {...switchProps}>
        <span className={thumbClassName} />
      </button>
      {hiddenInputProps && <input {...hiddenInputProps} />}
    </>
  )
}
