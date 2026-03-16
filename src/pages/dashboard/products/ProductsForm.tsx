import { useEffect, useState } from "react";
import {
  createProduct,
  updateProduct,
  uploadImages,
} from "../../../api/product";

import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import FormField from "../../../components/common/FormField";
import Grid from "../../../components/common/Grid";
import Input from "../../../components/common/Input";
import Modal from "../../../components/common/Modal";
import Select from "../../../components/common/Select";
import TextArea from "../../../components/common/TextArea";
import { useLanguage } from "../../../context/LanguageContext";
import { useYupForm } from "../../../hooks/useYupForm";
import {
  type ICategory,
  type IProduct,
  type IProductFormValues,
  type IProductValidation,
} from "../../../types";
import { handleError } from "../../../utils/errorHandler";
import { slugify } from "../../../utils/slugify";
import { getProductSchema } from "../../../validation/productSchema";
import ColorsSelector from "./components/ColorsSelector";
import ImagePreview from "./components/ImagePreview";
import SizesSelector from "./components/SizesSelector";

const INITIAL_FORM_VALUES: IProductFormValues = {
  title: "",
  name_ar: "",
  slug: "",
  price: 0,
  description: "",
  description_ar: "",
  category_id: "",
  stock_status: "",
  available_quantity: 0,
  colors: [],
  sizes: [],
  images: [],
};

interface AddEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: ICategory[];
  editingProduct?: IProduct | null;
  defaultCategoryId?: string;
}

export default function ProductsForm({
  isOpen,
  onClose,
  onSuccess,
  categories,
  editingProduct,
  defaultCategoryId,
}: AddEditProductModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useYupForm<IProductValidation>(getProductSchema() as any, {
    title: editingProduct?.title ?? "",
    name_ar: editingProduct?.name_ar ?? "",
    price: editingProduct?.price ?? 0,
    slug: editingProduct?.slug ?? "",
    description: editingProduct?.description ?? "",
    description_ar: editingProduct?.description_ar ?? "",
    category_id: editingProduct?.category_id ?? defaultCategoryId ?? "",
    stock_status: editingProduct?.stock_status ?? "",
    available_quantity: editingProduct?.available_quantity ?? 0,
    images: editingProduct?.images ?? [],
    colors: editingProduct?.colors ?? [],
    sizes: editingProduct?.sizes ?? [],
  });
  const [newImages, setNewImages] = useState<File[]>([]);
  const colors = (watch("colors") ?? []) as string[];
  const sizes = (watch("sizes") ?? []) as string[];
  const images = (watch("images") ?? []) as string[];
  const { currentLang } = useLanguage();
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      reset({
        title: editingProduct?.title ?? "",
        name_ar: editingProduct?.name_ar ?? "",
        price: editingProduct?.price ?? 0,
        slug: editingProduct?.slug ?? "",
        description: editingProduct?.description ?? "",
        description_ar: editingProduct?.description_ar ?? "",
        category_id: editingProduct?.category_id ?? defaultCategoryId ?? "",
        stock_status: editingProduct?.stock_status ?? "",
        available_quantity: editingProduct?.available_quantity ?? 0,
        colors: editingProduct?.colors ?? [],
        sizes: editingProduct?.sizes ?? [],
        images: editingProduct?.images ?? [],
      });

      // Clear any staged new images when opening
      setNewImages([]);
    }
  }, [isOpen, editingProduct, reset]);

  const handleImageUpload = (files: FileList) => {
    setNewImages((prev) => [...prev, ...Array.from(files)]);
  };

  const removeImage = (type: "old" | "new", index: number) => {
    if (type === "old") {
      const current = (getValues("images") ?? []) as string[];
      const next = current.filter((_, i) => i !== index);
      setValue("images", next, { shouldDirty: true, shouldValidate: true });
    } else {
      setNewImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const toggleColor = (color: string) => {
    const next = colors.includes(color)
      ? colors.filter((c) => c !== color)
      : [...colors, color];
    setValue("colors", next, { shouldDirty: true, shouldValidate: true });
  };

  const toggleSize = (size: string) => {
    const next = sizes.includes(size)
      ? sizes.filter((s) => s !== size)
      : [...sizes, size];
    setValue("sizes", next, { shouldDirty: true, shouldValidate: true });
  };

  const titleRegister = register("title");
  const onTitleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    titleRegister.onBlur(e);
    const title = getValues("title");
    if (title) {
      setValue("slug", slugify(title), { shouldValidate: true });
    }
  };

  const onSubmit = async (data: IProductValidation) => {
    try {
      debugger;
      let uploadedUrls: string[] = [];
      if (newImages.length > 0) {
        uploadedUrls = await uploadImages(newImages);
      }

      const allImages = [
        ...((getValues("images") ?? []) as string[]),
        ...uploadedUrls,
      ];

      const productData = {
        ...data,
        description: data.description,
        colors: data.colors,
        sizes: data.sizes,
        images: allImages,
        slug: slugify(data.title),
      };

      if (editingProduct && editingProduct.id) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await createProduct(productData);
      }

      reset(INITIAL_FORM_VALUES);
      setNewImages([]);
      onClose();
      onSuccess();
      toast.success(
        editingProduct
          ? t("Product updated successfully")
          : t("Product created successfully"),
      );
    } catch (error: any) {
      toast.error(handleError(error));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleSubmit(onSubmit)}
      title={editingProduct ? "Edit Product" : "Add New Product"}
      maxWidth='max-w-4xl'
      isSubmitting={isSubmitting}
      confirmText={editingProduct ? "Update" : "Create"}
    >
      <Grid columns={{ default: 1, md: 2 }}>
        <FormField
          htmlFor='name_ar'
          label='Name'
          error={errors.name_ar?.message}
          required
        >
          <Input id='name_ar' {...register("name_ar")} />
        </FormField>
        <FormField
          htmlFor='title'
          label='Name Second Language'
          error={errors.title?.message}
          required
        >
          <Input id='title' {...titleRegister} onBlur={onTitleBlur} />
        </FormField>
      </Grid>
      <Grid columns={{ default: 1, md: 2 }}>
        <FormField
          htmlFor='stock_status'
          label='Stock Status'
          error={errors.stock_status?.message}
          required
        >
          <Select
            id='stock_status'
            {...register("stock_status")}
            options={[
              { value: "", label: "Select a Status" },
              { value: "in_stock", label: "Stock Statuses.in_stock" },
              { value: "low_stock", label: "Stock Statuses.low_stock" },
              { value: "out_of_stock", label: "Stock Statuses.out_of_stock" },
            ]}
          />
        </FormField>
        <FormField
          htmlFor='available_quantity'
          label='Available Quantity'
          error={errors.available_quantity?.message}
          required
        >
          <Input
            id='available_quantity'
            type='number'
            {...register("available_quantity")}
            min='0'
          />
        </FormField>
      </Grid>
      <Grid columns={{ default: 1, md: 2 }}>
        <FormField
          htmlFor='slug'
          label='Slug'
          error={errors.slug?.message}
          required
        >
          <Input id='slug' {...register("slug")} disabled />
        </FormField>
        <FormField
          htmlFor='price'
          label='Price'
          error={errors.price?.message}
          required
        >
          <Input
            id='price'
            {...register("price")}
            min='0'
            type='number'
            step='any'
          />
        </FormField>
      </Grid>
      <Grid columns={{ default: 1, md: 2 }}>
        <FormField
          htmlFor='category'
          label='Category'
          error={errors.category_id?.message}
          required
        >
          <Select
            id='category'
            {...register("category_id")}
            options={[
              { value: "", label: "Select a category" },
              ...categories.map((category) => ({
                value: category.id ? category.id : "",
                label: currentLang === "en" ? category.name : category.name_ar,
              })),
            ]}
          />
        </FormField>
        <FormField htmlFor='colors' label='Colors'>
          <ColorsSelector selectedColors={colors} toggleColor={toggleColor} />
        </FormField>
      </Grid>
      <Grid columns={{ default: 1, md: 2 }}>
        <Grid columns={1}>
          <FormField
            htmlFor='description_ar'
            label='Description'
            error={errors.description?.message}
          >
            <TextArea id='description' rows={3} {...register("description")} />
          </FormField>
          <FormField
            htmlFor='description'
            label='Description Second Language'
            error={errors.description?.message}
          >
            <TextArea id='description' rows={3} {...register("description")} />
          </FormField>
        </Grid>
        <Grid columns={1}>
          <FormField htmlFor='sizes' label='Sizes'>
            <SizesSelector selectedSizes={sizes} toggleSize={toggleSize} />
          </FormField>
          <FormField htmlFor='images' label='Images'>
            <div className='flex items-center space-x-4'>
              <label className='cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50'>
                Choose Files
                <input
                  id='images'
                  type='file'
                  className='hidden'
                  multiple
                  accept='image/*'
                  onChange={(e) =>
                    e.target.files && handleImageUpload(e.target.files)
                  }
                />
              </label>
              <span className='text-sm text-gray-500'>
                {!editingProduct
                  ? `${newImages.length} images selected`
                  : `${images?.length} images selected`}
              </span>
            </div>
            <div className='mt-4'>
              <Grid columns={4} gap={4}>
                {images.map((url, index) => (
                  <ImagePreview
                    key={`old-${index}`}
                    src={url}
                    onRemove={() => removeImage("old", index)}
                  />
                ))}

                {newImages.map((file, index) => (
                  <ImagePreview
                    key={`new-${index}`}
                    src={URL.createObjectURL(file)}
                    onRemove={() => removeImage("new", index)}
                  />
                ))}
              </Grid>
            </div>
          </FormField>
        </Grid>
      </Grid>
    </Modal>
  );
}
