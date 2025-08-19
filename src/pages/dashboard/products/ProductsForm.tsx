import { useState, useEffect } from "react";
import {
  uploadImages,
  createProduct,
  updateProduct,
} from "../../../api/product";

import toast from "react-hot-toast";
import {
  type ICategory,
  type IProduct,
  type IProductFormValues,
  type IProductValidation,
} from "../../../types";
import Modal from "../../../components/common/Modal";
import Grid from "../../../components/common/Grid";
import FormField from "../../../components/common/FormField";
import Input from "../../../components/common/Input";
import Select from "../../../components/common/Select";
import TextArea from "../../../components/common/TextArea";
import ImagePreview from "./components/ImagePreview";
import SizesSelector from "./components/SizesSelector";
import ColorsSelector from "./components/ColorsSelector";
import { useYupForm } from "../../../hooks/useYupForm";
import { productSchema } from "../../../validation/productSchema";

const INITIAL_FORM_VALUES: IProductFormValues = {
  title: "",
  price: 0,
  description: "",
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
}

export default function ProductsForm({
  isOpen,
  onClose,
  onSuccess,
  categories,
  editingProduct,
}: AddEditProductModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useYupForm<IProductValidation>(productSchema, {
    title: editingProduct?.title ?? "",
    price: editingProduct?.price ?? 0,
    description: editingProduct?.description ?? "",
    category_id: editingProduct?.category_id ?? "",
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

  useEffect(() => {
    if (isOpen) {
      reset({
        title: editingProduct?.title ?? "",
        price: editingProduct?.price ?? 0,
        description: editingProduct?.description ?? "",
        category_id: editingProduct?.category_id ?? "",
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

  const onSubmit = async (data: IProductValidation) => {
    try {
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
        // Use RHF values
        description: data.description,
        colors: data.colors,
        sizes: data.sizes,
        images: allImages,
      };

      if (editingProduct) {
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
          ? "Product updated successfully"
          : "Product created successfully"
      );
    } catch (error) {
      toast.error("Failed to save product");
      console.error(error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleSubmit(onSubmit)}
      title={editingProduct ? "Edit Product" : "Add Product"}
      maxWidth='max-w-4xl'
      isSubmitting={isSubmitting}
      confirmText={editingProduct ? "Update" : "Create"}
    >
      <Grid columns={2}>
        <FormField
          htmlFor='title'
          label='Title'
          error={errors.title?.message}
          required
        >
          <Input id='title' {...register("title")} />
        </FormField>
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
              { value: "in_stock", label: "In Stock" },
              { value: "low_stock", label: "Low Stock" },
              { value: "out_of_stock", label: "Out of Stock" },
            ]}
          />
        </FormField>
      </Grid>
      <Grid columns={2}>
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
      <Grid columns={2}>
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
                label: category.name,
              })),
            ]}
          />
        </FormField>
        <FormField htmlFor='colors' label='Colors'>
          <ColorsSelector selectedColors={colors} toggleColor={toggleColor} />
        </FormField>
      </Grid>
      <Grid columns={2}>
        <FormField
          htmlFor='description'
          label='Description'
          error={errors.description?.message}
        >
          <TextArea id='description' {...register("description")} />
        </FormField>
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
