export const LoadingSpinner = ({
  children,
  variant = "overlay", // "overlay" | "inline"
  size = "medium", // "small" | "medium" | "large"
  className = "",
}) => {
  const sizeClasses = {
    small: "h-6 w-6 border-2",
    medium: "h-10 w-10 border-4",
    large: "h-16 w-16 border-4",
  };

  const spinnerClass = `${sizeClasses[size]} rounded-full border-green-600 border-t-transparent animate-spin`;

  if (variant === "inline") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className={spinnerClass} />
        {children && <p className="ml-3 text-gray-700">{children}</p>}
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 bg-green-50/80 flex items-center justify-center z-50 ${className}`}
    >
      <div className="bg-white p-6 rounded-xl shadow-sm text-center">
        <div className={`${spinnerClass} mx-auto mb-4`} />
        {children && <p className="text-gray-700">{children}</p>}
      </div>
    </div>
  );
};
