export default function LoadingSpinner({ size = "md", color = "green", className = "" }: { size?: "sm" | "md" | "lg", color?: "green" | "blue" | "gray", className?: string }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  const colorClasses = {
    green: "text-green-600",
    blue: "text-blue-600",
    gray: "text-gray-600"
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 ${sizeClasses[size]} ${colorClasses[color]} ${className}`}></div>
  );
}
