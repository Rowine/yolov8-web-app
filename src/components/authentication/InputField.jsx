export const InputField = ({
  id,
  name,
  type = "text",
  label,
  value,
  onChange,
  placeholder,
  icon,
  rightIcon,
  error,
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-gray-700 text-sm">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className={`block w-full ${icon ? "pl-10" : "pl-3"} ${
            rightIcon ? "pr-10" : "pr-3"
          } py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
            error ? "border-red-300 focus:ring-red-500" : ""
          }`}
          placeholder={placeholder}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
};
