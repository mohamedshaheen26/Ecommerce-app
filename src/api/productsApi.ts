import axios from "axios";
import type { IProduct } from "../features/products/types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const axiosInstance = axios.create({
  baseURL: `${supabaseUrl}/rest/v1`,
  headers: {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  },
});

export async function fetchProducts(): Promise<IProduct[]> {
  const response = await axiosInstance.get<IProduct[]>("/products", {
    params: {
      order: "created_at.desc",
      select: "*",
    },
  });
  return response.data;
}

export async function createProduct(product: Omit<IProduct, "id" | "created_at">): Promise<IProduct> {
  const response = await axiosInstance.post<IProduct[]>("/products", product);
  return response.data[0];
}

export async function updateProduct(id: number, product: Partial<IProduct>): Promise<IProduct> {
  const response = await axiosInstance.patch<IProduct[]>(`/products?id=eq.${id}`, product);
  return response.data[0];
}

export async function deleteProduct(id: number): Promise<void> {
  await axiosInstance.delete(`/products?id=eq.${id}`);
}
