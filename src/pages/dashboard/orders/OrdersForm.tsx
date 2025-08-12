import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import type { IOrder, IOrderWithUserInfo } from "../../../types";
import { formatDate } from "../../../utils/formatDate";

interface Props {
  isOpen: boolean;
  order: IOrder;
  updating: boolean;
  changeStatus: (id: string, newStatus: IOrderWithUserInfo["status"]) => void;
  onClose: () => void;
}

const OrdersForm = ({
  isOpen,
  order,
  updating,
  changeStatus,
  onClose,
}: Props) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={"Order Details"}
      maxWidth='max-w-3xl'
      showSaveBtn={false}
      extraActions={
        <>
          {order.status === "pending" && (
            <Button
              onClick={() => changeStatus(order.id, "processing")}
              isLoading={updating}
            >
              Process Order
            </Button>
          )}
          {order.status === "processing" && (
            <Button
              onClick={() => changeStatus(order.id, "shipped")}
              isLoading={updating}
            >
              Ship Order
            </Button>
          )}
          {order.status === "shipped" && (
            <Button
              onClick={() => changeStatus(order.id, "delivered")}
              isLoading={updating}
            >
              Mark as Delivered
            </Button>
          )}
          {order.status !== "cancelled" && order.status !== "delivered" && (
            <Button
              variant='outline'
              onClick={() => changeStatus(order.id, "cancelled")}
              isLoading={updating}
            >
              Cancel Order
            </Button>
          )}

          {order.status == "cancelled" && (
            <Button
              variant='outline'
              onClick={() => changeStatus(order.id, "pending")}
              isLoading={updating}
            >
              Reopen Order (Pending)
            </Button>
          )}
        </>
      }
    >
      <div className='flex justify-between items-start mb-6'>
        <p className='text-sm text-[var(--text-muted)]'>
          Order #{order.id.slice(0, 8)} • {formatDate(order.created_at || "")}
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
        <div>
          <h3 className='font-medium mb-2 text-[var(--text-secondary)]'>
            Customer Information
          </h3>
          <p className='text-sm mb-1 text-[var(--text-secondary)]'>
            {order.customer.full_name}
          </p>
          <p className='text-sm text-[var(--text-secondary)]'>
            {order.customer.phone}
          </p>
        </div>
        <div>
          <h3 className='font-medium mb-2 text-[var(--text-secondary)]'>
            Shipping Address
          </h3>
          <p className='text-sm text-[var(--text-secondary)]'>
            {order.shipping_address}
          </p>
        </div>
      </div>
      <div>
        <h3 className='font-medium mb-4 text-[var(--text-secondary)]'>
          Order Items
        </h3>
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
                <h4 className='text-sm font-medium text-[var(--text-secondary)]'>
                  {item.product.title}
                </h4>
                <p className='text-sm text-[var(--text-muted)]'>
                  Quantity: {item.quantity} × ${item.price.toFixed(2)}
                </p>
              </div>
              <div className='text-sm font-bold text-[var(--text-secondary)]'>
                ${(item.quantity * item.price).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className='border-t border-[var(--border-color)] pt-4'>
        <div className='flex justify-between text-sm mb-2'>
          <span className='text-[var(--text-secondary)]'>Subtotal</span>
          <span className='text-[var(--text-secondary)]'>
            ${order.total_amount.toFixed(2)}
          </span>
        </div>
        <div className='flex justify-between text-sm mb-2'>
          <span className='text-[var(--text-secondary)]'>Shipping</span>
          <span className='text-[var(--text-secondary)]'>Free</span>
        </div>
        <div className='flex justify-between font-medium text-lg mt-4'>
          <span className='text-[var(--text-secondary)]'>Total</span>
          <span className='text-[var(--text-secondary)]'>
            ${order.total_amount.toFixed(2)}
          </span>
        </div>
      </div>
    </Modal>
  );
};

export default OrdersForm;
