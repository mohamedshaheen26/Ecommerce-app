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
  const { t } = useTranslation();
  const { currentLang } = useLanguage();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: ICategory) => {
    setEditingCategory(category);
    setIsFormOpen(true);
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
        resolve("Category deleted successfully");
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
      loading: "Deleting category...",
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
    },
    {
      header: `${t("Actions")}`,
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
      className: "w-10",
    },
  ];

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        onSearch={(val) => setSearchQuery(val)}
      />

      <Table data={filteredCategories} columns={columns} isLoading={loading} />

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
