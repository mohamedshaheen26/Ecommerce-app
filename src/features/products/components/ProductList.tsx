import type { IProduct } from "../types";

interface Props {
  products: IProduct[];
}

export function ProductList({ products }: Props) {
  if (!products.length) return <p>No products found.</p>;

  return (
    <>
      {products.map((p) => (
        <div
          key={p.id}
          style={{ border: "1px solid #ddd", padding: 16, marginBottom: 16 }}
        >
          <h2>{p.name}</h2>
          <p>{p.description}</p>
          <p>${p.price}</p>
          {p.image_url && (
            <img src={p.image_url} alt={p.name} style={{ maxWidth: "100%" }} />
          )}
        </div>
      ))}
    </>
  );
}
