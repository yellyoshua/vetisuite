import useGrid, { type GridProps } from './grid.handlers'

export default function Grid(props: GridProps) {
  const { gridProps } = useGrid(props)

  return <div {...gridProps} />
}
