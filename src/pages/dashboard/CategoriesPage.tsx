import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { IoSearchOutline } from "react-icons/io5";
import Table from '../../components/common/Table';
import DropdownMenu from '../../components/common/DropdownMenu';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import TextArea from '../../components/common/TextArea';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const savePromise = new Promise(async (resolve, reject) => {
      try {
        const categoryData = {
          name: formData.name,
          description: formData.description
        };

        if (editingCategory) {
          const { error } = await supabase
            .from('categories')
            .update(categoryData)
            .eq('id', editingCategory.id);

          if (error) throw error;
          resolve('Category updated successfully');
        } else {
          const { error } = await supabase
            .from('categories')
            .insert([categoryData]);

          if (error) throw error;
          resolve('Category created successfully');
        }

        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
        fetchCategories();
      } catch (error) {
        console.error('Error saving category:', error);
        reject(error instanceof Error ? error.message : 'Failed to save category');
      }
    });

    toast.promise(savePromise, {
      loading: editingCategory ? 'Updating category...' : 'Creating category...',
      success: (message) => message as string,
      error: (err) => `Error: ${err}`,
    });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      const deletePromise = new Promise(async (resolve, reject) => {
        try {
          const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

          if (error) throw error;
          await fetchCategories();
          resolve('Category deleted successfully');
        } catch (error) {
          console.error('Error deleting category:', error);
          reject(error instanceof Error ? error.message : 'Failed to delete category');
        }
      });

      toast.promise(deletePromise, {
        loading: 'Deleting category...',
        success: (message) => message as string,
        error: (err) => `Error: ${err}`,
      });
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: (category: Category) => (
        <div className="text-sm font-medium text-gray-900">
          {category.name}
        </div>
      )
    },
    {
      header: 'Description',
      accessor: (category: Category) => (
        <div className="text-sm text-gray-500">
          {category.description}
        </div>
      )
    },
    {
      header: 'Created',
      accessor: (category: Category) => (
        <div className="text-sm text-gray-500">
          {new Date(category.created_at).toLocaleDateString()}
        </div>
      )
    },
    {
      header: '',
      accessor: (category: Category) => (
        <div className="flex justify-end">
          <DropdownMenu
            items={[
              {
                label: 'Edit',
                onClick: () => handleEdit(category),
              },
              {
                label: 'Delete',
                onClick: () => handleDelete(category.id),
              }
            ]}
          />
        </div>
      ),
      className: 'w-10'
    }
  ];

  // Add filtered categories
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex justify-between items-center py-6 px-8 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-800">Categories</h1>
        <div className="flex items-center space-x-4">
          <Button
            variant='secondary'
            onClick={() => {
              setEditingCategory(null);
              setFormData({ name: '', description: '' });
              setIsModalOpen(true);
            }}
          >
            Add Category
          </Button>
          <Input
            fullWidth={false}
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<IoSearchOutline className="w-5 h-5" />}
          />
        </div>
      </div>

      <Table
        data={filteredCategories}
        columns={columns}
        isLoading={loading}
      />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                label='Name'
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <TextArea
                  label='Description'
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 