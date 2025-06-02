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
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </Modal>
  );
} 