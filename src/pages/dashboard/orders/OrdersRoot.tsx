import { useState, useEffect } from "react";
import { IoSearchOutline } from "react-icons/io5";
import Table from "../../../components/common/Table";
import DropdownMenu from "../../../components/common/DropdownMenu";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import type { IOrderWithUserInfo } from "../../../types";
import { fetchOrders, updateOrderStatus } from "../../../api/orders";
import { formatDate } from "../../../utils/formatDate";
import OrdersForm from "./OrdersForm";

export default function OrdersRoot() {
  const [orders, setOrders] = useState<IOrderWithUserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<IOrderWithUserInfo | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    orderId: string,
    newStatus: IOrderWithUserInfo["status"]
  ) => {
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, newStatus);

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setUpdating(false);
      setIsModalOpen(false);
    }
  };

  const getStatusColor = (status: IOrderWithUserInfo["status"]) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status];
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.full_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      order.customer.phone?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const columns = [
    {
      header: "Order ID",
      accessor: (order: IOrderWithUserInfo) => (
        <div className='text-sm font-medium text-gray-900'>
          #{order.id.slice(0, 8)}
        </div>
      ),
    },
    {
      header: "Customer",
      accessor: (order: IOrderWithUserInfo) => (
        <div>
          <div className='text-sm text-gray-900'>
            {order.customer.full_name}
          </div>
          <div className='text-sm text-gray-500'>{order.customer.phone}</div>
        </div>
      ),
    },
    {
      header: "Date",
      accessor: (order: IOrderWithUserInfo) => (
        <div className='text-sm text-gray-900'>
          {formatDate(order.created_at || "")}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (order: IOrderWithUserInfo) => (
        <select
          value={order.status}
          onChange={(e) =>
            handleStatusChange(
              order.id,
              e.target.value as IOrderWithUserInfo["status"]
            )
          }
          className={`text-sm rounded-full px-3 py-1 font-semibold ${getStatusColor(
            order.status
          )}`}
        >
          <option value='pending'>Pending</option>
          <option value='processing'>Processing</option>
          <option value='shipped'>Shipped</option>
          <option value='delivered'>Delivered</option>
          <option value='cancelled'>Cancelled</option>
        </select>
      ),
    },
    {
      header: "Total",
      accessor: (order: IOrderWithUserInfo) => (
        <div className='text-sm font-medium text-gray-900'>
          ${order.total_amount.toFixed(2)}
        </div>
      ),
    },
    {
      header: "",
      accessor: (order: IOrderWithUserInfo) => (
        <div className='flex justify-end'>
          <DropdownMenu
            items={[
              {
                label: "View",
                onClick: () => {
                  setSelectedOrder(order);
                  setIsModalOpen(true);
                },
              },
              {
                label: "Shipping",
                onClick: () => handleStatusChange(order.id, "shipped"),
                hidden: order.status !== "processing",
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
        <h1 className='text-2xl font-semibold text-gray-800'>Orders</h1>
        <div className='flex items-center space-x-4'>
          <Input
            placeholder='Search orders...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<IoSearchOutline className='w-5 h-5' />}
          />
        </div>
      </div>

      <Table data={filteredOrders} columns={columns} isLoading={loading} />

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <OrdersForm
          order={selectedOrder}
          updating={updating}
          onClose={() => {
            setIsModalOpen(false);
          }}
          changeStatus={() => {
            handleStatusChange(selectedOrder.id, "processing");
          }}
        />
      )}

      {/* Status Update Modal */}
      {isStatusModalOpen && selectedOrder && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md'>
            <h2 className='text-xl font-semibold mb-4'>Update Order Status</h2>
            <div className='space-y-4'>
              {[
                "pending",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
              ].map((status) => (
                <Button
                  key={status}
                  variant={
                    selectedOrder.status === status ? "primary" : "outline"
                  }
                  fullWidth
                  onClick={() =>
                    handleStatusChange(
                      selectedOrder.id,
                      status as IOrderWithUserInfo["status"]
                    )
                  }
                  disabled={updating}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
            <div className='flex justify-end mt-6'>
              <Button
                variant='outline'
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
