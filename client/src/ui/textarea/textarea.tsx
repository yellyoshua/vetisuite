import useTextarea, { type TextareaProps } from './textarea.handlers'

export default function Textarea(props: TextareaProps) {
  const { textareaProps } = useTextarea(props)

  return <textarea {...textareaProps} />
}
