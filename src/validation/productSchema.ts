import * as yup from "yup";
import { StockStatus, type IProductValidation } from "../types";

export const productSchema: yup.ObjectSchema<IProductValidation> = yup.object({
  title: yup.string().required("Title is required"),
  price: yup.number().required("Price is required").min(0, "Price must be a positive number"),
  description: yup.string().required("Description is required"),
  category_id: yup.string().required("Category ID is required"),
  slug: yup.string().required("Slug is required"),
  sku: yup.string().required("SKU is required"),
  stock_status: yup.string()
    .oneOf([StockStatus.IN_STOCK, StockStatus.OUT_OF_STOCK, StockStatus.LOW_STOCK], "Invalid stock status")
    .required("Stock status is required"),
  available_quantity: yup.number().required("Available quantity is required").min(0, "Available quantity must be a positive number"),
  images: yup.array().of(yup.string().url().required()).ensure().required().default([]),
  colors: yup.array().of(yup.string().required()).ensure().required().default([]),
  sizes: yup.array().of(yup.string().required()).ensure().required().default([]),
});