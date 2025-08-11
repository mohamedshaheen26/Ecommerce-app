import { useState, useEffect } from "react";
import { IoSearchOutline } from "react-icons/io5";
import toast from "react-hot-toast";

import type { ICategory } from "../../../types";

import {
  deleteCategoryById,
  fetchAllCategories,
} from "../../../api/categories";

import DropdownMenu from "../../../components/common/DropdownMenu";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import Table from "../../../components/common/Table";
import DeleteModal from "../../../components/common/DeleteModal";

import CategoriesForm from "./CategoriesForm";

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
      header: "Name",
      accessor: (category: ICategory) => (
        <div className='text-sm font-medium text-gray-900'>{category.name}</div>
      ),
    },
    {
      header: "Description",
      accessor: (category: ICategory) => (
        <div className='text-sm text-gray-500'>{category.description}</div>
      ),
    },
    {
      header: "Created",
      accessor: (category: ICategory) => (
        <div className='text-sm text-gray-500'>
          {category.created_at
            ? new Date(category.created_at).toLocaleDateString()
            : "No date"}
        </div>
      ),
    },
    {
      header: "",
      accessor: (category: ICategory) => (
        <div className='flex justify-end'>
          <DropdownMenu
            items={[
              {
                label: "Edit",
                onClick: () => handleEdit(category),
              },
              {
                label: "Delete",
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
    <div className='bg-white border border-gray-200 rounded-lg overflow-hidden'>
      <div className='flex justify-between items-center py-6 px-8 border-b border-gray-200'>
        <h1 className='text-2xl font-semibold text-gray-800'>Categories</h1>
        <div className='flex items-center space-x-4'>
          <Button
            variant='secondary'
            onClick={() => {
              setEditingCategory(null);
              setIsFormOpen(true);
            }}
          >
            Add Category
          </Button>
          <Input
            fullWidth={false}
            placeholder='Search categories...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<IoSearchOutline className='w-5 h-5' />}
          />
        </div>
      </div>

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
        title='Delete Category'
        itemType='category'
        itemName={deletingCategory?.name || ""}
        isDeleting={deleting}
      />
    </div>
  );
}
