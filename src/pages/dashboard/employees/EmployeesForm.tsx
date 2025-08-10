import toast from "react-hot-toast";

import {
  UserRole,
  type IEmployee,
  type IEmployeeValidation,
} from "../../../types";

import { createEmployee, updateEmployee } from "../../../api/employee";

import Input from "../../../components/common/Input";
import Modal from "../../../components/common/Modal";
import FormField from "../../../components/common/FormField";
import Select from "../../../components/common/Select";
import Grid from "../../../components/common/Grid";
import TextArea from "../../../components/common/TextArea";

import { employeeSchema } from "../../../validation/employeeSchema";
import { useYupForm } from "../../../hooks/useYupForm";
import { useEffect } from "react";

interface EmployeesFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingEmployee: IEmployee | null;
}

export default function EmployeesForm({
  isOpen,
  onClose,
  onSuccess,
  editingEmployee,
}: EmployeesFormProps) {
  const isEditing = !!editingEmployee;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useYupForm<IEmployeeValidation>(
    employeeSchema,
    {
      full_name: editingEmployee?.full_name ?? "",
      email: editingEmployee?.email ?? "",
      username: editingEmployee?.username ?? "",
      password: undefined,
      confirm_password: undefined,
      role: editingEmployee?.role ?? UserRole.Employee,
      phone: editingEmployee?.phone ?? "",
      address: editingEmployee?.address ?? "",
      hire_date: editingEmployee?.hire_date,
      salary: editingEmployee?.salary ?? 0,
    },
    { context: { isEditing } }
  );

  useEffect(() => {
    if (isOpen) {
      reset({
        full_name: editingEmployee?.full_name || "",
        email: editingEmployee?.email || "",
        username: editingEmployee?.username || "",
        password: undefined,
        confirm_password: undefined,
        phone: editingEmployee?.phone || "",
        address: editingEmployee?.address || "",
        role: editingEmployee?.role || UserRole.Employee,
        hire_date: editingEmployee?.hire_date,
        salary: editingEmployee?.salary || 0,
      });
    }
  }, [isOpen, editingEmployee, isEditing, reset]);

  const onSubmit = async (data: IEmployeeValidation) => {
    try {
      if (isEditing && editingEmployee?.id) {
        await updateEmployee(editingEmployee.id, data);
        toast.success("Employee updated successfully");
      } else {
        await createEmployee(data);
        toast.success("Employee created successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        `Failed to save employee: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleSubmit(onSubmit)}
      title={editingEmployee ? "Edit Employee" : "Add New Employee"}
      maxWidth='max-w-xl'
      isSubmitting={isSubmitting}
      confirmText={editingEmployee ? "Update" : "Create"}
    >
      <Grid columns={2}>
        <FormField
          htmlFor='full_name'
          label='Full Name'
          required
          error={errors.full_name?.message}
        >
          <Input id='full_name' {...register("full_name")} />
        </FormField>
        <FormField
          htmlFor='role'
          label='Role'
          required
          error={errors.role?.message}
        >
          <Select
            id='role'
            {...register("role")}
            options={[
              { value: "", label: "Select a role" },
              { value: UserRole.Employee, label: "Employee" },
              { value: UserRole.Admin, label: "Admin" },
            ]}
          />
        </FormField>
      </Grid>
      <Grid columns={2}>
        <FormField
          htmlFor='email'
          label='Email'
          required
          error={errors.email?.message}
        >
          <Input
            id='email'
            {...register("email")}
            disabled={!!editingEmployee}
          />
        </FormField>
        <FormField
          htmlFor='username'
          label='Username'
          required
          error={errors.username?.message}
        >
          <Input id='username' {...register("username")} />
        </FormField>
      </Grid>
      <Grid columns={2}>
        <FormField
          htmlFor='password'
          label='Password'
          required
          error={errors.password?.message}
        >
          <Input
            id='password'
            type='password'
            {...register("password")}
            disabled={!!editingEmployee}
          />
        </FormField>
        <FormField
          htmlFor='confirm_password'
          label='Confirm Password'
          required
          error={errors.confirm_password?.message}
        >
          <Input
            id='confirm_password'
            type='password'
            {...register("confirm_password")}
            disabled={!!editingEmployee}
          />
        </FormField>
      </Grid>
      <Grid columns={2}>
        <FormField
          htmlFor='hire_date'
          label='Hire Date'
          error={errors.hire_date?.message}
          required
        >
          <Input id='hire_date' type='date' {...register("hire_date")} />
        </FormField>
        <FormField
          htmlFor='salary'
          label='Salary'
          error={errors.salary?.message}
        >
          <Input id='salary' type='number' {...register("salary")} />
        </FormField>
      </Grid>
      <Grid columns={2}>
        <FormField htmlFor='phone' label='Phone' error={errors.phone?.message}>
          <Input id='phone' {...register("phone")} />
        </FormField>
        <FormField
          htmlFor='address'
          label='Address'
          error={errors.address?.message}
        >
          <TextArea id='address' {...register("address")} rows={2} />
        </FormField>
      </Grid>
    </Modal>
  );
}
