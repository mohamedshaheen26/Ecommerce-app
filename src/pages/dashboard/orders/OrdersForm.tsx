import Button from "../../../components/common/Button";
import type { IOrder } from "../../../types";
import { formatDate } from "../../../utils/formatDate";

interface Props {
  order: IOrder;
  updating: boolean;
  changeStatus: () => void;
  onClose: () => void;
}

const OrdersForm = ({ order, updating, changeStatus, onClose }: Props) => {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
      <div className='bg-white rounded-lg p-6 w-full max-w-2xl'>
        <div className='flex justify-between items-start mb-6'>
          <div>
            <h2 className='text-xl font-semibold mb-2'>Order Details</h2>
            <p className='text-sm text-gray-500'>
              Order #{order.id.slice(0, 8)} •{" "}
              {formatDate(order.created_at || "")}
            </p>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-500'
          >
            ×
          </button>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
          <div>
            <h3 className='font-medium mb-2'>Customer Information</h3>
            <p className='text-sm'>{order.customer.full_name}</p>
            <p className='text-sm text-gray-500'>{order.customer.phone}</p>
          </div>
          <div>
            <h3 className='font-medium mb-2'>Shipping Address</h3>
            <p className='text-sm'>{order.shipping_address}</p>
          </div>
        </div>
        <div className='mb-6'>
          <h3 className='font-medium mb-4'>Order Items</h3>
          <div className='space-y-4'>
            {order.order_items?.map((item) => (
              <div key={item.id} className='flex items-center space-x-4'>
                <div className='flex-shrink-0 w-16 h-16'>
                  <img
                    src={item.product.image_url}
                    alt={item.product.title}
                    className='w-full h-full object-cover rounded-lg'
                  />
                </div>
                <div className='flex-1'>
                  <h4 className='text-sm font-medium'>{item.product.title}</h4>
                  <p className='text-sm text-gray-500'>
                    Quantity: {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                </div>
                <div className='text-sm font-medium'>
                  ${(item.quantity * item.price).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className='border-t border-gray-200 pt-4'>
          <div className='flex justify-between text-sm mb-2'>
            <span>Subtotal</span>
            <span>${order.total_amount.toFixed(2)}</span>
          </div>
          <div className='flex justify-between text-sm mb-2'>
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className='flex justify-between font-medium text-lg mt-4'>
            <span>Total</span>
            <span>${order.total_amount.toFixed(2)}</span>
          </div>
        </div>
        <div className='flex justify-end space-x-3'>
          <Button variant='outline' onClick={onClose}>
            Close
          </Button>
          {order.status === "pending" && (
            <Button onClick={changeStatus} isLoading={updating}>
              Process Order
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersForm;
