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
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../../context/LanguageContext";

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
  const { t } = useTranslation();
  const { currentLang } = useLanguage();

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
        if (deletingEmployee.user_id)
          await deleteEmployeeById(deletingEmployee.user_id);
        await loadEmployees();
        setIsDeleteModalOpen(false);
        setDeletingEmployee(null);
        resolve(t("Employee deleted successfully"));
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
      loading: `${t("Deleting employee")}`,
      success: (message) => message as string,
      error: (err) => `Error: ${err}`,
    });
  };

  const columns = [
    {
      header: `${t("Name")}`,
      accessor: (employee: IEmployee) => (
        <div className='text-sm font-medium text-[var(--text-secondary)]'>
          {currentLang === "ar" ? employee.name_ar : employee.full_name}
        </div>
      ),
      sortable: true,
      sortKey: "full_name" as keyof IEmployee,
    },
    {
      header: `${t("Role")}`,
      accessor: (employee: IEmployee) => (
        <div className='text-sm text-[var(--text-secondary)]'>
          {t(`UserRole.${employee.role}`)}
        </div>
      ),
      sortable: true,
      sortKey: "role" as keyof IEmployee,
    },
    {
      header: `${t("Contact")}`,
      accessor: (employee: IEmployee) => (
        <div className='flex flex-col gap-1'>
          <div className='text-sm text-[var(--text-secondary)] flex items-center'>
            <MdEmail
              className={`w-4 h-4 ${currentLang === "ar" ? "ml-1" : "mr-1"}`}
            />
            {employee.email || "N/A"}
          </div>
          <div className='text-sm text-[var(--text-secondary)] flex items-center'>
            <MdPhone
              className={`w-4 h-4 ${currentLang === "ar" ? "ml-1" : "mr-1"}`}
            />
            {employee.phone || "N/A"}
          </div>
        </div>
      ),
      sortable: true,
      sortKey: "phone" as keyof IEmployee,
    },
    {
      header: `${t("Address")}`,
      accessor: (employee: IEmployee) => (
        <div className='text-sm text-[var(--text-secondary)]'>
          {currentLang === "ar" ? employee.address_ar : employee.address}
        </div>
      ),
      sortable: true,
      sortKey: "address" as keyof IEmployee,
    },
    {
      header: `${t("Salary")}`,
      accessor: (employee: IEmployee) => (
        <div className='text-sm text-[var(--text-secondary)]'>
          ${employee.salary ? employee.salary : "0"}
        </div>
      ),
      sortable: true,
      sortKey: "salary" as keyof IEmployee,
    },
    {
      header: `${t("Hire Date")}`,
      accessor: (employee: IEmployee) => (
        <div className='text-sm text-[var(--text-secondary)]'>
          {employee.hire_date
            ? new Date(employee.hire_date).toLocaleDateString()
            : "No date"}
        </div>
      ),
      sortable: true,
      sortKey: "hire_date" as keyof IEmployee,
    },
    {
      header: `${t("Actions")}`,
      accessor: (employee: IEmployee) => (
        <div className='flex justify-end'>
          <DropdownMenu
            items={[
              {
                label: `${t("Edit")}`,
                onClick: () => handleEdit(employee),
              },
              {
                label: `${t("Delete")}`,
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
        addButtonText='Employee'
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
        title='Employee'
        itemType='Employee'
        itemName={deletingEmployee?.full_name || ""}
        isDeleting={deleting}
      />
    </div>
  );
}
