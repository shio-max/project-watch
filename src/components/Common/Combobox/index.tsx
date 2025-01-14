import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { ValidationRule } from "@/types/validates";

interface CustomComboboxProps {
  placeholder?: string;
  value?: { id: number; name: string } | null;
  list: { id: number; name: string }[];
  validations?: ValidationRule[];
  onChange: (value: { id: number; name: string }) => void;
  onValidationChange?: (error: boolean) => void;
}

const CustomCombobox = ({
  placeholder = "選択してください",
  value = null,
  list,
  validations = [],
  onChange,
  onValidationChange,
}: CustomComboboxProps) => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(value);
  const [error, setError] = useState<string | null>(null);

  const filteredList =
    query === ""
      ? list
      : list.filter((item) =>
          item.name.toLowerCase().includes(query.toLowerCase())
        );

  const runValidations = (
    currentValue: { id: number; name: string } | null
  ) => {
    let hasError = false;

    for (const rule of validations) {
      if (currentValue && !rule.validate(currentValue.name)) {
        setError(rule.message);
        hasError = true;
        break;
      }
    }

    if (!hasError) {
      setError(null);
    }

    if (onValidationChange) {
      onValidationChange(hasError);
    }
  };

  useEffect(() => {
    setSelected(value);
    runValidations(value);
  }, [value]);

  const handleChange = (value: { id: number; name: string }) => {
    setSelected(value);
    setQuery(""); // 選択時に検索クエリをリセット
    onChange(value);
    runValidations(value);
  };

  return (
    <div className="w-full">
      <Combobox value={selected} onChange={handleChange}>
        <div className="relative">
          <ComboboxInput
            className={clsx(
              "w-full rounded-lg border border-gray-300 bg-white py-2 pr-8 pl-3 text-md text-gray-700",
              "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400",
              error && "border-red-500 focus:ring-red-400"
            )}
            displayValue={(item: { id: number; name: string }) =>
              item?.name || ""
            }
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            placeholder={placeholder}
          />
          <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
            <FiChevronDown className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
          </ComboboxButton>
        </div>

        <ComboboxOptions
          className={clsx(
            "absolute z-10 mt-1 w-80 overflow-auto rounded-lg border border-gray-300 bg-white shadow-lg",
            "p-1 focus:outline-none"
          )}
        >
          {filteredList.map((item) => (
            <ComboboxOption
              key={item.id}
              value={item}
              className={({ active }) =>
                clsx(
                  "cursor-pointer select-none rounded-md py-2 px-3 combobox-option",
                  active ? "bg-blue-100 text-blue-900" : "text-gray-700"
                )
              }
            >
              {item.name}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default CustomCombobox;
