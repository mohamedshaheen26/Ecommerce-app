import * as yup from "yup";
import { StockStatus, type IProductValidation } from "../types";

export const productSchema: yup.ObjectSchema<IProductValidation> = yup.object({
  title: yup.string().required("Title is required"),
  price: yup.number().required("Price is required").min(0, "Price must be a positive number"),
  description: yup.string().default("").defined(),
  category_id: yup.string().required("Category is required"),
  stock_status: yup
    .mixed<StockStatus>()
    .oneOf([StockStatus.IN_STOCK, StockStatus.OUT_OF_STOCK, StockStatus.LOW_STOCK], "Stock Status required")
    .required("Stock Status required"),
  available_quantity: yup.number().required("Available quantity is required").min(0, "Available quantity must be a positive number"),
  images: yup.array().of(yup.string().url().required()).ensure().required().default([]),
  colors: yup.array().of(yup.string().required()).ensure().required().default([]),
  sizes: yup.array().of(yup.string().required()).ensure().required().default([]),
});