// components/admin/ConfirmDeleteButtons.tsx
"use client";

type BtnProps = {
  label?: string;
  confirmMessage: string;
  className?: string;
  disabled?: boolean;
};

export function ConfirmDeleteButton({
  label = "Delete",
  confirmMessage,
  className,
  disabled,
}: BtnProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const ok = window.confirm(confirmMessage);
    if (!ok) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <button
      type="submit"
      onClick={handleClick}
      className={className}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
