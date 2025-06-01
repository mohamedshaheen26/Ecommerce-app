import React, { useState } from "react";
import { useProducts } from "../features/products/hooks/useProducts";
import { ProductList } from "../features/products/components/ProductList";
import { ProductForm } from "../features/products/components/ProductForm";
import type { IProduct } from "../features/products/types";

export default function HomePage() {
  const { products: initialProducts, loading, error } = useProducts();
  const [products, setProducts] = useState<IProduct[]>(initialProducts);

  React.useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const handleCreate = (newProduct: IProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto" }}>
      <h1>Products</h1>

      <ProductForm onCreate={handleCreate} />

      <ProductList products={products} />
    </div>
  );
}
