import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchBestSellingProducts } from "../../api/product";
import Carousel from "../../components/Carousel";
import ProductCard from "../../components/ProductCard";
import type { IProduct } from "../../types";

const BestSelling = () => {
  const { t } = useTranslation();
  const [bestSellingProducts, setBestSellingProducts] = useState<IProduct[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBestSelling = async () => {
      try {
        setLoading(true);
        const data = await fetchBestSellingProducts();
        setBestSellingProducts(data);
      } catch (error) {
        console.error("Error fetching best selling products:", error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSelling();
  }, []);

  return (
    <div className='features py-24 bg-[var(--bg-primary)] text-center'>
      <span className='text-sm text-[var(--text-muted)]'>{t("Show Now")}</span>
      <h3 className='text-xl font-bold mb-16 text-[var(--text-secondary)]'>
        {t("Best Selling")}
      </h3>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <Carousel>
          {bestSellingProducts?.map((product: IProduct) => (
            <ProductCard key={product.id} Product={product} />
          ))}
          {(loading ? Array(4).fill(0) : bestSellingProducts)?.map(
            (product, i) => (
              <ProductCard
                key={product?.id || i}
                Product={product}
                Loading={loading}
              />
            )
          )}
        </Carousel>
      </div>
    </div>
  );
};

export default BestSelling;
