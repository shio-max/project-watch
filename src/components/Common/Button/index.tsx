import clsx from "clsx";
import React from "react";

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const Button = ({ onClick, children, className, disabled }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        `inline-flex w-full justify-center rounded-md px-3 py-2 text-md min-w-40 font-semibold text-white shadow-sm sm:w-auto`,
        !disabled && "hover:cursor-pointer hover:opacity-70",
        disabled && "opacity-20 cursor-default",
        className
      )}
    >
      {children}
    </button>
  );
};

export default Button;
