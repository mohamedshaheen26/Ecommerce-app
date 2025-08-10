import { useState, useEffect } from "react";
import { IoSwapVerticalOutline } from "react-icons/io5";
import { IoSearchOutline } from "react-icons/io5";
import DeleteModal from "../../../components/common/DeleteModal";
import Table from "../../../components/common/Table";
import DropdownMenu from "../../../components/common/DropdownMenu";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import toast from "react-hot-toast";
import type { ICategory, IProduct } from "../../../types";
import { deleteProduct, fetchProducts } from "../../../api/product";
import { fetchAllCategories } from "../../../api/categories";
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
  const pageSize = 10;

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [currentPage, searchQuery]);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const { data, count } = await fetchProducts(
        currentPage,
        pageSize,
        searchQuery
      );
      setFilteredProducts(data || []);
      setTotalItems(count || 0);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await fetchAllCategories();
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    setDeleting(true);
    toast
      .promise(deleteProduct(selectedProduct), {
        loading: "Deleting...",
        success: "Product deleted",
        error: "Delete failed",
      })
      .finally(async () => {
        setDeleting(false);
        setIsDeleteModalOpen(false);
        setSelectedProduct(null);
        await loadProducts();
      });
  };

  const columns = [
    {
      header: <IoSwapVerticalOutline className='w-5 h-5' />,
      accessor: (product: IProduct) => (
        <div className='flex items-center'>
          <div className='h-12 w-12 flex-shrink-0 bg-[#F6F6F6] rounded-lg overflow-hidden p-1'>
            <img
              className='rounded-lg object-cover w-full h-full'
              src={product.images[0]}
              alt={product.title}
            />
          </div>
        </div>
      ),
      className: "w-10",
    },
    {
      header: "Name",
      accessor: (product: IProduct) => (
        <div className='flex items-center'>
          <div className='text-sm font-medium text-gray-900'>
            {product.title}
          </div>
        </div>
      ),
    },
    {
      header: "SKU",
      accessor: (product: IProduct) => (
        <div className='flex items-center'>
          <div className='text-sm font-medium text-gray-900'>{product.sku}</div>
        </div>
      ),
    },
    {
      header: "Price",
      accessor: (product: IProduct) => (
        <div className='text-sm text-gray-900'>${product.price}</div>
      ),
    },
    {
      header: "Stock",
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
          {product.stock_status.replace("_", " ")}
        </span>
      ),
    },
    {
      header: "Category",
      accessor: (product: IProduct) => (
        <div className='text-sm text-gray-900'>{product.category.name}</div>
      ),
    },
    {
      header: "Actions",
      accessor: (product: IProduct) => (
        <div className='flex justify-end'>
          <DropdownMenu
            items={[
              {
                label: "Edit",
                onClick: () => {
                  setSelectedProduct(product);
                  setIsAddModalOpen(true);
                },
              },
              {
                label: "Delete",
                onClick: () => {
                  setSelectedProduct(product);
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

  return (
    <div className='bg-white border border-gray-200 rounded-lg overflow-hidden'>
      <div className='flex justify-between items-center py-6 px-8 border-b border-gray-200'>
        <h1 className='text-2xl font-semibold text-gray-800'>Products</h1>
        <div className='flex items-center space-x-4'>
          <Button
            variant='secondary'
            onClick={() => {
              setSelectedProduct(null);
              setIsAddModalOpen(true);
            }}
          >
            Add Product
          </Button>
          <Input
            fullWidth={false}
            placeholder='Search products...'
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            leftIcon={<IoSearchOutline className='w-5 h-5' />}
          />
        </div>
      </div>

      <Table
        data={filteredProducts}
        columns={columns}
        isLoading={loading}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
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
        title='Delete Product'
        itemType='product'
        itemName={selectedProduct?.title || ""}
        isDeleting={deleting}
      />
    </div>
  );
}
