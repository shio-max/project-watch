import { ValidationRule } from "@/types/validates";
import { validateValue } from "@/utils/validates";
import React, { useState } from "react";

interface InputProps {
  type: string;
  name: string;
  placeholder?: string;
  value?: string;
  validations?: ValidationRule[];
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onValidationChange?: (error: boolean) => void;
}

const Input = ({
  type,
  name,
  value = "",
  placeholder,
  onChange,
  onKeyDown,
  validations = [],
  onValidationChange,
}: InputProps) => {
  const [error, setError] = useState<string | null>(null);

  // バリデーション検証
  const runValidations = (currentValue: string) => {
    const { hasError, errorMessage } = validateValue(currentValue, validations);

    setError(errorMessage);
    if (onValidationChange) {
      onValidationChange(hasError);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(event);
    }
    runValidations(event.target.value);
  };

  const handleBlur = () => {
    runValidations(value);
  };

  return (
    <div className="w-full">
      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={onKeyDown}
        className={`border p-2 w-full rounded-lg ${
          error ? "border-red-500" : ""
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
