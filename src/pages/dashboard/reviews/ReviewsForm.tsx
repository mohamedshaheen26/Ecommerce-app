import { useTranslation } from "react-i18next";
import Modal from "../../../components/common/Modal";
import { useLanguage } from "../../../context/LanguageContext";
import type { IReviewAdminItem } from "../../../types";
import { formatDate } from "../../../utils/formatDate";

interface ReviewsFormProps {
  isOpen: boolean;
  review: IReviewAdminItem;
  onClose: () => void;
}

const ReviewsForm = ({ isOpen, review, onClose }: ReviewsFormProps) => {
  const { t } = useTranslation();
  const { currentLang } = useLanguage();

  const productName =
    currentLang === "ar"
      ? review.product_name_ar || review.product_title || t("Unknown Product")
      : review.product_title || review.product_name_ar || t("Unknown Product");

  const reviewerName =
    currentLang === "ar"
      ? review.customer_name_ar ||
        review.customer_full_name ||
        review.name ||
        t("Unknown Reviewer")
      : review.customer_full_name ||
        review.customer_name_ar ||
        review.name ||
        t("Unknown Reviewer");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Review Details'
      maxWidth='max-w-2xl'
      showActions={false}
    >
      <div className='space-y-4'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div>
            <p className='text-xs text-[var(--text-muted)] mb-1'>{t("Product")}</p>
            <p className='text-sm text-[var(--text-secondary)]'>{productName}</p>
          </div>
          <div>
            <p className='text-xs text-[var(--text-muted)] mb-1'>
              {t("Customer")}
            </p>
            <p className='text-sm text-[var(--text-secondary)]'>{reviewerName}</p>
          </div>
          <div>
            <p className='text-xs text-[var(--text-muted)] mb-1'>{t("Rating")}</p>
            <p className='text-sm text-[var(--text-secondary)]'>{review.rating}/5</p>
          </div>
          <div>
            <p className='text-xs text-[var(--text-muted)] mb-1'>{t("Date")}</p>
            <p className='text-sm text-[var(--text-secondary)]'>
              {formatDate(review.created_at || "")}
            </p>
          </div>
        </div>

        <div>
          <p className='text-xs text-[var(--text-muted)] mb-1'>{t("Comment")}</p>
          <p className='text-sm text-[var(--text-secondary)] leading-7 whitespace-pre-line'>
            {review.comment || t("No comment")}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ReviewsForm;
