import useTableCaption, { type TableCaptionProps } from './table-caption.handlers'

export default function TableCaption(props: TableCaptionProps) {
  const { captionProps } = useTableCaption(props)

  return <caption {...captionProps} />
}
