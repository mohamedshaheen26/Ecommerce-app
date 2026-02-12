import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdSearch } from "react-icons/md";
import { useSearchParams } from "react-router-dom";
import { fetchAllCategories } from "../../api/categories";
import { fetchProducts } from "../../api/product";
import ProductCard from "../../components/ProductCard";
import Button from "../../components/common/Button";
import Newsletter from "../../components/Newsletter";
import { useLanguage } from "../../context/LanguageContext";
import type { ICategory } from "../../types";
import type { IProduct } from "../../types";

const PAGE_SIZE = 12;

export default function ProductsPage() {
  const { t } = useTranslation();
  const { currentLang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<ICategory[]>([]);

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const searchQuery = searchParams.get("q") || "";
  const categoryId = searchParams.get("category") || "";

  const [searchInput, setSearchInput] = useState(searchQuery);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, count } = await fetchProducts(
        page,
        PAGE_SIZE,
        searchQuery,
        categoryId || undefined,
      );
      setProducts(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, categoryId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const { data } = await fetchAllCategories(1, 200, "");
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    next.set("q", searchInput.trim());
    next.set("page", "1");
    setSearchParams(next);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const next = new URLSearchParams(searchParams);
    if (value) next.set("category", value);
    else next.delete("category");
    next.set("page", "1");
    setSearchParams(next);
  };

  const setPage = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(newPage));
    setSearchParams(next);
  };

  return (
    <>
      <div className='max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12'>
        <div className='mb-8'>
          <h1 className='text-2xl sm:text-3xl font-bold text-[var(--text-secondary)]'>
            {t("Products")}
          </h1>
          <p className='mt-1 text-[var(--text-muted)]'>
            {t("Browse our full collection")}
          </p>
        </div>

        <div className='flex flex-col sm:flex-row gap-4 mb-8'>
          <form
            onSubmit={handleSearchSubmit}
            className='flex-1 flex gap-2 max-w-md'
          >
            <div className='relative flex-1'>
              <MdSearch
                className='absolute top-1/2 -translate-y-1/2 text-[var(--text-muted)]'
                size={20}
                style={currentLang === "ar" ? { right: 12 } : { left: 12 }}
              />
              <input
                type='search'
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t("Search products...")}
                className='w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-secondary)] py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]'
                style={
                  currentLang === "ar"
                    ? { paddingLeft: "1rem", paddingRight: "2.5rem" }
                    : { paddingLeft: "2.5rem", paddingRight: "1rem" }
                }
              />
            </div>
            <Button type='submit' variant='secondary' className='shrink-0'>
              {t("Search")}
            </Button>
          </form>
          <div className='flex items-center gap-2'>
            <label
              htmlFor='category-filter'
              className='text-sm font-medium text-[var(--text-muted)] whitespace-nowrap'
            >
              {t("Category")}:
            </label>
            <select
              id='category-filter'
              value={categoryId}
              onChange={handleCategoryChange}
              className='rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-secondary)] px-3 py-2.5 min-w-[160px] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]'
            >
              <option value=''>{t("All categories")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {currentLang === "ar" ? cat.name_ar : cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {Array.from({ length: PAGE_SIZE }, (_, i) => (
              <ProductCard key={i} Loading />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className='text-center py-16 bg-[var(--bg-secondary)] rounded-xl'>
            <p className='text-[var(--text-muted)] text-lg'>
              {searchQuery || categoryId
                ? t("No products match your filters.")
                : t("No products yet.")}
            </p>
            <Button
              variant='outline'
              className='mt-4'
              onClick={() => {
                setSearchParams({});
                setSearchInput("");
              }}
            >
              {t("Clear filters")}
            </Button>
          </div>
        ) : (
          <>
            <p className='text-sm text-[var(--text-muted)] mb-4'>
              {t("Showing")} {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, totalCount)} {t("of")} {totalCount}{" "}
              {t("products")}
            </p>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {products.map((product) => (
                <ProductCard key={product.id} Product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className='flex items-center justify-center gap-2 mt-10'>
                <Button
                  variant='outline'
                  onClick={() => setPage(page - 1)}
                  disabled={!hasPrev}
                >
                  {t("Previous")}
                </Button>
                <span className='px-4 text-[var(--text-muted)] text-sm'>
                  {t("Page")} {page} {t("of")} {totalPages}
                </span>
                <Button
                  variant='outline'
                  onClick={() => setPage(page + 1)}
                  disabled={!hasNext}
                >
                  {t("Next")}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      <Newsletter />
    </>
  );
}
