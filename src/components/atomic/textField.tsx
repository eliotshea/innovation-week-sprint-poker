import classNames from "classnames";
import React, { useState } from "react";

export interface TextFieldProps {
  placeholder: string;
  id: string;
  password?: boolean;
  value?: string;
  className?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  name?: string;
  error?: string | null;
  required?: boolean;
  autoComplete?: boolean;
}

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (props, ref) => {
    const password = props.password ?? false;
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const input = (
      <input
        id={props.id}
        value={props.value}
        placeholder={props.placeholder}
        className={classNames(
          "flex-1 rounded-lg bg-gray-200 px-4 py-2 text-slate-900",
          {
            "outline outline-red-500": props.error,
          },
        )}
        type={password ? (showPassword ? "text" : "password") : "text"}
        required={props.required}
        autoComplete={props.autoComplete ? "on" : "off"}
        onChange={props.onChange}
        onBlur={props.onBlur}
        onKeyDown={props.onKeyDown}
        name={props.name}
        ref={ref}
      />
    );

    return (
      <div className={classNames("relative flex flex-col", props.className)}>
        {password ? (
          <div className="relative flex w-full">
            {input}
            <p
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm leading-7 text-slate-900 text-opacity-60"
            >
              {showPassword ? "Hide" : "Show"}
            </p>
          </div>
        ) : (
          input
        )}
        {props?.error && (
          <p className="absolute left-2 top-full mt-1 text-sm text-red-500">
            {props.error}
          </p>
        )}
      </div>
    );
  },
);
TextField.displayName = "TextField";

export default TextField;
