import { useTranslation } from "react-i18next";
import Modal from "../../../components/common/Modal";
import type { ICustomer, IOrder } from "../../../types";
import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDate } from "../../../utils/formatDate";
import { useLanguage } from "../../../context/LanguageContext";

interface Props {
  isOpen: boolean;
  customer: ICustomer;
  onClose: () => void;
}

const CustomersFormDetails = ({ isOpen, customer, onClose }: Props) => {
  const selectedCustomer = customer;
  const { t } = useTranslation();
  const { currentLang } = useLanguage();

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={"Customer Details"}
      maxWidth='max-w-3xl'
      showSaveBtn={false}
    >
      <div className='flex justify-between items-start mb-6'>
        <p className='text-sm text-[var(--text-muted)]'>
          {t("Member since", {
            date: formatDate(selectedCustomer.created_at || "N/A"),
          })}
        </p>
      </div>

      <div className='grid grid-cols-2 gap-6 mb-6'>
        <div>
          <h3 className='font-medium mb-2 text-[var(--text-secondary)]'>
            {t("Contact Information")}
          </h3>
          <p className='text-sm mb-1 text-[var(--text-secondary)]'>
            {currentLang === "ar"
              ? selectedCustomer.name_ar
              : selectedCustomer.full_name}
          </p>
          <p className='text-sm text-[var(--text-primary)] mb-1'>
            {selectedCustomer.email}
          </p>
          <p className='text-sm text-[var(--text-secondary)] mb-1'>
            {selectedCustomer.phone || "No phone"}
          </p>
          <p className='text-sm text-[var(--text-secondary)]'>
            {currentLang === "ar"
              ? selectedCustomer.address_ar
              : selectedCustomer.address || "No address"}
          </p>
        </div>
        <div>
          <h3 className='font-medium mb-2 text-[var(--text-secondary)]'>
            {t("Order Summary")}
          </h3>
          <p className='text-sm mb-1 text-[var(--text-secondary)]'>
            {t("Total Orders")}: {selectedCustomer.total_orders}
          </p>
          <p className='text-sm mb-1 text-[var(--text-secondary)]'>
            {t("Total Spent")}: {formatCurrency(selectedCustomer.total_spent)}
          </p>
        </div>
      </div>

      {selectedCustomer.orders.length > 0 && (
        <div>
          <h3 className='font-medium mb-4 text-[var(--text-secondary)]'>
            {t("Recent Orders")}
          </h3>
          <div className='space-y-4'>
            {selectedCustomer.orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className='flex justify-between items-center p-4 bg-[var(--bg-secondary)] rounded-lg'
              >
                <div>
                  <div className='text-sm font-medium text-[var(--text-secondary)]'>
                    {t("Order")} #{order.id.slice(0, 8)}
                  </div>
                  <div className='text-sm text-[var(--text-muted)]'>
                    {formatDate(order.created_at)}
                  </div>
                </div>
                <div className='flex items-center space-x-4'>
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {t(`statuses.${order.status}`)}
                  </span>
                  <span className='text-sm font-medium text-[var(--text-secondary)]'>
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CustomersFormDetails;
