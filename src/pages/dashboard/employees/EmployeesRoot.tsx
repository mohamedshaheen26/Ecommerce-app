import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import type { IEmployee } from "../../../types";

import { deleteEmployeeById, fetchAllEmployees } from "../../../api/employee";

import DeleteModal from "../../../components/common/DeleteModal";
import DropdownMenu from "../../../components/common/DropdownMenu";
import Table from "../../../components/common/Table";

import { useTranslation } from "react-i18next";
import { MdEmail, MdPhone } from "react-icons/md";
import { bulkDelete } from "../../../api/general";
import PageHeader from "../../../components/common/PageHeader";
import { useLanguage } from "../../../context/LanguageContext";
import EmployeesForm from "./EmployeesForm";

export default function EmployeesRoot() {
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<IEmployee | null>(
    null,
  );
  const [deletingEmployee, setDeletingEmployee] = useState<IEmployee | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [deleting, setDeleting] = useState(false);
  const { t } = useTranslation();
  const { currentLang } = useLanguage();

  useEffect(() => {
    loadEmployees();
  }, [currentPage, searchQuery, pageSize]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const { data, count } = await fetchAllEmployees(
        currentPage,
        pageSize,
        searchQuery,
      );
      setEmployees(data);
      setTotalItems(count || 0);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleEdit = (employee: IEmployee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    debugger;
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
          error instanceof Error ? error.message : "Failed to delete employee",
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

  // Bulk actions handler
  const handleBulkAction = async (
    action: string,
    selectedIds: (string | number)[],
  ) => {
    try {
      switch (action) {
        case "delete":
          await toast.promise(
            bulkDelete("employees", selectedIds as number[]),
            {
              loading: t("Deleting selected employees"),
              success: t(`Employees deleted successfully`),
              error: t("Failed to delete employees"),
            },
          );
          await loadEmployees();
          break;
        case "archive":
          toast.success(
            t(`${selectedIds.length} Employees archived successfully`),
          );
          // TODO: Implement archive functionality
          break;
        case "export":
          toast.success(
            t(`Export completed for ${selectedIds.length} Employees`),
          );
          // TODO: Implement export functionality
          break;
        case "print":
          toast.success(
            t(`Print initiated for ${selectedIds.length} Employees`),
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
      width: "30%",
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
      header: "",
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
      width: "5%",
    },
  ];

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
        onSearch={(val) => {
          setSearchQuery(val);
          setCurrentPage(1); // Reset to first page when searching
        }}
      />

      <Table
        data={employees}
        columns={columns}
        isLoading={loading}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        onBulkAction={handleBulkAction}
      />

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
        itemName={
          currentLang === "ar"
            ? deletingEmployee?.name_ar || ""
            : deletingEmployee?.full_name || ""
        }
        isDeleting={deleting}
      />
    </div>
  );
}
