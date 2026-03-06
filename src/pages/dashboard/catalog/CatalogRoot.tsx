import { Box, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FiEdit, FiFileText, FiFolder, FiPlus, FiTrash2 } from "react-icons/fi";

import {
  deleteCategoryById,
  fetchAllCategories,
} from "../../../api/categories";
import { deleteProduct, fetchProducts } from "../../../api/product";
import { useLanguage } from "../../../context/LanguageContext";
import type { ICategory, IProduct } from "../../../types";

import DeleteModal from "../../../components/common/DeleteModal";
import PageHeader from "../../../components/common/PageHeader";
import TreeGrid, {
  type TreeGridAction,
  type TreeGridColumn,
  type TreeGridRow,
} from "../../../components/common/TreeGrid";
import CategoriesForm from "../categories/CategoriesForm";
import ProductsForm from "../products/ProductsForm";

// Interface for our unified tree row
interface CatalogRow extends TreeGridRow {
  type: "category" | "product";
  name: string;
  price?: number;
  stock_status?: string;
  originalData: ICategory | IProduct;
}

export default function CatalogRoot() {
  const { t } = useTranslation();
  const { currentLang } = useLanguage();

  const [data, setData] = useState<CatalogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // --- Forms State ---
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(
    null,
  );
  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState<
    string | undefined
  >(undefined);

  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >(undefined);

  // --- Delete State ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{
    type: "category" | "product";
    data: ICategory | IProduct;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // --- Data Fetching ---
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [categoriesRes, productsRes] = await Promise.all([
        fetchAllCategories(1, 1000, ""),
        fetchProducts(1, 1000, ""),
      ]);

      const categories = categoriesRes.data || [];
      const products = productsRes.data || [];

      const categoryMap = new Map<string, CatalogRow>();
      const rootCategories: CatalogRow[] = [];

      // Convert categories to rows first.
      categories.forEach((cat) => {
        if (!cat.id) return;
        categoryMap.set(cat.id, {
          id: cat.id,
          type: "category",
          name: currentLang === "ar" ? cat.name_ar : cat.name,
          originalData: cat,
          subRows: [],
        });
      });

      // Build the parent -> child category tree.
      categories.forEach((cat) => {
        if (!cat.id) return;
        const currentRow = categoryMap.get(cat.id);
        if (!currentRow) return;

        if (cat.parent_id) {
          const parentRow = categoryMap.get(cat.parent_id);
          if (parentRow?.subRows) {
            parentRow.subRows.push(currentRow);
            return;
          }
        }

        rootCategories.push(currentRow);
      });

      // Distribute Products into Categories
      products.forEach((prod) => {
        const parentRow = categoryMap.get(prod.category_id);
        const prodRow: CatalogRow = {
          id: prod.id,
          type: "product",
          name: currentLang === "ar" ? prod.name_ar : prod.title,
          price: prod.price,
          stock_status: prod.stock_status,
          originalData: prod,
        };

        if (parentRow && parentRow.subRows) {
          parentRow.subRows.push(prodRow);
        }
      });

      setData(rootCategories);
    } catch (error) {
      console.error("Error loading catalog:", error);
      toast.error(t("Failed to load catalog data"));
    } finally {
      setLoading(false);
    }
  }, [currentLang, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Handlers ---

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setSelectedParentCategoryId(undefined);
    setIsCategoryFormOpen(true);
  };

  const handleCreateSubCategory = (row: CatalogRow) => {
    if (row.type !== "category") return;
    setEditingCategory(null);
    setSelectedParentCategoryId(row.id);
    setIsCategoryFormOpen(true);
  };

  const handleEdit = (row: CatalogRow) => {
    if (row.type === "category") {
      setEditingCategory(row.originalData as ICategory);
      setIsCategoryFormOpen(true);
    } else {
      setEditingProduct(row.originalData as IProduct);
      setIsProductFormOpen(true);
    }
  };

  const handleDelete = (row: CatalogRow) => {
    setDeletingItem({
      type: row.type,
      data: row.originalData,
    });
    setIsDeleteModalOpen(true);
  };

  const handleCreateProductInCategory = (row: CatalogRow) => {
    if (row.type === "category") {
      setSelectedCategoryId(row.id);
      setEditingProduct(null);
      setIsProductFormOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    try {
      setDeleting(true);
      if (deletingItem.type === "category") {
        await deleteCategoryById((deletingItem.data as ICategory).id!);
        toast.success(t("Category deleted successfully"));
      } else {
        await deleteProduct(deletingItem.data as IProduct);
        toast.success(t("Product deleted successfully"));
      }
      setIsDeleteModalOpen(false);
      setDeletingItem(null);
      loadData();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(t("Failed to delete item"));
    } finally {
      setDeleting(false);
    }
  };

  // --- TreeGrid Configuration ---

  const columns: TreeGridColumn[] = [
    {
      accessorKey: "name",
      header: t("Name"),
      size: 300,
      Cell: ({ row }) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {row.original.type === "category" ? (
            <FiFolder className='text-blue-500 text-lg' />
          ) : (
            <FiFileText className='text-gray-500 text-lg' />
          )}
          <Typography
            variant='body2'
            sx={{ fontWeight: row.original.type === "category" ? 600 : 400 }}
          >
            {row.original.name}
          </Typography>
        </Box>
      ),
    },
    {
      accessorKey: "price",
      header: t("Price"),
      size: 100,
      Cell: ({ cell }) => (cell.getValue() ? `$${cell.getValue()}` : ""),
    },
    {
      accessorKey: "stock_status",
      header: t("Stock Status"),
      size: 150,
      Cell: ({ cell }) => {
        const status = cell.getValue();
        if (!status) return null;

        let colorClass = "bg-gray-100 text-gray-800";
        if (status === "in_stock") colorClass = "bg-green-100 text-green-800";
        else if (status === "low_stock")
          colorClass = "bg-yellow-100 text-yellow-800";
        else if (status === "out_of_stock")
          colorClass = "bg-red-100 text-red-800";

        return (
          <span
            className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${colorClass}`}
          >
            {t(`Stock Statuses.${status}`)}
          </span>
        );
      },
    },
  ];

  const actions: TreeGridAction<CatalogRow>[] = [
    {
      icon: <FiPlus />,
      label: t("Add Subcategory"),
      onClick: handleCreateSubCategory,
      color: "rgb(14, 165, 233)",
      hoverColor: "rgba(14, 165, 233, 0.1)",
      show: (row) => row.type === "category",
    },
    {
      icon: <FiPlus />,
      label: t("Add Product"),
      onClick: handleCreateProductInCategory,
      color: "rgb(34, 197, 94)",
      hoverColor: "rgba(34, 197, 94, 0.1)",
      show: (row) => row.type === "category",
    },
    {
      icon: <FiEdit />,
      label: t("Edit"),
      onClick: handleEdit,
      color: "rgb(59, 130, 246)",
      hoverColor: "rgba(59, 130, 246, 0.1)",
    },
    {
      icon: <FiTrash2 />,
      label: t("Delete"),
      onClick: handleDelete,
      color: "rgb(239, 68, 68)",
      hoverColor: "rgba(239, 68, 68, 0.1)",
    },
  ];

  const flattenedCategories = useMemo(() => {
    const result: ICategory[] = [];

    const walk = (rows: CatalogRow[]) => {
      rows.forEach((row) => {
        if (row.type === "category") {
          result.push(row.originalData as ICategory);
        }
        if (row.subRows?.length) {
          walk(row.subRows as CatalogRow[]);
        }
      });
    };

    walk(data);
    return result;
  }, [data]);

  return (
    <div className='bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg flex flex-col overflow-hidden'>
      <PageHeader
        title={t("Items")}
        addButtonText={t("Category")}
        onAdd={handleCreateCategory}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
      />

      <TreeGrid<CatalogRow>
        data={data}
        columns={columns}
        actions={actions}
        isLoading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        expandIconColumn='name'
      />

      {/* Forms */}
      {isCategoryFormOpen && (
        <CategoriesForm
          isOpen={isCategoryFormOpen}
          onClose={() => {
            setIsCategoryFormOpen(false);
            setSelectedParentCategoryId(undefined);
          }}
          onSuccess={async () => {
            await loadData();
            setIsCategoryFormOpen(false);
            setSelectedParentCategoryId(undefined);
          }}
          editingCategory={editingCategory}
          defaultParentId={selectedParentCategoryId}
        />
      )}

      {isProductFormOpen && (
        <ProductsForm
          isOpen={isProductFormOpen}
          onClose={() => {
            setIsProductFormOpen(false);
            setEditingProduct(null);
            setSelectedCategoryId(undefined);
          }}
          onSuccess={() => {
            loadData();
            setIsProductFormOpen(false);
            setEditingProduct(null);
            setSelectedCategoryId(undefined);
          }}
          categories={flattenedCategories}
          editingProduct={editingProduct}
          defaultCategoryId={selectedCategoryId}
        />
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={deletingItem?.type === "category" ? "Category" : "Product"}
        itemType={deletingItem?.type === "category" ? "Category" : "Product"}
        itemName={
          deletingItem
            ? deletingItem.type === "category"
              ? (deletingItem.data as ICategory).name
              : (deletingItem.data as IProduct).title
            : ""
        }
        isDeleting={deleting}
      />
    </div>
  );
}
