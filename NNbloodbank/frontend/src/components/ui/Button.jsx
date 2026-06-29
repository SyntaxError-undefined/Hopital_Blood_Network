import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white shadow-sm hover:bg-primary-dark hover:shadow-md',
        secondary: 'border border-gray-200 bg-white text-text shadow-sm hover:border-gray-300 hover:bg-gray-50',
        outline: 'border border-primary/30 text-primary hover:border-primary hover:bg-primary/5',
        ghost: 'text-text-muted hover:bg-gray-100 hover:text-text',
        danger: 'bg-critical text-white shadow-sm hover:bg-red-700',
        success: 'bg-healthy text-white shadow-sm hover:bg-green-800',
      },
      size: {
        sm: 'h-9 px-3.5 text-sm',
        md: 'h-10 px-5 text-sm',
        lg: 'h-11 px-6 text-sm',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

const Button = forwardRef(({ className, variant, size, ...props }, ref) => (
  <button
    className={cn(buttonVariants({ variant, size, className }))}
    ref={ref}
    {...props}
  />
))
Button.displayName = 'Button'

export { Button, buttonVariants }
