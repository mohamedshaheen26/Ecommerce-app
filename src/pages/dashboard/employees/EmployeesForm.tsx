import toast from "react-hot-toast";

import {
  UserRole,
  type IEmployee,
  type IEmployeeValidation,
} from "../../../types";

import {
  adminChangePassword,
  changePassword,
  createEmployee,
  fetchEmployeeByUserId,
  updateEmployee,
} from "../../../api/employee";

import Input from "../../../components/common/Input";
import Modal from "../../../components/common/Modal";
import FormField from "../../../components/common/FormField";
import Select from "../../../components/common/Select";
import Grid from "../../../components/common/Grid";
import TextArea from "../../../components/common/TextArea";

import {
  getEmployeeSchema,
  getCredentialsSchema,
} from "../../../validation/employeeSchema";
import { useYupForm } from "../../../hooks/useYupForm";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { handleError } from "../../../utils/errorHandler";
import Button from "../../../components/common/Button";
import { supabase } from "../../../lib/supabase";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { useLanguage } from "../../../context/LanguageContext";

interface EmployeesFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingEmployee: IEmployee | null;
}

// Type for credentials form data
type CredentialsFormData = {
  password: string;
  confirm_password: string;
};

export default function EmployeesForm({
  isOpen,
  onClose,
  onSuccess,
  editingEmployee,
}: EmployeesFormProps) {
  const isEditing = !!editingEmployee;
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { t } = useTranslation();
  const { currentLang } = useLanguage();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useYupForm<IEmployeeValidation>(
    getEmployeeSchema() as any,
    {
      full_name: editingEmployee?.full_name ?? "",
      name_ar: editingEmployee?.name_ar ?? "",
      email: editingEmployee?.email ?? "",
      username: editingEmployee?.username ?? "",
      password: undefined,
      confirm_password: undefined,
      role: editingEmployee?.role ?? UserRole.Employee,
      phone: editingEmployee?.phone ?? "",
      address: editingEmployee?.address ?? "",
      address_ar: editingEmployee?.address_ar ?? "",
      hire_date:
        editingEmployee?.hire_date ?? new Date().toISOString().slice(0, 16),
      salary: editingEmployee?.salary ?? 0,
    },
    { context: { isEditing } }
  );

  // Separate form for credentials change
  const {
    register: registerCredentials,
    handleSubmit: handleSubmitCredentials,
    reset: resetCredentials,
    formState: {
      errors: credentialsErrors,
      isSubmitting: isCredentialsSubmitting,
    },
  } = useYupForm<CredentialsFormData>(getCredentialsSchema(), {
    password: "",
    confirm_password: "",
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        full_name: editingEmployee?.full_name || "",
        name_ar: editingEmployee?.name_ar || "",
        email: editingEmployee?.email || "",
        username: editingEmployee?.username || "",
        password: undefined,
        confirm_password: undefined,
        phone: editingEmployee?.phone || "",
        address: editingEmployee?.address || "",
        address_ar: editingEmployee?.address_ar || "",
        role: editingEmployee?.role || UserRole.Employee,
        hire_date: editingEmployee?.hire_date
          ? new Date(editingEmployee.hire_date).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        salary: editingEmployee?.salary || 0,
      });

      // Reset credentials form
      resetCredentials({
        password: "",
        confirm_password: "",
      });
    }
  }, [isOpen, editingEmployee, isEditing, reset, resetCredentials]);

  const onSubmit = async (data: IEmployeeValidation) => {
    debugger;
    try {
      if (isEditing && editingEmployee?.id) {
        await updateEmployee(editingEmployee.id, data);
        toast.success(t("Employee updated successfully"));
      } else {
        await createEmployee(data);
        toast.success(t("Employee created successfully"));
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(handleError(error));
    }
  };

  const onCredentialsSubmit = async (data: CredentialsFormData) => {
    try {
      if (!editingEmployee?.id || !editingEmployee.user_id) return;

      const { data: currentUser } = await supabase.auth.getUser();

      if (!currentUser.user?.id) return;

      const isSuperAdmin =
        currentUser.user.id === "8ea04744-6ea5-4a1f-bb0d-7a384db728ff";

      if (isSuperAdmin) {
        await adminChangePassword(editingEmployee.user_id, data.password);
      } else {
        const currentEmployee = await fetchEmployeeByUserId(
          currentUser.user?.id
        );

        const isAdmin = currentEmployee.role === UserRole.Admin;

        if (isAdmin) {
          await adminChangePassword(editingEmployee.user_id, data.password);
        } else if (currentUser.user.id === editingEmployee.user_id) {
          await changePassword(data.password);
        } else {
          toast.error(t("You don't have permission to change this password"));
          setShowCredentialsModal(true);
          return;
        }
      }
      toast.success(t("Credentials updated successfully"));
      setShowCredentialsModal(false);
      onSuccess();
    } catch (error: any) {
      toast.error(handleError(error));
    }
  };

  const openCredentialsModal = () => {
    resetCredentials({
      password: "",
      confirm_password: "",
    });
    setShowCredentialsModal(true);
  };

  return (
    <>
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
            htmlFor='name_ar'
            label='Name'
            required
            error={errors.name_ar?.message}
          >
            <Input id='name_ar' {...register("name_ar")} />
          </FormField>
          <FormField
            htmlFor='full_name'
            label='Name Second Language'
            required
            error={errors.full_name?.message}
          >
            <Input id='full_name' {...register("full_name")} />
          </FormField>
        </Grid>
        <Grid columns={2}>
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
          <FormField
            htmlFor='hire_date'
            label='Hire Date'
            error={errors.hire_date?.message}
            required
          >
            <Input
              id='hire_date'
              type='datetime-local'
              {...register("hire_date")}
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
            <div className='relative'>
              <Input
                required={false}
                id='password'
                type={showPassword ? "text" : "password"}
                {...register("password")}
                disabled={isEditing}
                className={`${currentLang === "ar" ? "pl-10" : "pr-10"}`}
              />
              <button
                type='button'
                className={`absolute inset-y-0 cursor-pointer ${
                  currentLang == "ar" ? "left-0 pl-3" : "right-0 pr-3"
                } flex items-center text-gray-500 hover:text-gray-700 focus:outline-none`}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <BsEyeSlash /> : <BsEye />}
              </button>
            </div>
          </FormField>
          <FormField
            htmlFor='confirm_password'
            label='Confirm Password'
            required
            error={errors.confirm_password?.message}
          >
            <div className='relative'>
              <Input
                required={false}
                id='confirm_password'
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirm_password")}
                disabled={isEditing}
                className={`${currentLang === "ar" ? "pl-10" : "pr-10"}`}
              />
              <button
                type='button'
                className={`absolute inset-y-0 cursor-pointer ${
                  currentLang == "ar" ? "left-0 pl-3" : "right-0 pr-3"
                } flex items-center text-gray-500 hover:text-gray-700 focus:outline-none`}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showPassword ? <BsEyeSlash /> : <BsEye />}
              </button>
            </div>
          </FormField>
        </Grid>
        <Grid columns={2}>
          <FormField
            htmlFor='salary'
            label='Salary'
            error={errors.salary?.message}
          >
            <Input
              id='salary'
              type='number'
              {...register("salary")}
              step='any'
            />
          </FormField>
          <FormField
            htmlFor='phone'
            label='Phone'
            error={errors.phone?.message}
          >
            <Input id='phone' {...register("phone")} />
          </FormField>
        </Grid>
        <Grid columns={2}>
          <FormField
            htmlFor='address_ar'
            label='Address'
            error={errors.address_ar?.message}
          >
            <TextArea id='address_ar' {...register("address_ar")} rows={2} />
          </FormField>
          <FormField
            htmlFor='address'
            label='Address Second Language'
            error={errors.address?.message}
          >
            <TextArea id='address' {...register("address")} rows={2} />
          </FormField>
        </Grid>
        {editingEmployee && (
          <div className='mt-4'>
            <Button
              onClick={openCredentialsModal}
              variant='outline'
              className='w-full'
            >
              {t("Change Password")}
            </Button>
          </div>
        )}
      </Modal>

      {/* Credentials Change Modal */}
      <Modal
        isOpen={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
        onConfirm={handleSubmitCredentials(onCredentialsSubmit)}
        title={t("Change Password & Email")}
        maxWidth='max-w-md'
        isSubmitting={isCredentialsSubmitting}
        confirmText={t("Update")}
      >
        <div className='space-y-4'>
          <FormField
            htmlFor='credentials_password'
            label={t("New Password")}
            required
            error={credentialsErrors.password?.message}
          >
            <Input
              id='credentials_password'
              type='password'
              {...registerCredentials("password")}
              placeholder={t("Enter new password")}
            />
          </FormField>
          <FormField
            htmlFor='credentials_confirm_password'
            label={t("Confirm New Password")}
            required
            error={credentialsErrors.confirm_password?.message}
          >
            <Input
              id='credentials_confirm_password'
              type='password'
              {...registerCredentials("confirm_password")}
              placeholder={t("Enter new password")}
            />
          </FormField>
        </div>
      </Modal>
    </>
  );
}
