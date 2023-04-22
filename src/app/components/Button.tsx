import React, { FC, MouseEventHandler, PropsWithChildren } from "react";
import classNames from "classnames";

type Props = {
  className?: string;
  variant?: "primary" | "secondary";
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export const Button: FC<PropsWithChildren<Props>> = ({
  children,
  className,
  variant = "primary",
  onClick
}) => (
  <button
    className={classNames("button", className, {
      "button--primary": variant === "primary",
      "button--secondary": variant === "secondary"
    })}
    onClick={onClick}
  >
    {children}
  </button>
);
