import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FaStar } from "react-icons/fa";
import { deleteReviewById, fetchAllReviews } from "../../../api/review";
import DeleteModal from "../../../components/common/DeleteModal";
import DropdownMenu from "../../../components/common/DropdownMenu";
import PageHeader from "../../../components/common/PageHeader";
import Table from "../../../components/common/Table";
import { useLanguage } from "../../../context/LanguageContext";
import type { IReviewAdminItem } from "../../../types";
import { formatDate } from "../../../utils/formatDate";
import ReviewsForm from "./ReviewsForm";

const ReviewsRoot = () => {
  const [reviews, setReviews] = useState<IReviewAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedReview, setSelectedReview] = useState<IReviewAdminItem | null>(
    null,
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { t } = useTranslation();
  const { currentLang } = useLanguage();

  useEffect(() => {
    loadReviews();
  }, [currentPage, pageSize, searchQuery]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const { data, count } = await fetchAllReviews(
        currentPage,
        pageSize,
        searchQuery,
      );
      setReviews(data);
      setTotalItems(count || 0);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleDeleteReview = async () => {
    if (!selectedReview?.id) return;

    try {
      setDeleting(true);
      await deleteReviewById(selectedReview.id);
      toast.success(t("Review deleted successfully"));
      setIsDeleteModalOpen(false);
      setSelectedReview(null);
      await loadReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error(t("Failed to delete review"));
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: t("Product"),
      accessor: (review: IReviewAdminItem) => (
        <div className='text-sm text-[var(--text-secondary)]'>
          {currentLang === "ar"
            ? review.product_name_ar || review.product_title || t("Unknown Product")
            : review.product_title || review.product_name_ar || t("Unknown Product")}
        </div>
      ),
      sortable: true,
      sortKey: "product_title" as keyof IReviewAdminItem,
    },
    {
      header: t("Customer"),
      accessor: (review: IReviewAdminItem) => (
        <div className='flex flex-col gap-0.5'>
          <span className='text-sm text-[var(--text-secondary)]'>
            {currentLang === "ar"
              ? review.customer_name_ar ||
                review.customer_full_name ||
                review.name ||
                t("Unknown Reviewer")
              : review.customer_full_name ||
                review.customer_name_ar ||
                review.name ||
                t("Unknown Reviewer")}
          </span>
          {review.customer_email && (
            <span className='text-xs text-[var(--text-muted)]'>
              {review.customer_email}
            </span>
          )}
        </div>
      ),
      sortable: true,
      sortKey: "name" as keyof IReviewAdminItem,
    },
    {
      header: t("Rating"),
      accessor: (review: IReviewAdminItem) => (
        <div className='flex items-center gap-1 text-[var(--warning)]'>
          {Array.from({ length: 5 }, (_, i) => (
            <FaStar
              key={i}
              size={12}
              className={
                i < review.rating ? "text-[var(--warning)]" : "opacity-30"
              }
            />
          ))}
        </div>
      ),
      sortable: true,
      sortKey: "rating" as keyof IReviewAdminItem,
    },
    {
      header: t("Comment"),
      accessor: (review: IReviewAdminItem) => (
        <p className='text-sm text-[var(--text-secondary)] max-w-[360px] truncate'>
          {review.comment || t("No comment")}
        </p>
      ),
      sortable: true,
      sortKey: "comment" as keyof IReviewAdminItem,
    },
    {
      header: t("Date"),
      accessor: (review: IReviewAdminItem) => (
        <span className='text-sm text-[var(--text-secondary)]'>
          {formatDate(review.created_at || "")}
        </span>
      ),
      sortable: true,
      sortKey: "created_at" as keyof IReviewAdminItem,
    },
    {
      header: "",
      accessor: (review: IReviewAdminItem) => (
        <div className='flex justify-end'>
          <DropdownMenu
            items={[
              {
                label: t("View"),
                onClick: () => {
                  setSelectedReview(review);
                  setIsViewModalOpen(true);
                },
              },
              {
                label: t("Delete"),
                onClick: () => {
                  setSelectedReview(review);
                  setIsDeleteModalOpen(true);
                },
              },
            ]}
          />
        </div>
      ),
      width: "5%",
    },
  ];

  return (
    <div className='bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg overflow-hidden'>
      <PageHeader
        title='Reviews'
        showAddButton={false}
        searchQuery={searchQuery}
        onSearch={(value) => {
          setSearchQuery(value);
          setCurrentPage(1);
        }}
      />

      <Table
        data={reviews}
        columns={columns}
        isLoading={loading}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        showBulkActions={false}
      />

      {isViewModalOpen && selectedReview && (
        <ReviewsForm
          isOpen={isViewModalOpen}
          review={selectedReview}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteReview}
        title='Review'
        itemType='Review'
        itemName={selectedReview?.comment?.slice(0, 32) || ""}
        isDeleting={deleting}
      />
    </div>
  );
};

export default ReviewsRoot;
