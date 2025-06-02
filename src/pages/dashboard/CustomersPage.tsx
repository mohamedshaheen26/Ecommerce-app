import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { MdPhone, MdLocationOn } from 'react-icons/md';
import Table from '../../components/common/Table';
import DropdownMenu from '../../components/common/DropdownMenu';
import Button from '../../components/common/Button';

interface Order {
  id: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  created_at: string;
  orders: Order[];
}

interface CustomerWithStats extends User {
  total_orders: number;
  total_spent: number;
}

interface EditCustomerForm {
  full_name: string;
  phone: string;
  address: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithStats | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editForm, setEditForm] = useState<EditCustomerForm>({
    full_name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      // First, get all users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
          phone,
          address,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Then, get all orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*');

      if (ordersError) throw ordersError;

      // Process the data to add computed fields
      const processedCustomers = (usersData || []).map((user: any) => {
        const userOrders = (ordersData || []).filter(order => order.user_id === user.id);
        return {
          id: user.id,
          email: user.email,
          full_name: user.full_name || 'Unknown',
          phone: user.phone || null,
          address: user.address || null,
          created_at: user.created_at,
          orders: userOrders,
          total_orders: userOrders.length,
          total_spent: userOrders.reduce((sum: number, order: Order) => sum + (order.total_amount || 0), 0)
        };
      });

      setCustomers(processedCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const filteredCustomers = customers.filter(customer => 
    customer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: editForm.full_name,
          phone: editForm.phone || null,
          address: editForm.address || null
        })
        .eq('id', selectedCustomer.id);

      if (error) throw error;

      // Update local state
      setCustomers(customers.map(customer => 
        customer.id === selectedCustomer.id
          ? {
              ...customer,
              full_name: editForm.full_name,
              phone: editForm.phone || null,
              address: editForm.address || null
            }
          : customer
      ));

      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', selectedCustomer.id);

      if (error) throw error;

      // Update local state
      setCustomers(customers.filter(customer => customer.id !== selectedCustomer.id));
      setIsDeleteModalOpen(false);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const openEditModal = (customer: CustomerWithStats) => {
    setSelectedCustomer(customer);
    setEditForm({
      full_name: customer.full_name,
      phone: customer.phone || '',
      address: customer.address || ''
    });
    setIsEditModalOpen(true);
  };

  const columns = [
    {
      header: 'Customer',
      accessor: (customer: CustomerWithStats) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{customer.full_name}</div>
          <div className="text-sm text-gray-500">{customer.email}</div>
        </div>
      )
    },
    {
      header: 'Contact',
      accessor: (customer: CustomerWithStats) => (
        <div>
          <div className="text-sm text-gray-900 flex items-center">
            <MdPhone className="w-4 h-4 mr-1" />
            {customer.phone || 'N/A'}
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            <MdLocationOn className="w-4 h-4 mr-1" />
            {customer.address || 'N/A'}
          </div>
        </div>
      )
    },
    {
      header: 'Joined',
      accessor: (customer: CustomerWithStats) => (
        <div className="text-sm text-gray-500">
          {formatDate(customer.created_at)}
        </div>
      )
    },
    {
      header: 'Orders',
      accessor: (customer: CustomerWithStats) => (
        <div className="text-sm font-medium text-gray-900">
          {customer.total_orders}
        </div>
      )
    },
    {
      header: 'Total Spent',
      accessor: (customer: CustomerWithStats) => (
        <div className="text-sm font-medium text-gray-900">
          {formatCurrency(customer.total_spent)}
        </div>
      )
    },
    {
      header: '',
      accessor: (customer: CustomerWithStats) => (
        <div className="flex justify-end">
          <DropdownMenu
            items={[
              {
                label: 'View',
                onClick: () => {
                  setSelectedCustomer(customer);
                  setIsModalOpen(true);
                }
              },
              {
                label: 'Edit',
                onClick: () => openEditModal(customer)
              },
              {
                label: 'Delete',
                onClick: () => {
                  setSelectedCustomer(customer);
                  setIsDeleteModalOpen(true);
                }
              }
            ]}
          />
        </div>
      ),
      className: 'w-10'
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Customers</h1>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <Table
        data={filteredCustomers}
        columns={columns}
        isLoading={loading}
      />

      {/* Customer Details Modal */}
      {isModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Customer Details</h2>
                <p className="text-sm text-gray-500">
                  Member since {formatDate(selectedCustomer.created_at)}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-medium mb-2">Contact Information</h3>
                <p className="text-sm mb-1">{selectedCustomer.full_name}</p>
                <p className="text-sm text-gray-500 mb-1">{selectedCustomer.email}</p>
                <p className="text-sm text-gray-500 mb-1">{selectedCustomer.phone || 'No phone'}</p>
                <p className="text-sm text-gray-500">{selectedCustomer.address || 'No address'}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Order Summary</h3>
                <p className="text-sm mb-1">Total Orders: {selectedCustomer.total_orders}</p>
                <p className="text-sm mb-1">Total Spent: {formatCurrency(selectedCustomer.total_spent)}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-medium mb-4">Recent Orders</h3>
              <div className="space-y-4">
                {selectedCustomer.orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium">Order #{order.id.slice(0, 8)}</div>
                      <div className="text-sm text-gray-500">{formatDate(order.created_at)}</div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className="text-sm font-medium">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Customer</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleEditCustomer(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Delete Customer</h2>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete this customer? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteCustomer}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 