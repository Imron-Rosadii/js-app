import type { TextProps } from "../../types";

export const Text = ({
  children,
  variant = "body",
  className = "",
  as: Component = "p",
}: TextProps) => {
  const variants: Record<NonNullable<TextProps["variant"]>, string> = {
    body: "text-gray-600",
    small: "text-sm text-gray-500",
    caption: "text-xs text-gray-400",
    error: "text-red-600",
    success: "text-green-600",
  };

  return (
    <Component className={`${variants[variant]} ${className}`}>
      {children}
    </Component>
  );
};
