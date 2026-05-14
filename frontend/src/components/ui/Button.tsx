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
      primary: "bg-sky-500 text-white hover:bg-sky-400",
      secondary:
        "border border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700",
      danger: "bg-rose-600 text-white hover:bg-rose-500",
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
