import { useEffect } from "react";
import toast from "react-hot-toast";

import type { ICategory, ICategoryValidation } from "../../../types";

import { createCategory, updateCategory } from "../../../api/categories";

import { useTranslation } from "react-i18next";
import FormField from "../../../components/common/FormField";
import Grid from "../../../components/common/Grid";
import Input from "../../../components/common/Input";
import Modal from "../../../components/common/Modal";
import TextArea from "../../../components/common/TextArea";
import { useYupForm } from "../../../hooks/useYupForm";
import { handleError } from "../../../utils/errorHandler";
import { slugify } from "../../../utils/slugify";
import { getCategorySchema } from "../../../validation/categorySchema";

interface CategoriesFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCategory: ICategory | null;
  defaultParentId?: string;
}

export default function CategoriesForm({
  isOpen,
  onClose,
  onSuccess,
  editingCategory,
  defaultParentId,
}: CategoriesFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useYupForm<ICategoryValidation>(getCategorySchema() as any, {
    name: editingCategory?.name ?? "",
    name_ar: editingCategory?.name_ar ?? "",
    slug: editingCategory?.slug ?? "",
    description: editingCategory?.description ?? "",
    description_ar: editingCategory?.description_ar ?? "",
    parent_id: editingCategory?.parent_id ?? defaultParentId ?? null,
  });

  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      reset({
        name: editingCategory?.name ?? "",
        name_ar: editingCategory?.name_ar ?? "",
        slug: editingCategory?.slug ?? "",
        description: editingCategory?.description ?? "",
        description_ar: editingCategory?.description_ar ?? "",
        parent_id: editingCategory?.parent_id ?? defaultParentId ?? null,
        path: editingCategory?.path ?? "",
        path_ar: editingCategory?.path_ar ?? "",
      });
    }
  }, [defaultParentId, editingCategory, isOpen, reset]);

  const nameRegister = register("name");
  const onNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    nameRegister.onBlur(e);
    const name = getValues("name");
    if (name) {
      setValue("slug", slugify(name), { shouldValidate: true });
    }
  };

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
          <Input id='name' {...nameRegister} onBlur={onNameBlur} />
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
        <FormField
          htmlFor='path'
          label='Path'
          required
          error={errors.path?.message}
        >
          <Input id='path' {...register("path")} disabled readOnly />
        </FormField>
        <FormField
          htmlFor='path_ar'
          label='Path Second Language'
          required
          error={errors.path_ar?.message}
        >
          <Input id='path_ar' {...register("path_ar")} disabled readOnly />
        </FormField>
      </Grid>
    </Modal>
  );
}
