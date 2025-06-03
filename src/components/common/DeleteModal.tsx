import Modal from './Modal';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  itemType?: string;
  itemName: string;
  isDeleting?: boolean;
}

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemType = 'item',
  itemName,
  isDeleting = false
}: DeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title || `Delete ${itemType}`}
      maxWidth="max-w-md"
      variant="delete"
      isSubmitting={isDeleting}
    >
      <p className="text-gray-600">
        {message || `Are you sure you want to delete ${itemType} "${itemName}" ?`}
      </p>
      <span className="text-sm text-red-500">This action cannot be undone.</span>
    </Modal>
  );
} 