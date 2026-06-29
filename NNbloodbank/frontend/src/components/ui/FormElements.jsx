import { Search, ChevronDown } from 'lucide-react'
import { cn } from '@/utils'

const inputClass =
  'h-10 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-text placeholder:text-text-light transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15'

export function SearchBar({ value, onChange, placeholder = 'Search...', className }) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-light" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(inputClass, 'pl-10')}
      />
    </div>
  )
}

export function FilterDropdown({ value, onChange, options, placeholder = 'Filter', className }) {
  return (
    <div className={cn('relative', className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputClass, 'appearance-none cursor-pointer pr-9')}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-light" />
    </div>
  )
}

export function Input({ label, error, className, ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-text">{label}</label>
      )}
      <input
        className={cn(inputClass, error && 'border-critical focus:ring-critical/15')}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-critical">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className, ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-text">{label}</label>
      )}
      <textarea
        className={cn(
          'w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-text placeholder:text-text-light transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15',
          error && 'border-critical focus:ring-critical/15'
        )}
        rows={4}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-critical">{error}</p>}
    </div>
  )
}

export function Select({ label, error, options, className, ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-text">{label}</label>
      )}
      <div className="relative">
        <select
          className={cn(inputClass, 'appearance-none cursor-pointer pr-9', error && 'border-critical')}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-light" />
      </div>
      {error && <p className="mt-1.5 text-xs text-critical">{error}</p>}
    </div>
  )
}

export function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div>
        <p className="text-sm font-medium text-text">{label}</p>
        {description && <p className="mt-0.5 text-sm text-text-muted">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
          checked ? 'bg-primary' : 'bg-gray-200'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
            checked && 'translate-x-5'
          )}
        />
      </button>
    </div>
  )
}
