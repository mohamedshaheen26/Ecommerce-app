import React, { useState } from "react";
import { createProduct } from "../../../api/productsApi";
import type { IProduct } from "../types";

interface Props {
  onCreate: (product: IProduct) => void;
}

export function ProductForm({ onCreate }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || !price) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const newProduct = await createProduct({
        name,
        description,
        price: Number(price),
        image_url: imageUrl || undefined,
      });

      onCreate(newProduct);

      // Reset form
      setName("");
      setDescription("");
      setPrice("");
      setImageUrl("");
    } catch (error) {
      alert("Error creating product");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <h2>Create New Product</h2>

      <div>
        <label>Name *</label>
        <input
          type='text'
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 8 }}
        />
      </div>

      <div>
        <label>Description *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 8 }}
        />
      </div>

      <div>
        <label>Price *</label>
        <input
          type='number'
          value={price}
          onChange={(e) =>
            setPrice(e.target.value === "" ? "" : Number(e.target.value))
          }
          required
          min={0}
          step='0.01'
          style={{ width: "100%", marginBottom: 8 }}
        />
      </div>

      <div>
        <label>Image URL</label>
        <input
          type='url'
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />
      </div>

      <button type='submit'>Create Product</button>
    </form>
  );
}
