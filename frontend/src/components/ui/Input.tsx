import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <label className="block text-sm text-slate-700">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          {label}
        </span>
        <input
          ref={ref}
          className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 ${className ?? ""}`.trim()}
          {...props}
        />
        {error ? <p className="mt-2 text-xs font-medium text-rose-500">{error}</p> : null}
      </label>
    );
  },
);

Input.displayName = "Input";
