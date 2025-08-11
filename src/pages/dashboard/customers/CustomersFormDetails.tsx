import { useState } from "react";
import Button from "../../../components/common/Button";
import type { ICustomer, IOrder } from "../../../types";
import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDate } from "../../../utils/formatDate";

interface Props {
  customer: ICustomer;
  onClose: () => void;
}

const CustomersFormDetails = ({ customer, onClose }: Props) => {
  const selectedCustomer = customer;
  const [, setIsModalOpen] = useState(false);

  const getStatusColor = (status: IOrder["status"]) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status];
  };

  return (
    <div className='fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center'>
      <div className='bg-white rounded-lg p-6 w-full max-w-2xl'>
        <div className='flex justify-between items-start mb-6'>
          <div>
            <h2 className='text-xl font-semibold mb-2'>Customer Details</h2>
            <p className='text-sm text-gray-500'>
              Member since {formatDate(selectedCustomer.created_at || "N/A")}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(false)}
            className='text-gray-400 hover:text-gray-500'
          >
            ×
          </button>
        </div>

        <div className='grid grid-cols-2 gap-6 mb-6'>
          <div>
            <h3 className='font-medium mb-2'>Contact Information</h3>
            <p className='text-sm mb-1'>{selectedCustomer.full_name}</p>
            <p className='text-sm text-gray-500 mb-1'>
              {selectedCustomer.email}
            </p>
            <p className='text-sm text-gray-500 mb-1'>
              {selectedCustomer.phone || "No phone"}
            </p>
            <p className='text-sm text-gray-500'>
              {selectedCustomer.address || "No address"}
            </p>
          </div>
          <div>
            <h3 className='font-medium mb-2'>Order Summary</h3>
            <p className='text-sm mb-1'>
              Total Orders: {selectedCustomer.total_orders}
            </p>
            <p className='text-sm mb-1'>
              Total Spent: {formatCurrency(selectedCustomer.total_spent)}
            </p>
          </div>
        </div>

        <div className='mb-6'>
          <h3 className='font-medium mb-4'>Recent Orders</h3>
          <div className='space-y-4'>
            {selectedCustomer.orders?.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className='flex justify-between items-center p-4 bg-gray-50 rounded-lg'
              >
                <div>
                  <div className='text-sm font-medium'>
                    Order #{order.id.slice(0, 8)}
                  </div>
                  <div className='text-sm text-gray-500'>
                    {formatDate(order.created_at)}
                  </div>
                </div>
                <div className='flex items-center space-x-4'>
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                  <span className='text-sm font-medium'>
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='flex justify-end space-x-3'>
          <Button variant='outline' type='button' onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomersFormDetails;
