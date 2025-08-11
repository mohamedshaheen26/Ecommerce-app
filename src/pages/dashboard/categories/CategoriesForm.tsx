import { useEffect } from "react";
import toast from "react-hot-toast";

import type { ICategory, ICategoryValidation } from "../../../types";

import { createCategory, updateCategory } from "../../../api/categories";

import FormField from "../../../components/common/FormField";
import Input from "../../../components/common/Input";
import TextArea from "../../../components/common/TextArea";
import Modal from "../../../components/common/Modal";

import { useYupForm } from "../../../hooks/useYupForm";
import { categorySchema } from "../../../validation/categorySchema";

interface CategoriesFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCategory: ICategory | null;
}

export default function CategoriesForm({
  isOpen,
  onClose,
  onSuccess,
  editingCategory,
}: CategoriesFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useYupForm<ICategoryValidation>(categorySchema, {
    name: editingCategory?.name ?? "",
    description: editingCategory?.description ?? "",
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: editingCategory?.name ?? "",
        description: editingCategory?.description ?? "",
      });
    }
  }, [isOpen, editingCategory, reset]);

  const onSubmit = async (data: ICategoryValidation) => {
    try {
      if (editingCategory && editingCategory?.id) {
        await updateCategory(editingCategory.id, data);
        toast.success("Category updated successfully");
      } else {
        await createCategory(data);
        toast.success("Category created successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        `Failed to save category: ${
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
      title={editingCategory ? "Edit Category" : "Add New Category"}
      maxWidth='max-w-md'
      isSubmitting={isSubmitting}
      confirmText={editingCategory ? "Update" : "Create"}
    >
      <FormField
        htmlFor='name'
        label='Name'
        required
        error={errors.name?.message}
      >
        <Input id='name' {...register("name")} />
      </FormField>
      <FormField
        htmlFor='description'
        label='Description'
        required
        error={errors.description?.message}
      >
        <TextArea id='description' {...register("description")} />
      </FormField>
    </Modal>
  );
}
