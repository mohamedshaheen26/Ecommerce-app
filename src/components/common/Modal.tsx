import type { ReactNode } from "react";
import { MdClose } from "react-icons/md";
import Button from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
  isSubmitting?: boolean;
  variant?: "save" | "delete";
  confirmText?: string;
  cancelText?: string;
  showSaveBtn?: boolean;
  showCancelBtn?: boolean;
  showActions?: boolean;
  extraActions?: ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  maxWidth = "max-w-2xl",
  isSubmitting = false,
  variant = "save",
  confirmText,
  cancelText = "Cancel",
  showSaveBtn = true,
  showCancelBtn = true,
  showActions = true,
  extraActions,
}: ModalProps) {
  if (!isOpen) return null;

  const getConfirmButton = () => {
    if (variant === "delete") {
      return (
        <Button
          variant='primary'
          onClick={onConfirm}
          disabled={isSubmitting}
          isLoading={isSubmitting}
          loadingText='Deleting...'
        >
          Delete
        </Button>
      );
    }

    return (
      <Button
        variant='primary'
        type='submit'
        disabled={isSubmitting}
        isLoading={isSubmitting}
        loadingText={
          confirmText ? `${confirmText.replace(/e?$/, "")}ing...` : "Saving..."
        }
      >
        {confirmText || "Save"}
      </Button>
    );
  };

  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50'>
      <div
        className={`bg-[var(--bg-primary)] rounded-lg w-full ${maxWidth} max-h-[90vh] flex flex-col`}
      >
        {/* Sticky Header */}
        <div className='bg-[var(--bg-secondary)] border-b border-[var(--border-color)] flex justify-between items-center px-6 py-3 sticky top-0 z-10 rounded-t-lg'>
          <h2 className='text-xl font-semibold text-[var(--text-secondary)]'>
            {title}
          </h2>
          <Button
            variant='outline'
            size='sm'
            onClick={onClose}
            className=' border-none'
          >
            <MdClose className='w-6 h-6' />
          </Button>
        </div>
        <form onSubmit={onConfirm} className='space-y-4 overflow-y-auto'>
          {/* Scrollable Content */}
          <div className='px-6 py-4 flex-1'>{children}</div>

          {/* Sticky Footer */}
          {showActions && (
            <div className='bg-[var(--bg-secondary)] border-t border-[var(--border-color)] flex justify-end space-x-3 px-6 py-3 sticky bottom-0 z-10 rounded-b-lg'>
              {extraActions}

              {showSaveBtn && getConfirmButton()}

              {showCancelBtn && (
                <Button
                  className=''
                  variant='danger'
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  {cancelText}
                </Button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
