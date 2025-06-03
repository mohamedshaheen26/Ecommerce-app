import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { MdAdd } from 'react-icons/md';
import { IoSwapVerticalOutline } from "react-icons/io5";
import { IoSearchOutline } from "react-icons/io5";
import AddEditProductModal from '../../components/products/AddEditProductModal';
import DeleteProductModal from '../../components/products/DeleteProductModal';
import Table from '../../components/common/Table';
import DropdownMenu from '../../components/common/DropdownMenu';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category_id: string;
  slug: string;
  sku: string;
  stock_status: 'in_stock' | 'out_of_stock' | 'low_stock';
  available_quantity: number;
  images: string[];
  colors: string[];
  sizes: string[];
  created_at: string;
  category: {
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select(`
          *,
          category:category_id (
            name
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply search filter if searchQuery exists
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,sku.ilike.%${searchQuery}%`);
      }

      // Apply pagination
      const { data, error, count } = await query
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      if (error) throw error;
      setProducts(data || []);
      setFilteredProducts(data || []);
      setTotalItems(count || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    const deletePromise = new Promise(async (resolve, reject) => {
      try {
        setDeleting(true);

        // Delete images from storage
        if (selectedProduct.images.length > 0) {
          const imagePaths = selectedProduct.images.map(url => {
            const path = url.split('/').pop();
            return `products/${path}`;
          });

          const { error: storageError } = await supabase.storage
            .from('images')
            .remove(imagePaths);

          if (storageError) {
            console.error('Error deleting images:', storageError);
          }
        }

        // Delete product from database
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', selectedProduct.id);

        if (error) throw error;

        setProducts(products.filter(p => p.id !== selectedProduct.id));
        setIsDeleteModalOpen(false);
        setSelectedProduct(null);
        resolve('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        reject(error instanceof Error ? error.message : 'Failed to delete product');
      } finally {
        setDeleting(false);
      }
    });

    toast.promise(deletePromise, {
      loading: 'Deleting product...',
      success: (message) => message as string,
      error: (err) => `Error: ${err}`,
    });
  };

  const columns = [
    {
      header: <IoSwapVerticalOutline />,
      accessor: (product: Product) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={product.images[0]}
              alt={product.title}
            />
          </div>
        </div>
      )
    },
    {
      header: 'Name',
      accessor: (product: Product) => (
        <div className="flex items-center">
          <div className="text-sm font-medium text-gray-900">
            {product.title}
          </div>
        </div>
      )
    },
    {
      header: 'SKU',
      accessor: (product: Product) => (
        <div className="flex items-center">
          <div className="text-sm font-medium text-gray-900">
            {product.sku}
          </div>
        </div>
      )
    },
    {
      header: 'Price',
      accessor: (product: Product) => (
        <div className="text-sm text-gray-900">${product.price}</div>
      )
    },
    {
      header: 'Stock',
      accessor: (product: Product) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
          ${product.stock_status === 'in_stock' ? 'bg-green-100 text-green-800' : 
            product.stock_status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'}`}
        >
          {product.stock_status.replace('_', ' ')}
        </span>
      )
    },
    {
      header: 'Category',
      accessor: (product: Product) => (
        <div className="text-sm text-gray-900">{product.category.name}</div>
      )
    },
    {
      header: '',
      accessor: (product: Product) => (
        <div className="flex justify-end">
          <DropdownMenu
            items={[
              {
                label: 'Edit',
                onClick: () => {
                  setSelectedProduct(product);
                  setIsAddModalOpen(true);
                },
              },
              {
                label: 'Delete',
                onClick: () => {
                  setSelectedProduct(product);
                  setIsDeleteModalOpen(true);
                },
              }
            ]}
          />
        </div>
      ),
      className: 'w-10'
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex justify-between items-center py-6 px-8 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-800">Products</h1>
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            onClick={() => {
              setSelectedProduct(null);
              setIsAddModalOpen(true);
            }}
          >
            Add Product
          </Button>
          <Input
            fullWidth={false}
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            leftIcon={<IoSearchOutline className="w-5 h-5" />}
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

      <AddEditProductModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedProduct(null);
        }}
        onSuccess={() => {
          fetchProducts();
          setIsAddModalOpen(false);
          setSelectedProduct(null);
        }}
        editingProduct={selectedProduct}
        categories={categories}
      />

      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleDelete}
        productTitle={selectedProduct?.title || ''}
      />
    </div>
  );
} 