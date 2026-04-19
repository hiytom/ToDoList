import React from "react";

export function cls(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Chip({
  id,
  dataRole,
  children,
}: {
  id?: string;
  dataRole?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      id={id}
      data-role={dataRole}
      className="inline-flex items-center rounded-full bg-[var(--card2)] px-2 py-1 text-xs text-[var(--muted)] ring-1 ring-[var(--border)]"
    >
      {children}
    </span>
  );
}

export function SecondaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { id, className, ...rest } = props;
  return (
    <button
      id={id}
      data-role="secondary-button"
      {...rest}
      className={cls(
        "rounded-xl border-0 bg-[var(--card2)] px-[var(--btnX)] py-[var(--btnY)] text-sm ring-0",
        "hover:bg-[var(--accentSoft)] transition-colors",
        "focus:outline-none focus:ring-0",
        className
      )}
    />
  );
}

export function IconButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { id, className, ...rest } = props;
  return (
    <button
      id={id}
      data-role="icon-button"
      {...rest}
      className={cls(
        "rounded-xl border-0 bg-[var(--card2)] p-[var(--btnY)] ring-0",
        "hover:bg-[var(--accentSoft)] transition-colors",
        "focus:outline-none focus:ring-0",
        className
      )}
    />
  );
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { id, className, ...rest } = props;
  return (
    <button
      id={id}
      data-role="primary-button"
      {...rest}
      className={cls(
        "inline-flex items-center justify-center gap-2 rounded-xl",
        "border-0 bg-[var(--accentSoft)] px-4 py-[var(--btnY)] text-sm text-[var(--fg)] ring-0",
        "hover:bg-[var(--accentSoftHover)] transition-colors",
        "whitespace-nowrap min-w-[92px]",
        "focus:outline-none focus:ring-0",
        className
      )}
    />
  );
}
