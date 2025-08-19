import { useTranslation } from "react-i18next";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import type { IOrder, IOrderWithUserInfo } from "../../../types";
import { formatDate } from "../../../utils/formatDate";
import { useLanguage } from "../../../context/LanguageContext";

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
  const { t } = useTranslation();
  const { currentLang } = useLanguage();

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
              {t("Process Order")}
            </Button>
          )}
          {order.status === "processing" && (
            <Button
              onClick={() => changeStatus(order.id, "shipped")}
              isLoading={updating}
            >
              {t("Ship Order")}
            </Button>
          )}
          {order.status === "shipped" && (
            <Button
              onClick={() => changeStatus(order.id, "delivered")}
              isLoading={updating}
            >
              {t("Mark as Delivered")}
            </Button>
          )}
          {order.status !== "cancelled" && order.status !== "delivered" && (
            <Button
              variant='outline'
              onClick={() => changeStatus(order.id, "cancelled")}
              isLoading={updating}
            >
              {t("Cancel Order")}
            </Button>
          )}

          {order.status == "cancelled" && (
            <Button
              variant='outline'
              onClick={() => changeStatus(order.id, "pending")}
              isLoading={updating}
            >
              {t("Reopen Order")} ({t("Pending")})
            </Button>
          )}
        </>
      }
    >
      <div className='flex justify-between items-start mb-6'>
        <p className='text-sm text-[var(--text-muted)]'>
          <span>
            {t("Order")} #{order.id.slice(0, 8)} •{" "}
          </span>
          <span className='inline-block'>
            {formatDate(order.created_at || "")}
          </span>
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
        <div>
          <h3 className='font-medium mb-2 text-[var(--text-secondary)]'>
            {t("Customer Information")}
          </h3>
          <p className='text-sm mb-1 text-[var(--text-secondary)]'>
            {currentLang === "ar"
              ? order.customer.name_ar
              : order.customer.full_name}
          </p>
          <p className='text-sm text-[var(--text-secondary)]'>
            {order.customer.phone}
          </p>
        </div>
        <div>
          <h3 className='font-medium mb-2 text-[var(--text-secondary)]'>
            {t("Shipping Address")}
          </h3>
          <p className='text-sm text-[var(--text-secondary)]'>
            {currentLang === "ar"
              ? order.customer.address_ar
              : order.customer.address}
          </p>
        </div>
      </div>
      <div>
        <h3 className='font-medium mb-4 text-[var(--text-secondary)]'>
          {t("Order Items")}
        </h3>
        <div className='space-y-4'>
          {order.order_items?.map((item) => (
            <div key={item.id} className='flex items-center space-x-4'>
              <div className='flex-shrink-0 w-16 h-16'>
                <img
                  src={item.product.image_url}
                  alt={
                    currentLang === "ar"
                      ? item.product.name_ar
                      : item.product.title
                  }
                  className='w-full h-full object-cover rounded-lg'
                />
              </div>
              <div className='flex-1'>
                <h4 className='text-sm font-medium text-[var(--text-secondary)]'>
                  {currentLang === "ar"
                    ? item.product.name_ar
                    : item.product.title}
                </h4>
                <p className='text-sm text-[var(--text-muted)]'>
                  {t("Quantity")}: {item.quantity} × ${item.price.toFixed(2)}
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
          <span className='text-[var(--text-secondary)]'>{t("Subtotal")}</span>
          <span className='text-[var(--text-secondary)]'>
            ${order.total_amount.toFixed(2)}
          </span>
        </div>
        <div className='flex justify-between text-sm mb-2'>
          <span className='text-[var(--text-secondary)]'>{t("Shipping")}</span>
          <span className='text-[var(--text-secondary)]'>{t("Free")}</span>
        </div>
        <div className='flex justify-between font-medium text-lg mt-4'>
          <span className='text-[var(--text-secondary)]'>{t("Total")}</span>
          <span className='text-[var(--text-secondary)]'>
            ${order.total_amount.toFixed(2)}
          </span>
        </div>
      </div>
    </Modal>
  );
};

export default OrdersForm;
