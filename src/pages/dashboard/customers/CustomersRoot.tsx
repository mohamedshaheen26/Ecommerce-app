import { useState, useEffect } from "react";
import { IoSearchOutline } from "react-icons/io5";

import type { ICustomer } from "../../../types";
import {
  deleteCustomerById,
  fetchAllCustomersWithOrders,
} from "../../../api/customers";
import DropdownMenu from "../../../components/common/DropdownMenu";
import Table from "../../../components/common/Table";
import Input from "../../../components/common/Input";
import { MdLocationOn, MdPhone } from "react-icons/md";
import { formatDate } from "../../../utils/formatDate";
import CustomersFormDetails from "./CustomersFormDetails";
import { formatCurrency } from "../../../utils/formatCurrency";
import DeleteModal from "../../../components/common/DeleteModal";

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

  useEffect(() => {
    fetchCustomersWithOrders();
  }, []);

  console.log(customers);

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
      header: "Customer",
      accessor: (customer: ICustomer) => (
        <div>
          <div className='text-sm font-medium text-gray-900'>
            {customer.full_name}
          </div>
          <div className='text-sm text-gray-500'>{customer.email}</div>
        </div>
      ),
    },
    {
      header: "Contact",
      accessor: (customer: ICustomer) => (
        <div>
          <div className='text-sm text-gray-900 flex items-center'>
            <MdPhone className='w-4 h-4 mr-1' />
            {customer.phone || "N/A"}
          </div>
          <div className='text-sm text-gray-500 flex items-center'>
            <MdLocationOn className='w-4 h-4 mr-1' />
            {customer.address || "N/A"}
          </div>
        </div>
      ),
    },
    {
      header: "Joined",
      accessor: (customer: ICustomer) => (
        <div className='text-sm text-gray-500'>
          {formatDate(customer.created_at || "N/A")}
        </div>
      ),
    },
    {
      header: "Orders",
      accessor: (customer: ICustomer) => (
        <div className='text-sm font-medium text-gray-900'>
          {customer.total_orders}
        </div>
      ),
    },
    {
      header: "Total Spent",
      accessor: (customer: ICustomer) => (
        <div className='text-sm font-medium text-gray-900'>
          {formatCurrency(customer.total_spent)}
        </div>
      ),
    },
    {
      header: "",
      accessor: (customer: ICustomer) => (
        <div className='flex justify-end'>
          <DropdownMenu
            items={[
              {
                label: "View",
                onClick: () => {
                  setSelectedCustomer(customer);
                  setIsModalOpen(true);
                },
              },
              {
                label: "Delete",
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
    <div className='bg-white border border-gray-200 rounded-lg overflow-hidden'>
      <div className='flex justify-between items-center py-6 px-8 border-b border-gray-200'>
        <h1 className='text-2xl font-semibold text-gray-800'>Customers</h1>
        <div className='flex items-center space-x-4'>
          <Input
            placeholder='Search customers...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<IoSearchOutline className='w-5 h-5' />}
          />
        </div>
      </div>

      <Table data={filteredCustomers} columns={columns} isLoading={loading} />

      {/* Customer Details Modal */}
      {isModalOpen && selectedCustomer && (
        <CustomersFormDetails
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
        title='Delete Customer'
        itemType='customer'
        itemName={selectedCustomer?.full_name || ""}
        isDeleting={deleting}
      />
    </div>
  );
}
