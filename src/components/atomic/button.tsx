import classNames from "classnames";
import React from "react";

export interface ButtonProps {
  size?: string;
  type?: "primary" | "cancel";
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  id?: string;
  square?: boolean;
  pill?: boolean;
  value?: string;
}

const Button = ({
  onClick,
  children,
  className,
  disabled,
  id,
  square = false,
  pill = false,
  type = "primary",
  value,
}: ButtonProps) => {
  const squareClass = classNames(
    "py-2 text-neutral-50  disabled:cursor-not-allowed disabled:opacity-50",
    square ? "px-2" : "px-4",
    pill ? "rounded-full" : "rounded-lg",
    className,
    {
      "bg-thd-brand hover:bg-thd-brand-hover": type === "primary",
      "bg-red-500 hover:bg-red-600": type === "cancel",
    },
  );

  return (
    <button
      onClickCapture={onClick}
      disabled={disabled}
      className={squareClass}
      id={id}
      value={value}
    >
      {children}
    </button>
  );
};

export default Button;
