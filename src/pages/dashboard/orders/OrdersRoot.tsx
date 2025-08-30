import { useState, useEffect } from "react";
import Table from "../../../components/common/Table";
import DropdownMenu from "../../../components/common/DropdownMenu";
import type { IOrderWithUserInfo } from "../../../types";
import { fetchOrders, updateOrderStatus } from "../../../api/orders";
import { formatDate } from "../../../utils/formatDate";
import OrdersForm from "./OrdersForm";
import { getStatusColor } from "../../../utils/orderStatus";
import { MdPhone } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../../context/LanguageContext";
import PageHeader from "../../../components/common/PageHeader";

export default function OrdersRoot() {
  const [orders, setOrders] = useState<IOrderWithUserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<IOrderWithUserInfo | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [updating, setUpdating] = useState(false);
  const { t } = useTranslation();
  const { currentLang } = useLanguage();

  useEffect(() => {
    loadOrders();
  }, [currentPage, pageSize, searchQuery]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data, count } = await fetchOrders(
        currentPage,
        pageSize,
        searchQuery
      );
      setOrders(data);
      setTotalItems(count || 0);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
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

  // Custom bulk actions for orders
  // const orderBulkActions = [
  //   {
  //     value: "approve",
  //     label: t("Approve Selected"),
  //     variant: "outline",
  //     color: "success",
  //   },
  //   {
  //     value: "ship",
  //     label: t("Mark as Shipped"),
  //     variant: "outline",
  //     color: "info",
  //   },
  //   {
  //     value: "cancel",
  //     label: t("Cancel Selected"),
  //     variant: "outline",
  //     color: "error",
  //   },
  //   {
  //     value: "export",
  //     label: t("Export Selected"),
  //     variant: "outline",
  //     color: "secondary",
  //   },
  //   {
  //     value: "print",
  //     label: t("Print Selected"),
  //     variant: "outline",
  //     color: "warning",
  //   },
  // ];

  // Bulk actions handler for orders
  // const handleBulkAction = async (
  //   action: string,
  //   selectedIds: (string | number)[]
  // ) => {
  //   try {
  //     switch (action) {
  //       case "approve":
  //         // Bulk approve orders
  //         for (const orderId of selectedIds) {
  //           await updateOrderStatus(orderId as string, "approved");
  //         }
  //         toast.success(
  //           t(`${selectedIds.length} orders approved successfully`)
  //         );
  //         await loadOrders(); // Refresh the data
  //         break;
  //       case "ship":
  //         // Bulk ship orders
  //         for (const orderId of selectedIds) {
  //           await updateOrderStatus(orderId as string, "shipped");
  //         }
  //         toast.success(t(`${selectedIds.length} orders marked as shipped`));
  //         await loadOrders(); // Refresh the data
  //         break;
  //       case "cancel":
  //         // Bulk cancel orders
  //         for (const orderId of selectedIds) {
  //           await updateOrderStatus(orderId as string, "cancelled");
  //         }
  //         toast.success(
  //           t(`${selectedIds.length} orders cancelled successfully`)
  //         );
  //         await loadOrders(); // Refresh the data
  //         break;
  //       case "export":
  //         toast.success(t(`Export completed for ${selectedIds.length} orders`));
  //         // TODO: Implement export functionality
  //         break;
  //       case "print":
  //         toast.success(t(`Print initiated for ${selectedIds.length} orders`));
  //         // TODO: Implement print functionality
  //         break;
  //       default:
  //         console.log(`Action: ${action}`, `Selected IDs: ${selectedIds}`);
  //     }
  //   } catch (error) {
  //     console.error("Bulk action error:", error);
  //     toast.error(t("An error occurred while processing bulk action"));
  //   }
  // };

  const columns = [
    {
      header: `${t("Order ID")}`,
      accessor: (order: IOrderWithUserInfo) => (
        <div className='text-sm font-medium text-[var(--text-secondary)]'>
          #{order.id.slice(0, 8)}
        </div>
      ),
      sortable: true,
      sortKey: "id" as keyof IOrderWithUserInfo,
    },
    {
      header: `${t("Customer")}`,
      accessor: (order: IOrderWithUserInfo) => (
        <div className='flex flex-col gap-1'>
          <div className='text-sm text-[var(--text-secondary)] flex items-center'>
            <FaUser
              className={`w-4 h-4 ${currentLang === "ar" ? "ml-1" : "mr-1"}`}
            />
            {currentLang === "ar"
              ? order.customer.name_ar
              : order.customer.full_name}
          </div>
          <div className='text-sm text-[var(--text-secondary)] flex items-center'>
            <MdPhone
              className={`w-4 h-4 ${currentLang === "ar" ? "ml-1" : "mr-1"}`}
            />
            {order.customer.phone}
          </div>
        </div>
      ),
      sortable: true,
      sortKey: "customer.full_name" as keyof IOrderWithUserInfo,
    },
    {
      header: `${t("Date")}`,
      accessor: (order: IOrderWithUserInfo) => (
        <div className='text-sm text-[var(--text-secondary)]'>
          {formatDate(order.created_at || "")}
        </div>
      ),
      sortable: true,
      sortKey: "created_at" as keyof IOrderWithUserInfo,
    },
    {
      header: `${t("Status")}`,
      accessor: (order: IOrderWithUserInfo) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
            order.status
          )}`}
        >
          {t(`statuses.${order.status}`)}
        </span>
      ),
      sortable: true,
      sortKey: "status" as keyof IOrderWithUserInfo,
    },
    {
      header: `${t("Total")}`,
      accessor: (order: IOrderWithUserInfo) => (
        <div className='text-sm font-medium text-[var(--text-secondary)]'>
          ${order.total_amount.toFixed(2)}
        </div>
      ),
      sortable: true,
      sortKey: "total_amount" as keyof IOrderWithUserInfo,
    },
    {
      header: `${t("Actions")}`,
      accessor: (order: IOrderWithUserInfo) => (
        <div className='flex justify-end'>
          <DropdownMenu
            items={[
              {
                label: `${t("View")}`,
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
      <PageHeader
        title='Orders'
        showAddButton={false}
        searchQuery={searchQuery}
        onSearch={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
      />

      <Table
        data={orders}
        columns={columns}
        isLoading={loading}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        enableBulkActions={true}
        // bulkActions={orderBulkActions}
        // onBulkAction={handleBulkAction}
      />

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
