import { cn } from "@/lib/utils"
import type { ClassNameProps, ChildrenProps } from "@/types"

export interface ButtonProps extends ChildrenProps, ClassNameProps {
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  type?: "button" | "submit" | "reset"
  onClick?: () => void
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-sm",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
  outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
  ghost: "text-gray-600 hover:bg-gray-100",
}

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
}

export function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  className,
  children,
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </button>
  )
}
