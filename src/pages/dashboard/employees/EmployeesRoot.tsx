import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import type { IEmployee } from "../../../types";

import { fetchAllEmployees, deleteEmployeeById } from "../../../api/employee";

import DropdownMenu from "../../../components/common/DropdownMenu";
import Table from "../../../components/common/Table";
import DeleteModal from "../../../components/common/DeleteModal";

import EmployeesForm from "./EmployeesForm";
import { MdEmail, MdPhone } from "react-icons/md";
import PageHeader from "../../../components/common/PageHeader";

export default function EmployeesRoot() {
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<IEmployee | null>(
    null
  );
  const [deletingEmployee, setDeletingEmployee] = useState<IEmployee | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await fetchAllEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee: IEmployee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingEmployee) return;

    const deletePromise = new Promise(async (resolve, reject) => {
      try {
        setDeleting(true);
        if (deletingEmployee.id) await deleteEmployeeById(deletingEmployee.id);
        await loadEmployees();
        setIsDeleteModalOpen(false);
        setDeletingEmployee(null);
        resolve("Employee deleted successfully");
      } catch (error) {
        console.error("Error deleting employee:", error);
        reject(
          error instanceof Error ? error.message : "Failed to delete employee"
        );
      } finally {
        setDeleting(false);
      }
    });

    toast.promise(deletePromise, {
      loading: "Deleting employee...",
      success: (message) => message as string,
      error: (err) => `Error: ${err}`,
    });
  };

  const columns = [
    {
      header: "Name",
      accessor: (employee: IEmployee) => (
        <div className='text-sm font-medium text-[var(--text-secondary)]'>
          {employee.full_name}
        </div>
      ),
    },
    {
      header: "Role",
      accessor: (employee: IEmployee) => (
        <div className='text-sm text-[var(--text-secondary)]'>
          {employee.role}
        </div>
      ),
    },
    {
      header: "Contact",
      accessor: (employee: IEmployee) => (
        <div>
          <div className='text-sm text-[var(--text-secondary)] flex items-center'>
            <MdEmail className='w-4 h-4 mr-1' />
            {employee.email || "N/A"}
          </div>
          <div className='text-sm text-[var(--text-secondary)] flex items-center'>
            <MdPhone className='w-4 h-4 mr-1' />
            {employee.phone || "N/A"}
          </div>
        </div>
      ),
    },
    {
      header: "Address",
      accessor: (employee: IEmployee) => (
        <div className='text-sm text-[var(--text-secondary)]'>
          {employee.address}
        </div>
      ),
    },
    {
      header: "Salary",
      accessor: (employee: IEmployee) => (
        <div className='text-sm text-[var(--text-secondary)]'>
          ${employee.salary ? employee.salary : "0"}
        </div>
      ),
    },
    {
      header: "Hire Date",
      accessor: (employee: IEmployee) => (
        <div className='text-sm text-[var(--text-secondary)]'>
          {employee.hire_date
            ? new Date(employee.hire_date).toLocaleDateString()
            : "No date"}
        </div>
      ),
    },
    {
      header: "",
      accessor: (employee: IEmployee) => (
        <div className='flex justify-end'>
          <DropdownMenu
            items={[
              {
                label: "Edit",
                onClick: () => handleEdit(employee),
              },
              {
                label: "Delete",
                onClick: () => {
                  setDeletingEmployee(employee);
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

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg overflow-hidden'>
      <PageHeader
        title='Employees'
        addButtonText='Add Employee'
        onAdd={() => {
          setEditingEmployee(null);
          setIsFormOpen(true);
        }}
        searchQuery={searchQuery}
        onSearch={(val) => setSearchQuery(val)}
      />

      <Table data={filteredEmployees} columns={columns} isLoading={loading} />

      {isFormOpen && (
        <EmployeesForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={async () => {
            await loadEmployees();
            setIsFormOpen(false);
            setEditingEmployee(null);
          }}
          editingEmployee={editingEmployee}
        />
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingEmployee(null);
        }}
        onConfirm={handleDelete}
        title='Delete Employee'
        itemType='employee'
        itemName={deletingEmployee?.full_name || ""}
        isDeleting={deleting}
      />
    </div>
  );
}
