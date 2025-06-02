import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { MdLocalShipping } from 'react-icons/md';
import Table from '../../components/common/Table';
import DropdownMenu from '../../components/common/DropdownMenu';
import Button from '../../components/common/Button';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    image_url: string;
  };
}

interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address: string;
  created_at: string;
  user_email: string;
  user_full_name: string;
  order_items: OrderItem[];
}

interface UserData {
  email: string;
  full_name: string;
}

interface OrderItemResponse {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    image_url: string;
  };
}

interface OrderResponse {
  id: string;
  user_id: string;
  status: Order['status'];
  total_amount: number;
  shipping_address: string;
  created_at: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // First, get all orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          status,
          total_amount,
          shipping_address,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Get user information for each order
      const ordersWithUserInfo = await Promise.all(((ordersData || []) as OrderResponse[]).map(async (order) => {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email, full_name')
          .eq('id', order.user_id)
          .single();

        if (userError) {
          console.error('Error fetching user data:', userError);
          return {
            ...order,
            user_email: 'Unknown',
            user_full_name: 'Unknown User'
          };
        }

        const typedUserData = userData as UserData;
        return {
          ...order,
          user_email: typedUserData?.email || 'Unknown',
          user_full_name: typedUserData?.full_name || 'Unknown User'
        };
      }));

      // Get order items for each order
      const completeOrders = await Promise.all(ordersWithUserInfo.map(async (order) => {
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            id,
            product_id,
            quantity,
            price,
            product:products (
              name,
              image_url
            )
          `)
          .eq('order_id', order.id);

        if (itemsError) {
          console.error('Error fetching order items:', itemsError);
          return {
            ...order,
            order_items: []
          } as Order;
        }

        return {
          ...order,
          order_items: ((itemsData || []) as unknown as OrderItemResponse[]).map(item => ({
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            product: {
              name: item.product.name,
              image_url: item.product.image_url
            }
          }))
        } as Order;
      }));

      setOrders(completeOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      setUpdating(true);
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      // If the order is currently selected, update its status in the modal
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdating(false);
    }
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

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = [
    {
      header: 'Order ID',
      accessor: (order: Order) => (
        <div className="text-sm font-medium text-gray-900">
          #{order.id.slice(0, 8)}
        </div>
      )
    },
    {
      header: 'Customer',
      accessor: (order: Order) => (
        <div>
          <div className="text-sm text-gray-900">{order.user_full_name}</div>
          <div className="text-sm text-gray-500">{order.user_email}</div>
        </div>
      )
    },
    {
      header: 'Date',
      accessor: (order: Order) => (
        <div className="text-sm text-gray-900">
          {formatDate(order.created_at)}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (order: Order) => (
        <select
          value={order.status}
          onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
          className={`text-sm rounded-full px-3 py-1 font-semibold ${getStatusColor(order.status)}`}
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      )
    },
    {
      header: 'Total',
      accessor: (order: Order) => (
        <div className="text-sm font-medium text-gray-900">
          ${order.total_amount.toFixed(2)}
        </div>
      )
    },
    {
      header: '',
      accessor: (order: Order) => (
        <div className="flex justify-end">
          <DropdownMenu
            items={[
              {
                label: 'View Details',
                onClick: () => {
                  setSelectedOrder(order);
                  setIsModalOpen(true);
                },
                className: 'text-blue-600'
              },
              {
                label: 'Mark as Shipped',
                onClick: () => handleStatusChange(order.id, 'shipped'),
                className: 'text-purple-600',
                hidden: order.status !== 'processing'
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
        <h1 className="text-2xl font-semibold text-gray-800">Orders</h1>
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <Table
        data={filteredOrders}
        columns={columns}
        isLoading={loading}
      />

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Order Details</h2>
                <p className="text-sm text-gray-500">
                  Order #{selectedOrder.id.slice(0, 8)} • {formatDate(selectedOrder.created_at)}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-medium mb-2">Customer Information</h3>
                <p className="text-sm">{selectedOrder.user_full_name}</p>
                <p className="text-sm text-gray-500">{selectedOrder.user_email}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Shipping Address</h3>
                <p className="text-sm">{selectedOrder.shipping_address}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-medium mb-4">Order Items</h3>
              <div className="space-y-4">
                {selectedOrder.order_items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-16 h-16">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{item.product.name}</h4>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-sm font-medium">
                      ${(item.quantity * item.price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Subtotal</span>
                <span>${selectedOrder.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-medium text-lg mt-4">
                <span>Total</span>
                <span>${selectedOrder.total_amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </Button>
              {selectedOrder.status === 'pending' && (
                <Button
                  onClick={() => handleStatusChange(selectedOrder.id, 'processing')}
                  isLoading={updating}
                >
                  Process Order
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {isStatusModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Update Order Status</h2>
            <div className="space-y-4">
              {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                <Button
                  key={status}
                  variant={selectedOrder.status === status ? 'primary' : 'outline'}
                  fullWidth
                  onClick={() => handleStatusChange(selectedOrder.id, status as Order['status'])}
                  disabled={updating}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => setIsStatusModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 