import type { HeadingProps } from "../../types";
import type { ElementType } from "react";

export const Heading = ({
  level = 1,
  children,
  className = "",
}: HeadingProps) => {
  const Tag: ElementType = `h${level}`;

  const styles: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
    1: "text-4xl md:text-5xl font-bold",
    2: "text-3xl md:text-4xl font-semibold",
    3: "text-2xl md:text-3xl font-semibold",
    4: "text-xl md:text-2xl font-medium",
    5: "text-lg md:text-xl font-medium",
    6: "text-base md:text-lg font-medium",
  };

  return (
    <Tag className={`${styles[level]} text-gray-900 ${className}`}>
      {children}
    </Tag>
  );
};
