import useList, { listItemClassName, type ListItemProps, type ListProps } from './list.handlers'

export default function List(props: ListProps) {
  const { listProps } = useList(props)

  return <ul {...listProps} />
}

export function ListItem({ className, ...rest }: ListItemProps) {
  return <li {...rest} className={listItemClassName(className)} />
}
