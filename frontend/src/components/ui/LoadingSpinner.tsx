interface LoadingSpinnerProps {
  size?: number;
}

export function LoadingSpinner({ size = 20 }: LoadingSpinnerProps) {
  return (
    <div
      className="inline-block animate-spin rounded-full border-2 border-current border-r-transparent text-white"
      style={{ width: size, height: size }}
    />
  );
}
