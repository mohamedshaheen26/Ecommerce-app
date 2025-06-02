import { MdClose } from 'react-icons/md';
import { supabase } from '../../lib/supabase';
import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Grid from '../common/Grid';
import FormField from '../common/FormField';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import TextArea from '../common/TextArea';

interface Category {
  id: string;
  name: string;
}

interface ProductForm {
  title: string;
  price: number;
  description: string;
  category_id: string;
  slug: string;
  sku: string;
  stock_status: 'in_stock' | 'out_of_stock' | 'low_stock';
  available_quantity: number;
  colors: string[];
  sizes: string[];
  images: File[];
  imageUrls: string[];
}

const AVAILABLE_COLORS = [
  { name: 'Light Blue', value: '#ADD8E6' },
  { name: 'Pink', value: '#FFC0CB' },
  { name: 'Olive', value: '#808000' },
  { name: 'Blue', value: '#0000FF' },
];

const AVAILABLE_SIZES = ['S', 'M', 'X', 'XL', 'XXL'];
const bucket_productsImg = 'images';

interface AddEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
  editingProduct?: {
    id: string;
    title: string;
    price: number;
    description: string;
    category_id: string;
    slug: string;
    sku: string;
    stock_status: 'in_stock' | 'out_of_stock' | 'low_stock';
    available_quantity: number;
    colors: string[];
    sizes: string[];
    images: string[];
  } | null;
}

export default function AddEditProductModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  categories,
  editingProduct 
}: AddEditProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ProductForm>({
    title: editingProduct?.title || '',
    price: editingProduct?.price || 0,
    description: editingProduct?.description || '',
    category_id: editingProduct?.category_id || '',
    slug: editingProduct?.slug || '',
    sku: editingProduct?.sku || '',
    stock_status: editingProduct?.stock_status || 'in_stock',
    available_quantity: editingProduct?.available_quantity || 0,
    colors: editingProduct?.colors || [],
    sizes: editingProduct?.sizes || [],
    images: [],
    imageUrls: editingProduct?.images || []
  });

  // Update form when editingProduct changes
  useEffect(() => {
    if (editingProduct) {
      setForm({
        title: editingProduct.title,
        price: editingProduct.price,
        description: editingProduct.description,
        category_id: editingProduct.category_id,
        slug: editingProduct.slug,
        sku: editingProduct.sku,
        stock_status: editingProduct.stock_status,
        available_quantity: editingProduct.available_quantity,
        colors: editingProduct.colors,
        sizes: editingProduct.sizes,
        images: [],
        imageUrls: editingProduct.images
      });
    } else {
      setForm({
        title: '',
        price: 0,
        description: '',
        category_id: '',
        slug: '',
        sku: '',
        stock_status: 'in_stock',
        available_quantity: 0,
        colors: [],
        sizes: [],
        images: [],
        imageUrls: []
      });
    }
  }, [editingProduct]);

  const handleImageUpload = async (files: FileList) => {
    const newFiles = Array.from(files);
    setForm(prev => ({
      ...prev,
      images: [...prev.images, ...newFiles]
    }));
  };

  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const toggleColor = (color: string) => {
    setForm(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const toggleSize = (size: string) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      // First, upload new images to storage if any
      const newImageUrls = await Promise.all(
        form.images.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const uniqueId = Math.random().toString(36).substring(2);
          const fileName = `${uniqueId}-${Date.now()}.${fileExt}`;
          const filePath = `products/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from(bucket_productsImg)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('Error uploading:', uploadError);
            throw uploadError;
          }

          const { data: { publicUrl } } = supabase.storage
            .from(bucket_productsImg)
            .getPublicUrl(`products/${fileName}`);

          return publicUrl;
        })
      );

      const productData = {
        title: form.title,
        price: form.price,
        description: form.description,
        category_id: form.category_id,
        slug: form.slug || form.title.toLowerCase().replace(/ /g, '-'),
        sku: form.sku,
        stock_status: form.stock_status,
        available_quantity: form.available_quantity,
        images: [...form.imageUrls, ...newImageUrls],
        colors: form.colors,
        sizes: form.sizes
      };

      let error;
      if (editingProduct) {
        // Update existing product
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        error = updateError;
      } else {
        // Create new product
        const { error: insertError } = await supabase
          .from('products')
          .insert([productData]);
        error = insertError;
      }

      if (error) {
        console.error('Error saving product:', error);
        throw error;
      }

      // Reset form and close modal
      setForm({
        title: '',
        price: 0,
        description: '',
        category_id: '',
        slug: '',
        sku: '',
        stock_status: 'in_stock',
        available_quantity: 0,
        colors: [],
        sizes: [],
        images: [],
        imageUrls: []
      });
      onClose();
      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProduct ? 'Edit Product' : 'Add Product'}
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Grid>
          <FormField label="Title" required>
            <Input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Price" required>
            <Input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
              required
              min="0"
              step="0.01"
            />
          </FormField>

          <FormField label="Category" required>
            <Select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              required
              options={[
                { value: '', label: 'Select a category' },
                ...categories.map(category => ({
                  value: category.id,
                  label: category.name
                }))
              ]}
            />
          </FormField>

          <FormField label="SKU" required>
            <Input
              type="text"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Stock Status" required>
            <Select
              value={form.stock_status}
              onChange={(e) => setForm({ ...form, stock_status: e.target.value as any })}
              required
              options={[
                { value: 'in_stock', label: 'In Stock' },
                { value: 'low_stock', label: 'Low Stock' },
                { value: 'out_of_stock', label: 'Out of Stock' }
              ]}
            />
          </FormField>

          <FormField label="Available Quantity" required>
            <Input
              type="number"
              value={form.available_quantity}
              onChange={(e) => setForm({ ...form, available_quantity: parseInt(e.target.value) })}
              required
              min="0"
            />
          </FormField>
        </Grid>

        <FormField label="Description" required>
          <TextArea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </FormField>

        <FormField label="Colors">
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => toggleColor(color.value)}
                className={`w-8 h-8 rounded-full border-2 ${
                  form.colors.includes(color.value)
                    ? 'border-blue-500'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </FormField>

        <FormField label="Sizes">
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`px-4 py-2 rounded-md border ${
                  form.sizes.includes(size)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'border-gray-300 text-gray-700 hover:border-blue-500'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="Images">
          <div className="flex items-center space-x-4">
            <label className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
              Choose Files
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
              />
            </label>
            <span className="text-sm text-gray-500">
              {form.images.length} files selected
            </span>
          </div>
          <div className="mt-4">
            <Grid columns={6} gap={4}>
              {form.images.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="h-24 w-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <MdClose className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </Grid>
          </div>
        </FormField>

        <div className="flex justify-end space-x-3">
          <Button
            variant="default"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
} 