import { ValidationRule } from "@/types/validates";
import { validateValue } from "@/utils/validates";
import React, { useState } from "react";

interface TextareaProps {
  name: string;
  placeholder?: string;
  value?: string;
  validations?: ValidationRule[];
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onValidationChange?: (error: boolean) => void;
}

const Textarea = ({
  name,
  value = "",
  placeholder,
  onChange,
  validations = [],
  onValidationChange,
}: TextareaProps) => {
  const [error, setError] = useState<string | null>(null);

  // バリデーション検証
  const runValidations = (currentValue: string) => {
    const { hasError, errorMessage } = validateValue(currentValue, validations);

    setError(errorMessage);
    if (onValidationChange) {
      onValidationChange(hasError);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
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
      <textarea
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={handleBlur}
        rows={4}
        className={`border p-2 w-full rounded-lg ${
          error ? "border-red-500" : ""
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Textarea;
