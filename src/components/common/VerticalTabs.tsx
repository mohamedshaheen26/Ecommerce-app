import type { ReactNode } from "react";

export interface VerticalTabItem<T extends string> {
  id: T;
  label: ReactNode;
  icon?: (isActive: boolean) => ReactNode;
}

interface VerticalTabsProps<T extends string> {
  items: VerticalTabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
}

export default function VerticalTabs<T extends string>({
  items,
  activeTab,
  onChange,
  className = "",
}: VerticalTabsProps<T>) {
  return (
    <div className={`space-y-2 ${className}`} role='tablist' aria-orientation='vertical'>
      {items.map((item) => {
        const isActive = item.id === activeTab;

        return (
          <button
            key={item.id}
            type='button'
            role='tab'
            aria-selected={isActive}
            className={`cursor-pointer w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                : "text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-secondary)]"
            }`}
            onClick={() => onChange(item.id)}
          >
            {item.icon?.(isActive)}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
