"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
};

export function Button({
  children,
  type = "button",
  disabled,
  onClick,
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
    >
      {children}
    </button>
  );
}
