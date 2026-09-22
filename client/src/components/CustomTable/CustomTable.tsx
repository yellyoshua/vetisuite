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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">No se encontraron datos disponibles</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">{children}</table>
        </div>
      </div>

      <nav aria-label="Paginación" className="flex justify-between items-center">
        <button
          type="button"
          onClick={prevPage}
          disabled={page === 1}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Anterior
        </button>
        <span aria-live="polite" className="text-sm text-gray-600 dark:text-gray-400">
          Página {page}
        </span>
        <button
          type="button"
          onClick={nextPage}
          disabled={dataSize < 10}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Siguiente
        </button>
      </nav>
    </>
  )
}

CustomTable.Thead = function Thead({ children }: ChildrenProps) {
  return (
    <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
      {children}
    </thead>
  )
}

CustomTable.TableRow = function TableRow({ children, header = false }: TableRowProps) {
  if (header) {
    return <tr>{children}</tr>
  }

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      {children}
    </tr>
  )
}

CustomTable.TheadItem = function TheadItem({ children, className }: CellProps) {
  return (
    <th scope="col" className={twMerge('px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider', className)}>
      {children}
    </th>
  )
}

CustomTable.TBody = function TBody({ children }: ChildrenProps) {
  return (
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
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
      <span className={twMerge('text-sm font-normal text-gray-900 dark:text-white', className)}>
        {children}
      </span>
    </td>
  )
}
