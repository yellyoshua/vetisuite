import type { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

type CustomTableProps = {
  children?: ReactNode
  dataSize?: number
  currentPage?: number | string
  nextPage?: () => void
  prevPage?: () => void
}

type ChildrenProps = {
  children?: ReactNode
}

type TableRowProps = ChildrenProps & {
  header?: boolean
}

type CellProps = ChildrenProps & {
  className?: string
}

type BodyCellProps = CellProps & {
  type?: 'actions'
}

export default function CustomTable({ children, dataSize = 0, currentPage = 1, nextPage, prevPage }: CustomTableProps) {
  const page = Number(currentPage) || 1

  if (dataSize === 0) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No se encontraron datos disponibles</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">{children}</table>
        </div>
      </div>

      <nav aria-label="Paginación" className="flex justify-between items-center">
        <button
          type="button"
          onClick={prevPage}
          disabled={page === 1}
          className="px-4 py-2 bg-card border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
        >
          Anterior
        </button>
        <span aria-live="polite" className="text-sm text-muted-foreground">
          Página {page}
        </span>
        <button
          type="button"
          onClick={nextPage}
          disabled={dataSize < 10}
          className="px-4 py-2 bg-card border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
        >
          Siguiente
        </button>
      </nav>
    </>
  )
}

CustomTable.Thead = function Thead({ children }: ChildrenProps) {
  return (
    <thead className="bg-muted border-b border-border">
      {children}
    </thead>
  )
}

CustomTable.TableRow = function TableRow({ children, header = false }: TableRowProps) {
  if (header) {
    return <tr>{children}</tr>
  }

  return (
    <tr className="hover:bg-muted transition-colors">
      {children}
    </tr>
  )
}

CustomTable.TheadItem = function TheadItem({ children, className }: CellProps) {
  return (
    <th scope="col" className={twMerge('px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider', className)}>
      {children}
    </th>
  )
}

CustomTable.TBody = function TBody({ children }: ChildrenProps) {
  return (
    <tbody className="divide-y divide-border">
      {children}
    </tbody>
  )
}

CustomTable.TBodyItem = function TBodyItem({ children, className, type }: BodyCellProps) {
  if (type === 'actions') {
    return (
      <td className="px-6 py-4 gap-2 flex justify-end whitespace-nowrap text-right text-sm font-medium">
        {children}
      </td>
    )
  }

  return (
    <td className="px-6 py-4 whitespace-nowrap">
      <span className={twMerge('text-sm font-normal text-foreground', className)}>
        {children}
      </span>
    </td>
  )
}
