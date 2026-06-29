import { cn } from '@/utils'
import { StatusBadge } from './Badge'

export function Table({ children, className, bare }) {
  const table = <table className={cn('w-full text-sm', className)}>{children}</table>
  if (bare) return table
  return <div className="overflow-x-auto">{table}</div>
}

export function TableHeader({ children }) {
  return (
    <thead>
      <tr className="border-b border-gray-100 bg-gray-50/60">{children}</tr>
    </thead>
  )
}

export function TableHead({ children, className }) {
  return (
    <th
      className={cn(
        'px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-light',
        className
      )}
    >
      {children}
    </th>
  )
}

export function TableBody({ children }) {
  return <tbody className="divide-y divide-gray-50">{children}</tbody>
}

export function TableRow({ children, className, onClick }) {
  return (
    <tr
      className={cn(
        'bg-white transition-colors hover:bg-gray-50/60',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

export function TableCell({ children, className }) {
  return (
    <td className={cn('px-5 py-4 text-sm text-text', className)}>{children}</td>
  )
}

export function InventoryTable({ data }) {
  return (
    <Table>
      <TableHeader>
        <TableHead>Blood Type</TableHead>
        <TableHead>Available</TableHead>
        <TableHead>Reserved</TableHead>
        <TableHead>Expiring Soon</TableHead>
        <TableHead>Status</TableHead>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.bloodType || item.id}>
            <TableCell>
              <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-primary/8 px-2 text-sm font-bold text-primary">
                {item.bloodType}
              </span>
            </TableCell>
            <TableCell className="font-semibold">{item.available}</TableCell>
            <TableCell className="text-text-muted">{item.reserved}</TableCell>
            <TableCell>
              <span className={cn(item.expiringSoon > 2 && 'font-semibold text-warning')}>
                {item.expiringSoon}
              </span>
            </TableCell>
            <TableCell>
              <StatusBadge status={item.status} size="sm" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
