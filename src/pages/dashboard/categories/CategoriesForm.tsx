import { useEffect } from "react";
import toast from "react-hot-toast";

import type { ICategory, ICategoryValidation } from "../../../types";

import { createCategory, updateCategory } from "../../../api/categories";

import FormField from "../../../components/common/FormField";
import Input from "../../../components/common/Input";
import TextArea from "../../../components/common/TextArea";
import Modal from "../../../components/common/Modal";

import { useYupForm } from "../../../hooks/useYupForm";
import { getCategorySchema } from "../../../validation/categorySchema";
import Grid from "../../../components/common/Grid";
import { useTranslation } from "react-i18next";
import { handleError } from "../../../utils/errorHandler";

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
  } = useYupForm<ICategoryValidation>(getCategorySchema() as any, {
    name: editingCategory?.name ?? "",
    name_ar: editingCategory?.name_ar ?? "",
    description: editingCategory?.description ?? "",
    description_ar: editingCategory?.description_ar ?? "",
  });
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      reset({
        name: editingCategory?.name ?? "",
        name_ar: editingCategory?.name_ar ?? "",
        description: editingCategory?.description ?? "",
        description_ar: editingCategory?.description_ar ?? "",
      });
    }
  }, [editingCategory, isOpen, reset]);

  const onSubmit = async (data: ICategoryValidation) => {
    try {
      if (editingCategory && editingCategory?.id) {
        await updateCategory(editingCategory.id, data);
        toast.success(t("Category updated successfully"));
      } else {
        await createCategory(data);
        toast.success(t("Category created successfully"));
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(handleError(error));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleSubmit(onSubmit)}
      title={editingCategory ? "Edit Category" : "Add New Category"}
      maxWidth='max-w-xl'
      isSubmitting={isSubmitting}
      confirmText={editingCategory ? "Update" : "Create"}
    >
      <Grid columns={{ default: 1, md: 2 }}>
        <FormField
          htmlFor='name_ar'
          label='Name'
          required
          error={errors.name_ar?.message}
        >
          <Input id='name_ar' {...register("name_ar")} />
        </FormField>
        <FormField
          htmlFor='name'
          label='Name Second Language'
          required
          error={errors.name?.message}
        >
          <Input id='name' {...register("name")} />
        </FormField>
      </Grid>
      <Grid columns={{ default: 1, md: 2 }}>
        <FormField
          htmlFor='description_ar'
          label='Description'
          required
          error={errors.description_ar?.message}
        >
          <TextArea id='description_ar' {...register("description_ar")} />
        </FormField>
        <FormField
          htmlFor='description'
          label='Description Second Language'
          required
          error={errors.description?.message}
        >
          <TextArea id='description' {...register("description")} />
        </FormField>
      </Grid>
    </Modal>
  );
}
