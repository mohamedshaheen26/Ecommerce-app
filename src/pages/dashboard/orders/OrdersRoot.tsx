import { useState, useEffect } from "react";
import { IoSearchOutline } from "react-icons/io5";
import Table from "../../../components/common/Table";
import DropdownMenu from "../../../components/common/DropdownMenu";
import Input from "../../../components/common/Input";
import type { IOrderWithUserInfo } from "../../../types";
import { fetchOrders, updateOrderStatus } from "../../../api/orders";
import { formatDate } from "../../../utils/formatDate";
import OrdersForm from "./OrdersForm";
import { getStatusColor } from "../../../utils/orderStatus";
import { MdPhone } from "react-icons/md";
import { FaUser } from "react-icons/fa";

export default function OrdersRoot() {
  const [orders, setOrders] = useState<IOrderWithUserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<IOrderWithUserInfo | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
    console.log(newStatus);

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
        <div className='text-sm font-medium text-[var(--text-secondary)]'>
          #{order.id.slice(0, 8)}
        </div>
      ),
    },
    {
      header: "Customer",
      accessor: (order: IOrderWithUserInfo) => (
        <div>
          <div className='text-sm text-[var(--text-secondary)] flex items-center'>
            <FaUser className='w-4 h-4 mr-1' />
            {order.customer.full_name}
          </div>
          <div className='text-sm text-[var(--text-secondary)] flex items-center'>
            <MdPhone className='w-4 h-4 mr-1' />
            {order.customer.phone}
          </div>
        </div>
      ),
    },
    {
      header: "Date",
      accessor: (order: IOrderWithUserInfo) => (
        <div className='text-sm text-[var(--text-secondary)]'>
          {formatDate(order.created_at || "")}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (order: IOrderWithUserInfo) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
            order.status
          )}`}
        >
          {order.status.replace("_", " ").charAt(0).toUpperCase() +
            order.status.replace("_", " ").slice(1)}
        </span>
      ),
    },
    {
      header: "Total",
      accessor: (order: IOrderWithUserInfo) => (
        <div className='text-sm font-medium text-[var(--text-secondary)]'>
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
            ]}
          />
        </div>
      ),
      className: "w-10",
    },
  ];

  return (
    <div className='bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg overflow-hidden'>
      <div className='flex justify-between items-center py-6 px-8 border-b border-[var(--border-color)]'>
        <h1 className='text-2xl font-semibold text-[var(--text-secondary)]'>
          Orders
        </h1>
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
          isOpen={isModalOpen}
          order={selectedOrder}
          updating={updating}
          onClose={() => {
            setIsModalOpen(false);
          }}
          changeStatus={handleStatusChange}
        />
      )}
    </div>
  );
}
