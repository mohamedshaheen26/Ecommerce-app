import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { BsThreeDotsVertical } from "react-icons/bs";

interface MenuItem {
  label: string;
  onClick: () => void;
  className?: string;
  hidden?: boolean;
}

interface DropdownMenuProps {
  items: MenuItem[];
}

export default function DropdownMenu({ items }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function updatePosition() {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY,
          left: rect.right + window.scrollX,
        });
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    if (isOpen) {
      updatePosition();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  const visibleItems = items.filter((item) => !item.hidden);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className='p-1 rounded-full  focus:outline-none cursor-pointer'
      >
        <BsThreeDotsVertical className='w-5 h-5 text-gray-500 hover:text-[var(--accent-primary)]' />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: `${position.top}px`,
              left: `${position.left}px`,
              transform: "translateX(-100%)",
            }}
            className='mt-2 w-32 rounded-lg shadow-sm bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)]'
          >
            <div role='menu' aria-orientation='vertical'>
              {visibleItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--accent-hover)] hover:text-[var(--text-primary)] flex items-center cursor-pointer ${
                    item.className || ""
                  }
                    ${
                      visibleItems.length === 1
                        ? "rounded-lg"
                        : index === 0
                        ? "rounded-t-lg"
                        : index === visibleItems.length - 1
                        ? "rounded-b-lg"
                        : ""
                    }
                  `}
                  role='menuitem'
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
