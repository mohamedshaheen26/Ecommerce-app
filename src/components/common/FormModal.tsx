import type { ReactNode } from 'react';
import Modal from './Modal';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  maxWidth?: string;
}

export default function FormModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = 'Save',
  cancelText = 'Cancel',
  isLoading = false,
  maxWidth = 'max-w-2xl'
}: FormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth={maxWidth}
    >
      <form onSubmit={onSubmit} className="space-y-6">
        {children}
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : submitText}
          </button>
        </div>
      </form>
    </Modal>
  );
} 