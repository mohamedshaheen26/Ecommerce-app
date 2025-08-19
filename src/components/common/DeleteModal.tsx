import { useTranslation } from "react-i18next";
import Modal from "./Modal";
import { useLanguage } from "../../context/LanguageContext";

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
  itemType = "item",
  itemName,
  isDeleting = false,
}: DeleteModalProps) {
  const { t } = useTranslation();
  const { currentLang } = useLanguage();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`${t("Delete")} ${t(title)}`}
      maxWidth='max-w-md'
      variant='delete'
      isSubmitting={isDeleting}
    >
      <p className='text-gray-600'>
        {message ||
          `${t("Are you sure you want to delete")} ${t(
            itemType
          )} "${itemName}" ${currentLang === "ar" ? "؟" : "?"}`}
      </p>
      <span className='text-sm text-red-500'>
        {t("This action cannot be undone.")}
      </span>
    </Modal>
  );
}
