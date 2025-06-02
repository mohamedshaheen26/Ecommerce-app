import type { ReactNode } from 'react';
import { MdClose } from 'react-icons/md';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  maxWidth = 'max-w-4xl'
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg p-6 w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <MdClose className="w-6 h-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
} 