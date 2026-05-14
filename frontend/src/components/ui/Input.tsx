import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <label className="block text-sm text-slate-200">
        <span className="mb-2 block text-sm font-medium text-slate-300">
          {label}
        </span>
        <input
          ref={ref}
          className={`w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 ${className ?? ""}`.trim()}
          {...props}
        />
        {error ? <p className="mt-2 text-sm text-rose-400">{error}</p> : null}
      </label>
    );
  },
);

Input.displayName = "Input";
