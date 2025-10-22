import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import type { ICategory } from "../../../types";

import {
  deleteCategoryById,
  fetchAllCategories,
} from "../../../api/categories";

import DropdownMenu from "../../../components/common/DropdownMenu";
import Table from "../../../components/common/Table";
import DeleteModal from "../../../components/common/DeleteModal";

import CategoriesForm from "./CategoriesForm";
import PageHeader from "../../../components/common/PageHeader";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../../context/LanguageContext";
import { bulkDelete } from "../../../api/general";

export default function CategoriesRoot() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(
    null
  );
  const [deletingCategory, setDeletingCategory] = useState<ICategory | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { t } = useTranslation();
  const { currentLang } = useLanguage();

  useEffect(() => {
    loadCategories();
  }, [currentPage, searchQuery, pageSize]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const { data, count } = await fetchAllCategories(
        currentPage,
        pageSize,
        searchQuery
      );
      setCategories(data);
      setTotalItems(count || 0);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleEdit = (category: ICategory) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  // Bulk actions handler
  const handleBulkAction = async (
    action: string,
    selectedIds: (string | number)[]
  ) => {
    try {
      switch (action) {
        case "delete":
          await toast.promise(
            bulkDelete("categories", selectedIds as number[]),
            {
              loading: t("Deleting selected categories"),
              success: t(`Categories deleted successfully`),
              error: t("Failed to delete categories"),
            }
          );
          await loadCategories();
          break;
        case "archive":
          toast.success(
            t(`${selectedIds.length} categories archived successfully`)
          );
          // TODO: Implement archive functionality
          break;
        case "export":
          toast.success(
            t(`Export completed for ${selectedIds.length} categories`)
          );
          // TODO: Implement export functionality
          break;
        case "print":
          toast.success(
            t(`Print initiated for ${selectedIds.length} categories`)
          );
          // TODO: Implement print functionality
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
    if (!deletingCategory || !deletingCategory.id) return;

    const deletePromise = new Promise(async (resolve, reject) => {
      try {
        setDeleting(true);
        await deleteCategoryById(deletingCategory.id!);

        if (deletingCategory.id) await deleteCategoryById(deletingCategory.id);
        await loadCategories();
        setIsDeleteModalOpen(false);
        setDeletingCategory(null);
        resolve(t("Category deleted successfully"));
      } catch (error) {
        console.error("Error deleting category:", error);
        reject(
          error instanceof Error ? error.message : "Failed to delete category"
        );
      } finally {
        setDeleting(false);
      }
    });

    toast.promise(deletePromise, {
      loading: `${t("Deleting category")}`,
      success: (message) => message as string,
      error: (err) => `Error: ${err}`,
    });
  };
  const columns = [
    {
      header: `${t("Name")}`,
      accessor: (category: ICategory) => (
        <div className='text-sm font-medium text-[var(--text-secondary)]'>
          {currentLang === "ar" ? category.name_ar : category.name}
        </div>
      ),
      sortable: true,
      sortKey: "name" as keyof ICategory,
    },
    {
      header: `${t("Description")}`,
      accessor: (category: ICategory) => (
        <div className='text-sm text-[var(--text-secondary)]'>
          {currentLang === "ar"
            ? category.description_ar
            : category.description}
        </div>
      ),
      sortable: true,
      sortKey: "description" as keyof ICategory,
    },
    {
      header: `${t("Created At")}`,
      accessor: (category: ICategory) => (
        <div className='text-sm text-[var(--text-secondary)]'>
          {category.created_at
            ? new Date(category.created_at).toLocaleDateString()
            : "No date"}
        </div>
      ),
      sortable: true,
      sortKey: "created_at" as keyof ICategory,
    },
    {
      header: "",
      accessor: (category: ICategory) => (
        <div className='flex justify-end'>
          <DropdownMenu
            items={[
              {
                label: `${t("Edit")}`,
                onClick: () => handleEdit(category),
              },
              {
                label: `${t("Delete")}`,
                onClick: () => {
                  setDeletingCategory(category);
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
        title='Categories'
        addButtonText='Category'
        onAdd={() => {
          setEditingCategory(null);
          setIsFormOpen(true);
        }}
        searchQuery={searchQuery}
        onSearch={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
      />

      <Table
        data={categories}
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
        <CategoriesForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={async () => {
            await loadCategories();
            setIsFormOpen(false);
            setEditingCategory(null);
          }}
          editingCategory={editingCategory}
        />
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingCategory(null);
        }}
        onConfirm={handleDelete}
        title='Category'
        itemType='Category'
        itemName={deletingCategory?.name || ""}
        isDeleting={deleting}
      />
    </div>
  );
}
