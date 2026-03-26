import { useEffect, useState } from "react";

import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { MdLocationOn, MdPhone } from "react-icons/md";
import {
  deleteCustomerById,
  fetchAllCustomersWithOrders,
} from "../../../api/customers";
import { bulkDelete } from "../../../api/general";
import DeleteModal from "../../../components/common/DeleteModal";
import DropdownMenu from "../../../components/common/DropdownMenu";
import PageHeader from "../../../components/common/PageHeader";
import Table from "../../../components/common/Table";
import { useLanguage } from "../../../context/LanguageContext";
import type { ICustomer } from "../../../types";
import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDate } from "../../../utils/formatDate";
import CustomersFormDetails from "./CustomersFormDetails";

export default function CustomersRoot() {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(
    null,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [deleting, setDeleting] = useState(false);
  const { t } = useTranslation();
  const { currentLang } = useLanguage();

  useEffect(() => {
    fetchCustomersWithOrders();
  }, [currentPage, pageSize, searchQuery]);

  const fetchCustomersWithOrders = async () => {
    try {
      setLoading(true);
      const { data, count } = await fetchAllCustomersWithOrders(
        currentPage,
        pageSize,
        searchQuery,
      );
      setCustomers(data);
      setTotalItems(count || 0);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      setDeleting(true);
      if (selectedCustomer.id)
        await deleteCustomerById(selectedCustomer.user_id ?? "");
      setCustomers(
        customers.filter((customer) => customer.id !== selectedCustomer.id),
      );
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting customer:", error);
    } finally {
      setDeleting(false);
    }
  };

  // Bulk actions handler
  const handleBulkAction = async (
    action: string,
    selectedIds: (string | number)[],
  ) => {
    try {
      switch (action) {
        case "delete":
          await toast.promise(
            bulkDelete("customers", selectedIds as number[]),
            {
              loading: t("Deleting selected customers"),
              success: t(`Customers deleted successfully`),
              error: t("Failed to delete customers"),
            },
          );
          await fetchCustomersWithOrders();
          break;
        case "archive":
          toast.success(
            t(`${selectedIds.length} customers archived successfully`),
          );
          // TODO: Implement archive functionality
          break;
        case "export":
          toast.success(
            t(`Export completed for ${selectedIds.length} customers`),
          );
          // TODO: Implement export functionality
          break;
        case "print":
          toast.success(
            t(`Print initiated for ${selectedIds.length} customers`),
          );
          // TODO: Implement print functionality
          break;
        default:
          console.log(`Action: ${action}`, `Selected IDs: ${selectedIds}`);
      }
    } catch (error) {
      console.error("Bulk action error:", error);
      toast.error(t("An error occurred while processing bulk action"));
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
      sortable: true,
      sortKey: "full_name" as keyof ICustomer,
      width: "25%",
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
      sortable: true,
      sortKey: "phone" as keyof ICustomer,
    },
    {
      header: `${t("Joined")}`,
      accessor: (customer: ICustomer) => (
        <div className='text-sm text-[var(--text-secondary)]'>
          {formatDate(customer.created_at || "N/A")}
        </div>
      ),
      sortable: true,
      sortKey: "created_at" as keyof ICustomer,
    },
    {
      header: `${t("Orders")}`,
      accessor: (customer: ICustomer) => (
        <div className='text-sm font-medium text-[var(--text-secondary)]'>
          {customer.total_orders}
        </div>
      ),
      sortable: true,
      sortKey: "total_orders" as keyof ICustomer,
    },
    {
      header: `${t("Total Spent")}`,
      accessor: (customer: ICustomer) => (
        <div className='text-sm font-medium text-[var(--text-secondary)]'>
          {formatCurrency(customer.total_spent)}
        </div>
      ),
      sortable: true,
      sortKey: "total_spent" as keyof ICustomer,
    },
    {
      header: "",
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
      width: "5%",
    },
  ];

  return (
    <div className='bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg overflow-hidden'>
      <PageHeader
        title='Customers'
        showAddButton={false}
        searchQuery={searchQuery}
        onSearch={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
      />

      <Table
        data={customers}
        columns={columns}
        isLoading={loading}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        onBulkAction={handleBulkAction}
      />

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
        itemName={
          currentLang === "ar"
            ? selectedCustomer?.name_ar || ""
            : selectedCustomer?.full_name || ""
        }
        isDeleting={deleting}
      />
    </div>
  );
}
