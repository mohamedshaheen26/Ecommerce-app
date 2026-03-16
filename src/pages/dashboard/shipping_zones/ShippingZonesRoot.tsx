import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  deleteShippingZoneById,
  fetchAllShippingZones,
} from "../../../api/shippingZones";
import DeleteModal from "../../../components/common/DeleteModal";
import DropdownMenu from "../../../components/common/DropdownMenu";
import PageHeader from "../../../components/common/PageHeader";
import Table from "../../../components/common/Table";
import { useLanguage } from "../../../context/LanguageContext";
import type { IShippingZone } from "../../../types";
import { formatDate } from "../../../utils/formatDate";
import ShippingZonesForm from "./ShippingZonesForm";

export default function ShippingZonesRoot() {
  const { t } = useTranslation();
  const { currentLang } = useLanguage();
  const [shippingZones, setShippingZones] = useState<IShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingShippingZone, setEditingShippingZone] =
    useState<IShippingZone | null>(null);
  const [deletingShippingZone, setDeletingShippingZone] =
    useState<IShippingZone | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    loadShippingZones();
  }, [currentPage, pageSize, searchQuery]);

  const loadShippingZones = async () => {
    try {
      setLoading(true);
      const { data, count } = await fetchAllShippingZones(
        currentPage,
        pageSize,
        searchQuery,
      );
      setShippingZones(data);
      setTotalItems(count || 0);
    } catch (error) {
      console.error("Error fetching shipping zones:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleEdit = (shippingZone: IShippingZone) => {
    setEditingShippingZone(shippingZone);
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
            Promise.all(selectedIds.map((id) => deleteShippingZoneById(String(id)))),
            {
              loading: t("Deleting selected shipping zones"),
              success: t("Shipping Zones deleted successfully"),
              error: t("Failed to delete shipping zones"),
            },
          );
          await loadShippingZones();
          break;
        case "archive":
          toast.success(
            t(`${selectedIds.length} shipping zones archived successfully`),
          );
          break;
        case "export":
          toast.success(
            t(`Export completed for ${selectedIds.length} shipping zones`),
          );
          break;
        case "print":
          toast.success(t(`Print initiated for ${selectedIds.length} shipping zones`));
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
    if (!deletingShippingZone?.id) return;
    const zoneId = deletingShippingZone.id;

    const deletePromise = new Promise(async (resolve, reject) => {
      try {
        setDeleting(true);
        await deleteShippingZoneById(zoneId);
        await loadShippingZones();
        setIsDeleteModalOpen(false);
        setDeletingShippingZone(null);
        resolve(t("Shipping Zone deleted successfully"));
      } catch (error) {
        console.error("Error deleting shipping zone:", error);
        reject(
          error instanceof Error
            ? error.message
            : "Failed to delete shipping zone",
        );
      } finally {
        setDeleting(false);
      }
    });

    toast.promise(deletePromise, {
      loading: t("Deleting shipping zone"),
      success: (message) => message as string,
      error: (err) => `Error: ${err}`,
    });
  };

  const columns = [
    {
      header: t("Name"),
      accessor: (shippingZone: IShippingZone) => (
        <div className='text-sm font-medium text-[var(--text-secondary)]'>
          {currentLang === "ar" ? shippingZone.name_ar : shippingZone.name}
        </div>
      ),
      sortable: true,
      sortKey: "name" as keyof IShippingZone,
    },
    {
      header: t("Shipping Fee"),
      accessor: (shippingZone: IShippingZone) => (
        <div className='text-sm text-[var(--text-secondary)]'>
          ${Number(shippingZone.shipping_fee || 0).toFixed(2)}
        </div>
      ),
      sortable: true,
      sortKey: "shipping_fee" as keyof IShippingZone,
    },
    {
      header: t("Estimated Delivery Days"),
      accessor: (shippingZone: IShippingZone) => (
        <div className='text-sm text-[var(--text-secondary)]'>
          {shippingZone.estimated_days}
        </div>
      ),
      sortable: true,
      sortKey: "estimated_days" as keyof IShippingZone,
    },
    {
      header: t("Status"),
      accessor: (shippingZone: IShippingZone) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            shippingZone.is_active
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {shippingZone.is_active ? t("Active") : t("Inactive")}
        </span>
      ),
      sortable: true,
      sortKey: "is_active" as keyof IShippingZone,
    },
    {
      header: t("Created At"),
      accessor: (shippingZone: IShippingZone) => (
        <div className='text-sm text-[var(--text-secondary)]'>
          {shippingZone.created_at ? formatDate(shippingZone.created_at) : "-"}
        </div>
      ),
      sortable: true,
      sortKey: "created_at" as keyof IShippingZone,
    },
    {
      header: "",
      accessor: (shippingZone: IShippingZone) => (
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
                  setDeletingShippingZone(shippingZone);
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
        title='Shipping Zones'
        addButtonText='Shipping Zone'
        onAdd={() => {
          setEditingShippingZone(null);
          setIsFormOpen(true);
        }}
        searchQuery={searchQuery}
        onSearch={(value) => {
          setSearchQuery(value);
          setCurrentPage(1);
        }}
      />
      <Table
        data={shippingZones}
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
        <ShippingZonesForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={async () => {
            await loadShippingZones();
            setIsFormOpen(false);
            setEditingShippingZone(null);
          }}
          editingShippingZone={editingShippingZone}
        />
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingShippingZone(null);
        }}
        onConfirm={handleDelete}
        title='Shipping Zone'
        itemType='Shipping Zone'
        itemName={deletingShippingZone?.name || ""}
        isDeleting={deleting}
      />
    </div>
  );
}
