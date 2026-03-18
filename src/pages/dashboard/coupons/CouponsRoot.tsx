import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { deleteCouponById, fetchAllCoupons } from "../../../api/coupons";
import DeleteModal from "../../../components/common/DeleteModal";
import DropdownMenu from "../../../components/common/DropdownMenu";
import PageHeader from "../../../components/common/PageHeader";
import Table from "../../../components/common/Table";
import { DiscountType, type ICoupon } from "../../../types";
import { formatDate } from "../../../utils/formatDate";
import CouponsForm from "./CouponsForm";

export default function CouponsRoot() {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<ICoupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<ICoupon | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    loadCoupons();
  }, [currentPage, pageSize, searchQuery]);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const { data, count } = await fetchAllCoupons(
        currentPage,
        pageSize,
        searchQuery,
      );
      setCoupons(data);
      setTotalItems(count || 0);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleEdit = (shippingZone: ICoupon) => {
    setEditingCoupon(shippingZone);
    setIsFormOpen(true);
  };

  const handleBulkAction = async (
    action: string,
    selectedIds: (string | number)[],
  ) => {
    try {
      switch (action) {
        case "delete":
          await toast.promise(
            Promise.all(selectedIds.map((id) => deleteCouponById(String(id)))),
            {
              loading: t("Deleting selected coupons"),
              success: t("Coupons deleted successfully"),
              error: t("Failed to delete coupons"),
            },
          );
          await loadCoupons();
          break;
        case "archive":
          toast.success(
            t(`${selectedIds.length} coupons archived successfully`),
          );
          break;
        case "export":
          toast.success(
            t(`Export completed for ${selectedIds.length} coupons`),
          );
          break;
        case "print":
          toast.success(t(`Print initiated for ${selectedIds.length} coupons`));
          break;
        default:
          console.log(`Action: ${action}`, `Selected IDs: ${selectedIds}`);
      }
    } catch (error) {
      console.error("Bulk action error:", error);
      toast.error(t("An error occurred while processing bulk action"));
    }
  };

  const handleDelete = async () => {
    if (!deletingCoupon?.id) return;
    const zoneId = deletingCoupon.id;

    const deletePromise = new Promise(async (resolve, reject) => {
      try {
        setDeleting(true);
        await deleteCouponById(zoneId);
        await loadCoupons();
        setIsDeleteModalOpen(false);
        setDeletingCoupon(null);
        resolve(t("Coupon deleted successfully"));
      } catch (error) {
        console.error("Error deleting coupon:", error);
        reject(
          error instanceof Error ? error.message : "Failed to delete coupon",
        );
      } finally {
        setDeleting(false);
      }
    });

    toast.promise(deletePromise, {
      loading: t("Deleting coupon"),
      success: (message) => message as string,
      error: (err) => `Error: ${err}`,
    });
  };

  const columns = [
    {
      header: t("Code"),
      accessor: (coupon: ICoupon) => (
        <div className='text-sm font-medium text-[var(--text-secondary)]'>
          {coupon.code}
        </div>
      ),
      sortable: true,
      sortKey: "code" as keyof ICoupon,
    },
    {
      header: t("Discount Type"),
      accessor: (coupon: ICoupon) => (
        <div className='text-sm text-[var(--text-secondary)]'>
          {coupon.discount_type === DiscountType.PERCENTAGE
            ? t("Percentage")
            : t("Fixed")}
        </div>
      ),
      sortable: true,
      sortKey: "discount_type" as keyof ICoupon,
    },
    {
      header: t("Discount Value"),
      accessor: (coupon: ICoupon) => (
        <div className='text-sm text-[var(--text-secondary)]'>
          {coupon.discount_value}
        </div>
      ),
      sortable: true,
      sortKey: "discount_value" as keyof ICoupon,
    },
    {
      header: t("Usage Limit"),
      accessor: (coupon: ICoupon) => (
        <div className='text-sm text-[var(--text-secondary)]'>
          {coupon.usage_limit}
        </div>
      ),
      sortable: true,
      sortKey: "usage_limit" as keyof ICoupon,
    },
    {
      header: t("Status"),
      accessor: (coupon: ICoupon) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            coupon.computed_is_active
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {coupon.computed_is_active ? t("Active") : t("Inactive")}
        </span>
      ),
      sortable: true,
      sortKey: "is_active" as keyof ICoupon,
    },
    {
      header: t("Starts At"),
      accessor: (coupon: ICoupon) => (
        <div className='text-sm text-[var(--text-secondary)]'>
          {coupon.starts_at ? formatDate(coupon.starts_at) : "-"}
        </div>
      ),
      sortable: true,
      sortKey: "created_at" as keyof ICoupon,
    },
    {
      header: t("Expires At"),
      accessor: (coupon: ICoupon) => (
        <div className='text-sm text-[var(--text-secondary)]'>
          {coupon.expires_at ? formatDate(coupon.expires_at) : "-"}
        </div>
      ),
      sortable: true,
      sortKey: "created_at" as keyof ICoupon,
    },
    {
      header: "",
      accessor: (shippingZone: ICoupon) => (
        <div className='flex justify-end'>
          <DropdownMenu
            items={[
              {
                label: t("Edit"),
                onClick: () => handleEdit(shippingZone),
              },
              {
                label: t("Delete"),
                onClick: () => {
                  setDeletingCoupon(shippingZone);
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
        title={t("Coupons")}
        addButtonText={t("Coupon")}
        onAdd={() => {
          setEditingCoupon(null);
          setIsFormOpen(true);
        }}
        searchQuery={searchQuery}
        onSearch={(value) => {
          setSearchQuery(value);
          setCurrentPage(1);
        }}
      />
      <Table
        data={coupons}
        columns={columns}
        isLoading={loading}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        onBulkAction={handleBulkAction}
      />

      {isFormOpen && (
        <CouponsForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={async () => {
            await loadCoupons();
            setIsFormOpen(false);
            setEditingCoupon(null);
          }}
          editingCoupon={editingCoupon}
        />
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingCoupon(null);
        }}
        onConfirm={handleDelete}
        title='Coupon'
        itemType='Coupon'
        itemName={deletingCoupon?.code || ""}
        isDeleting={deleting}
      />
    </div>
  );
}
