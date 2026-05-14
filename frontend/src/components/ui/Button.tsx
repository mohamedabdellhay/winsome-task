import { ButtonHTMLAttributes, forwardRef } from "react";
import { LoadingSpinner } from "./LoadingSpinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      loading = false,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-60";

    const variantStyles = {
      primary: "bg-brand-primary text-white hover:bg-brand-primary/90 shadow-md shadow-brand-primary/20",
      secondary:
        "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm",
      danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/20",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className ?? ""}`.trim()}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <LoadingSpinner size={18} /> : null}
        <span className={loading ? "ml-2" : ""}>{children}</span>
      </button>
    );
  },
);

Button.displayName = "Button";
