import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { fetchAllCategories } from "../../../api/categories";
import { bulkDelete } from "../../../api/general";
import { deleteProduct, fetchProducts } from "../../../api/product";
import DeleteModal from "../../../components/common/DeleteModal";
import DropdownMenu from "../../../components/common/DropdownMenu";
import PageHeader from "../../../components/common/PageHeader";
import Table from "../../../components/common/Table";
import { useLanguage } from "../../../context/LanguageContext";
import type { ICategory, IProduct } from "../../../types";
import ProductsForm from "./ProductsForm";

export default function ProductsRoot() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { t } = useTranslation();
  const { currentLang } = useLanguage();

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [currentPage, searchQuery, pageSize]);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const { data, count } = await fetchProducts(currentPage, pageSize, {
        searchQuery,
      });
      setFilteredProducts(data || []);
      setTotalItems(count || 0);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data } = await fetchAllCategories();
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    setDeleting(true);
    toast
      .promise(deleteProduct(selectedProduct), {
        loading: `${t("Deleting product")}`,
        success: `${t("Product deleted successfully")}`,
        error: `${t("Failed to save product")}`,
      })
      .finally(async () => {
        setDeleting(false);
        setIsDeleteModalOpen(false);
        setSelectedProduct(null);
        await loadProducts();
      });
  };

  // Bulk actions handler
  const handleBulkAction = async (
    action: string,
    selectedIds: (string | number)[],
  ) => {
    try {
      switch (action) {
        case "delete":
          await toast.promise(bulkDelete("products", selectedIds as number[]), {
            loading: t("Deleting selected products"),
            success: t(`products deleted successfully`),
            error: t("Failed to delete products"),
          });
          await loadProducts(); // Refresh the data
          break;
        case "archive":
          toast.success(
            t(`${selectedIds.length} products archived successfully`),
          );
          // TODO: Implement archive functionality
          break;
        case "export":
          toast.success(
            t(`Export completed for ${selectedIds.length} products`),
          );
          // TODO: Implement export functionality
          break;
        case "print":
          toast.success(
            t(`Print initiated for ${selectedIds.length} products`),
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

  const columns = [
    {
      header: `${t("Name")}`,
      accessor: (product: IProduct) => (
        <div className='flex items-center gap-2'>
          <div className='h-12 w-12 flex-shrink-0 bg-[var(--bg-secondary)] rounded-lg overflow-hidden p-1'>
            <img
              className='rounded-lg object-cover w-full h-full'
              src={product.images[0] || "/Image_not_Available.jpg"}
              alt={product.title}
            />
          </div>
          <div className='text-sm font-medium text-[var(--text-secondary)]'>
            {currentLang === "ar" ? product.name_ar : product.title}
          </div>
        </div>
      ),
      sortable: true,
      sortKey: "title" as keyof IProduct,
    },
    {
      header: `${t("Price")}`,
      accessor: (product: IProduct) => (
        <div className='text-sm text-[var(--text-secondary)]'>
          ${product.price}
        </div>
      ),
      sortable: true,
      sortKey: "price" as keyof IProduct,
    },
    {
      header: `${t("Stock Status")}`,
      accessor: (product: IProduct) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
          ${
            product.stock_status === "in_stock"
              ? "bg-green-100 text-green-800"
              : product.stock_status === "low_stock"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {t(`Stock Statuses.${product.stock_status}`)}
        </span>
      ),
      sortable: true,
      sortKey: "stock_status" as keyof IProduct,
    },
    {
      header: `${t("Category")}`,
      accessor: (product: IProduct) => (
        <div className='text-sm text-[var(--text-secondary)]'>
          {currentLang === "ar"
            ? product.category.name_ar
            : product.category.name}
        </div>
      ),
      sortable: true,
      sortKey: "category.name" as keyof IProduct,
    },
    {
      header: "",
      accessor: (product: IProduct) => (
        <div className='flex justify-end'>
          <DropdownMenu
            items={[
              {
                label: `${t("Edit")}`,
                onClick: () => {
                  setSelectedProduct(product);
                  setIsAddModalOpen(true);
                },
              },
              {
                label: `${t("Delete")}`,
                onClick: () => {
                  setSelectedProduct(product);
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
        title='Products'
        addButtonText='Product'
        onAdd={() => {
          setSelectedProduct(null);
          setIsAddModalOpen(true);
        }}
        searchQuery={searchQuery}
        onSearch={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
      />

      <Table
        data={filteredProducts}
        columns={columns}
        isLoading={loading}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        onBulkAction={handleBulkAction}
      />

      <ProductsForm
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedProduct(null);
        }}
        onSuccess={() => {
          loadProducts();
          setIsAddModalOpen(false);
          setSelectedProduct(null);
        }}
        editingProduct={selectedProduct}
        categories={categories}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleDelete}
        title='Product'
        itemType='Product'
        itemName={
          currentLang === "ar"
            ? selectedProduct?.name_ar || ""
            : selectedProduct?.title || ""
        }
        isDeleting={deleting}
      />
    </div>
  );
}
