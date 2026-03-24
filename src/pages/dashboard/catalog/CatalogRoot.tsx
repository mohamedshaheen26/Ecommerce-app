import { Box, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FiEdit, FiFileText, FiFolder, FiPlus, FiTrash2 } from "react-icons/fi";

import {
  fetchAllCategories,
  fetchChildCategoryParentIds,
  fetchRootCategories,
  fetchSubCategoriesByParent,
  deleteCategoryById,
} from "../../../api/categories";
import {
  deleteProduct,
  fetchProductCategoryIds,
  fetchProductsByCategory,
} from "../../../api/product";
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
  hasChildren?: boolean;
  originalData: ICategory | IProduct;
}

export default function CatalogRoot() {
  const { t } = useTranslation();
  const { currentLang } = useLanguage();

  const [data, setData] = useState<CatalogRow[]>([]);
  const [formCategories, setFormCategories] = useState<ICategory[]>([]);
  const [loadedCategoryIds, setLoadedCategoryIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [loadingCategoryIds, setLoadingCategoryIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

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
  const buildCategoryRow = useCallback(
    (category: ICategory, hasChildren = false): CatalogRow => ({
      id: category.id!,
      type: "category",
      name: currentLang === "ar" ? category.name_ar : category.name,
      hasChildren,
      originalData: category,
    }),
    [currentLang],
  );

  const buildProductRow = useCallback(
    (product: IProduct): CatalogRow => ({
      id: product.id,
      type: "product",
      name: currentLang === "ar" ? product.name_ar : product.title,
      price: product.price,
      stock_status: product.stock_status,
      originalData: product,
    }),
    [currentLang],
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: rootCategories, count } = await fetchRootCategories(
        currentPage,
        pageSize,
        searchQuery,
      );

      const rootIds = rootCategories
        .map((category) => category.id)
        .filter(Boolean) as string[];

      const [categoryParentIds, productCategoryIds] = await Promise.all([
        fetchChildCategoryParentIds(rootIds),
        fetchProductCategoryIds(rootIds),
      ]);

      const expandableRootIdSet = new Set([
        ...categoryParentIds,
        ...productCategoryIds,
      ]);

      const rootRows = rootCategories
        .filter((category) => category.id)
        .map((category) =>
          buildCategoryRow(category, expandableRootIdSet.has(category.id!)),
        );

      setData(rootRows);
      setTotalItems(count || 0);
      setLoadedCategoryIds(new Set());
    } catch (error) {
      console.error("Error loading catalog:", error);
      toast.error(t("Failed to load catalog data"));
    } finally {
      setLoading(false);
    }
  }, [buildCategoryRow, currentPage, pageSize, searchQuery, t]);

  const attachChildrenToCategory = useCallback(
    (rows: CatalogRow[], categoryId: string, children: CatalogRow[]): CatalogRow[] =>
      rows.map((row) => {
        if (row.id === categoryId && row.type === "category") {
          return { ...row, subRows: children };
        }

        if (row.subRows?.length) {
          return {
            ...row,
            subRows: attachChildrenToCategory(
              row.subRows as CatalogRow[],
              categoryId,
              children,
            ),
          };
        }

        return row;
      }),
    [],
  );

  const loadCategoryChildren = useCallback(
    async (row: CatalogRow) => {
      if (row.type !== "category") return;
      if (!row.id || loadedCategoryIds.has(row.id)) return;
      if (loadingCategoryIds.has(row.id)) return;

      setLoadingCategoryIds((prev) => {
        const next = new Set(prev);
        next.add(row.id);
        return next;
      });
      try {
        const [subCategories, products] = await Promise.all([
          fetchSubCategoriesByParent(row.id),
          fetchProductsByCategory(row.id),
        ]);

        const subCategoryIds = subCategories
          .map((category) => category.id)
          .filter(Boolean) as string[];

        const [categoryParentIds, productCategoryIds] = await Promise.all([
          fetchChildCategoryParentIds(subCategoryIds),
          fetchProductCategoryIds(subCategoryIds),
        ]);

        const expandableSubCategoryIdSet = new Set([
          ...categoryParentIds,
          ...productCategoryIds,
        ]);

        const childCategoryRows = subCategories
          .filter((category) => category.id)
          .map((category) =>
            buildCategoryRow(
              category,
              expandableSubCategoryIdSet.has(category.id!),
            ),
          );

        const productRows = products.map((product) => buildProductRow(product));
        const children = [...childCategoryRows, ...productRows];

        setData((prev) => attachChildrenToCategory(prev, row.id, children));
        setLoadedCategoryIds((prev) => {
          const next = new Set(prev);
          next.add(row.id);
          return next;
        });
      } catch (error) {
        console.error("Error loading category children:", error);
        toast.error(t("Failed to load catalog data"));
      } finally {
        setLoadingCategoryIds((prev) => {
          const next = new Set(prev);
          next.delete(row.id);
          return next;
        });
      }
    },
    [
      attachChildrenToCategory,
      buildCategoryRow,
      buildProductRow,
      loadedCategoryIds,
      loadingCategoryIds,
      t,
    ],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const loadFormCategories = async () => {
      try {
        const { data: categories } = await fetchAllCategories(1, 1000, "");
        setFormCategories(categories || []);
      } catch (error) {
        console.error("Error loading categories for forms:", error);
      }
    };

    loadFormCategories();
  }, []);

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

  const flattenedCategories = useMemo(() => formCategories, [formCategories]);

  return (
    <div className='bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg flex flex-col overflow-hidden'>
      <PageHeader
        title={t("Items")}
        addButtonText={t("Category")}
        onAdd={handleCreateCategory}
        searchQuery={searchQuery}
        onSearch={(value) => {
          setSearchQuery(value);
          setCurrentPage(1);
        }}
      />

      <TreeGrid<CatalogRow>
        data={data}
        columns={columns}
        actions={actions}
        isLoading={loading}
        expandIconColumn='name'
        getRowCanExpand={(row) => row.type === "category" && !!row.hasChildren}
        onRowExpandToggle={(row, isExpanding) => {
          if (isExpanding) {
            loadCategoryChildren(row);
          }
        }}
        enablePagination
        manualPagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize);
          setCurrentPage(1);
        }}
        isRowLoading={(row) => row.type === "category" && loadingCategoryIds.has(row.id)}
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
            const { data: categories } = await fetchAllCategories(1, 1000, "");
            setFormCategories(categories || []);
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
              ? currentLang === "ar"
                ? (deletingItem.data as ICategory).name_ar
                : (deletingItem.data as ICategory).name
              : currentLang === "ar"
                ? (deletingItem.data as IProduct).name_ar
                : (deletingItem.data as IProduct).title
            : ""
        }
        isDeleting={deleting}
      />
    </div>
  );
}
