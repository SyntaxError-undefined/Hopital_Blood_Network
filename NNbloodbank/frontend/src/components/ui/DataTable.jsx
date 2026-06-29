import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/utils'
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from './Table'
import { EmptyState } from './PageElements'

export function Pagination({ page, totalPages, onPageChange, totalItems, pageSize }) {
  if (totalPages <= 1) return null
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-text-muted">
        Showing <span className="font-medium text-text">{start}–{end}</span> of{' '}
        <span className="font-medium text-text">{totalItems}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="rounded-lg p-2 text-text-muted transition-colors hover:bg-gray-100 disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'h-8 min-w-8 rounded-lg px-2 text-sm font-medium transition-colors',
              p === page ? 'bg-primary text-white' : 'text-text-muted hover:bg-gray-100'
            )}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="rounded-lg p-2 text-text-muted transition-colors hover:bg-gray-100 disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function SortIcon({ active, direction }) {
  if (!active) return <ChevronsUpDown className="h-3.5 w-3.5 text-text-light" />
  return direction === 'asc'
    ? <ChevronUp className="h-3.5 w-3.5 text-primary" />
    : <ChevronDown className="h-3.5 w-3.5 text-primary" />
}

export function DataTable({
  columns,
  data,
  pageSize = 8,
  emptyIcon,
  emptyTitle = 'No data found',
  emptyDescription,
  onRowClick,
  rowKey = 'id',
}) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)

  const sorted = useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  if (!data.length) {
    return (
      <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
    )
  }

  return (
    <div>
      <Table>
        <TableHeader>
          {columns.map((col) => (
            <TableHead key={col.key}>
              {col.sortable ? (
                <button
                  onClick={() => handleSort(col.key)}
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-text"
                >
                  {col.label}
                  <SortIcon active={sortKey === col.key} direction={sortDir} />
                </button>
              ) : (
                col.label
              )}
            </TableHead>
          ))}
        </TableHeader>
        <TableBody>
          {paginated.map((row) => (
            <TableRow
              key={row[rowKey]}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <TableCell key={col.key}>
                  {col.render ? col.render(row) : row[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={sorted.length}
        pageSize={pageSize}
      />
    </div>
  )
}
