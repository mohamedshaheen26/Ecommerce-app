import { useState, useEffect } from "react";

import type { ICustomer } from "../../../types";
import {
  deleteCustomerById,
  fetchAllCustomersWithOrders,
} from "../../../api/customers";
import DropdownMenu from "../../../components/common/DropdownMenu";
import Table from "../../../components/common/Table";
import { MdLocationOn, MdPhone } from "react-icons/md";
import { formatDate } from "../../../utils/formatDate";
import CustomersFormDetails from "./CustomersFormDetails";
import { formatCurrency } from "../../../utils/formatCurrency";
import DeleteModal from "../../../components/common/DeleteModal";
import PageHeader from "../../../components/common/PageHeader";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../../context/LanguageContext";

export default function CustomersRoot() {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleting, setDeleting] = useState(false);
  const { t } = useTranslation();
  const { currentLang } = useLanguage();

  useEffect(() => {
    fetchCustomersWithOrders();
  }, []);

  const fetchCustomersWithOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchAllCustomersWithOrders();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false) ||
      (customer.address?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false)
  );

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      setDeleting(true);
      if (selectedCustomer.id) await deleteCustomerById(selectedCustomer.id);
      setCustomers(
        customers.filter((customer) => customer.id !== selectedCustomer.id)
      );
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting customer:", error);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: `${t("Name")}`,
      accessor: (customer: ICustomer) => (
        <div>
          <div className='text-sm font-medium text-[var(--text-secondary)]'>
            {currentLang === "ar" ? customer.name_ar : customer.full_name}
          </div>
          <div className='text-sm text-gray-500'>{customer.email}</div>
        </div>
      ),
    },
    {
      header: `${t("Contact")}`,
      accessor: (customer: ICustomer) => (
        <div className='flex flex-col gap-1'>
          <div className='text-sm text-[var(--text-secondary)] flex items-center'>
            <MdLocationOn
              className={`w-4 h-4 ${currentLang === "ar" ? "ml-1" : "mr-1"}`}
            />
            {currentLang === "ar"
              ? customer.address_ar
              : customer.address || "N/A"}
          </div>
          <div className='text-sm text-[var(--text-secondary)] flex items-center'>
            <MdPhone
              className={`w-4 h-4 ${currentLang === "ar" ? "ml-1" : "mr-1"}`}
            />
            {customer.phone || "N/A"}
          </div>
        </div>
      ),
    },
    {
      header: `${t("Joined")}`,
      accessor: (customer: ICustomer) => (
        <div className='text-sm text-[var(--text-secondary)]'>
          {formatDate(customer.created_at || "N/A")}
        </div>
      ),
    },
    {
      header: `${t("Orders")}`,
      accessor: (customer: ICustomer) => (
        <div className='text-sm font-medium text-[var(--text-secondary)]'>
          {customer.total_orders}
        </div>
      ),
    },
    {
      header: `${t("Total Spent")}`,
      accessor: (customer: ICustomer) => (
        <div className='text-sm font-medium text-[var(--text-secondary)]'>
          {formatCurrency(customer.total_spent)}
        </div>
      ),
    },
    {
      header: `${t("Actions")}`,
      accessor: (customer: ICustomer) => (
        <div className='flex justify-end'>
          <DropdownMenu
            items={[
              {
                label: `${t("View")}`,
                onClick: () => {
                  setSelectedCustomer(customer);
                  setIsModalOpen(true);
                },
              },
              {
                label: `${t("Delete")}`,
                onClick: () => {
                  setSelectedCustomer(customer);
                  setIsDeleteModalOpen(true);
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
      <PageHeader
        title='Customers'
        showAddButton={false}
        searchQuery={searchQuery}
        onSearch={(val) => setSearchQuery(val)}
      />

      <Table data={filteredCustomers} columns={columns} isLoading={loading} />

      {/* Customer Details Modal */}
      {isModalOpen && selectedCustomer && (
        <CustomersFormDetails
          isOpen={isModalOpen}
          customer={selectedCustomer}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
        }}
        onConfirm={handleDeleteCustomer}
        title='Customer'
        itemType='Customer'
        itemName={selectedCustomer?.full_name || ""}
        isDeleting={deleting}
      />
    </div>
  );
}
