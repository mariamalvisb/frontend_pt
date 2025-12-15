"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  variant?: "primary" | "secondary";
};

export function Button({
  children,
  type = "button",
  disabled,
  onClick,
  variant = "primary",
}: Props) {
  const cls = variant === "primary" ? "btn btn-primary" : "btn btn-secondary";

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
