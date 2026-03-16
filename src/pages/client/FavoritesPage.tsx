import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Newsletter from "../../components/Newsletter";
import ProductCard from "../../components/ProductCard";
import { useFavorites } from "../../context/FavoritesContext";

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { favorites, clearFavorites } = useFavorites();

  return (
    <>
      <div className='max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8'>
        <div className='flex items-center justify-between mb-7 pb-4 border-b border-[var(--border-color)]'>
          <h1 className='text-xl sm:text-2xl font-semibold text-[var(--text-secondary)]'>
            {t("Your Favorites")}
          </h1>
          {favorites.length > 0 && (
            <button
              type='button'
              onClick={clearFavorites}
              className='text-xs underline text-[var(--text-muted)] hover:text-[var(--error)] cursor-pointer'
            >
              {t("Clear All")}
            </button>
          )}
        </div>

        {favorites.length === 0 ? (
          <div className='text-center py-16'>
            <p className='text-[var(--text-secondary)] mb-2'>
              {t("No favorites yet")}
            </p>
            <button
              type='button'
              onClick={() => navigate("/products")}
              className='mt-2 px-4 py-2 rounded bg-[var(--accent-primary)] text-[var(--text-primary)] hover:bg-[var(--accent-hover)] transition cursor-pointer'
            >
              {t("Browse Products")}
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-12'>
            {favorites.map((product) => (
              <ProductCard
                key={product.id}
                Product={product}
                className='!mx-0'
              />
            ))}
          </div>
        )}
      </div>
      <Newsletter />
    </>
  );
}
