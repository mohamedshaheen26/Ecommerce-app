import Button from '../common/Button';
import Modal from '../common/Modal';

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productTitle: string;
}

export default function DeleteProductModal({
  isOpen,
  onClose,
  onConfirm,
  productTitle
}: DeleteProductModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Product"
      maxWidth="max-w-md"
    >
      <div className="mb-6">
        <p className="text-gray-500">
          Are you sure you want to delete {productTitle}? This action cannot be undone.
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          onClick={onClose}
          variant="secondary"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="danger"
        >
          Delete
        </Button>
      </div>
    </Modal>
  );
} 