import type { ReactNode } from "react";

interface GridProps {
  children: ReactNode;
  columns?:
    | 1
    | 2
    | 3
    | 4
    | 6
    | Partial<Record<"default" | "sm" | "md" | "lg" | "xl", 1 | 2 | 3 | 4 | 6>>;
  gap?: 2 | 4 | 6 | 8;
  className?: string;
}

export default function Grid({
  children,
  columns = 2, // Default to 2 columns if not specified
  gap = 4,
  className = "",
}: GridProps) {
  const gridColsMap = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    6: "grid-cols-6",
  };

  const gapSizes = {
    2: "gap-2",
    4: "gap-4",
    6: "gap-6",
    8: "gap-8",
  };

  const getColumnsClass = () => {
    if (typeof columns === "number") {
      return gridColsMap[columns];
    }

    const colClasses: string[] = [];
    if (columns.default) {
      colClasses.push(gridColsMap[columns.default]);
    } else {
      colClasses.push(gridColsMap[2]); // Default to 2 columns if no default is provided
    }
    if (columns.sm) {
      colClasses.push(`sm:${gridColsMap[columns.sm]}`);
    }
    if (columns.md) {
      colClasses.push(`md:${gridColsMap[columns.md]}`);
    }
    if (columns.lg) {
      colClasses.push(`lg:${gridColsMap[columns.lg]}`);
    }
    if (columns.xl) {
      colClasses.push(`xl:${gridColsMap[columns.xl]}`);
    }
    return colClasses.join(" ");
  };

  return (
    <div
      className={`grid items-start ${getColumnsClass()} ${
        gapSizes[gap]
      } ${className}`}
    >
      {children}
    </div>
  );
}
