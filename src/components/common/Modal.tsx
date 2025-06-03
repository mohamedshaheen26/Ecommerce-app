import type { ReactNode } from 'react';
import { MdClose } from 'react-icons/md';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
  isSubmitting?: boolean;
  variant?: 'save' | 'delete';
  confirmText?: string;
  cancelText?: string;
  showActions?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  maxWidth = 'max-w-2xl',
  isSubmitting = false,
  variant = 'save',
  confirmText,
  cancelText = 'Cancel',
  showActions = true
}: ModalProps) {
  if (!isOpen) return null;

  const getConfirmButton = () => {
    if (variant === 'delete') {
      return (
        <Button
          variant="danger"
          onClick={onConfirm}
          disabled={isSubmitting}
          isLoading={isSubmitting}
          loadingText="Deleting..."
        >
          Delete
        </Button>
      );
    }

    return (
      <Button
        variant="secondary"
        type={onConfirm ? 'button' : 'submit'}
        onClick={onConfirm}
        disabled={isSubmitting}
        isLoading={isSubmitting}
        loadingText={confirmText ? `${confirmText.replace(/e?$/, '')}ing...` : 'Saving...'}
      >
        {confirmText || 'Save'}
      </Button>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg w-full ${maxWidth} max-h-[90vh] flex flex-col`}>
        {/* Sticky Header */}
        <div className="border-b border-gray-200 flex justify-between items-center px-6 py-3 sticky top-0 bg-gray-100 z-10">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className=" border-none hover:bg-transparent hover:text-gray-900 bg-gray-100"
          >
            <MdClose className="w-6 h-6" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Sticky Footer */}
        {showActions && onConfirm && (
          <div className="border-t border-gray-200 flex justify-end space-x-3 px-6 py-3 sticky bottom-0 bg-gray-100 z-10">
            <Button
              className='bg-white'
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {cancelText}
            </Button>
            {getConfirmButton()}
          </div>
        )}
      </div>
    </div>
  );
} 