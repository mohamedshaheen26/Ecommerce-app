import { Checkbox, FormControlLabel, Slider } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BsChevronDown } from "react-icons/bs";
import {
  MdClose,
  MdOutlineArrowBackIos,
  MdOutlineArrowForwardIos,
  MdTune,
} from "react-icons/md";
import { useSearchParams } from "react-router-dom";
import { fetchAllCategories } from "../../api/categories";
import { fetchProducts, type ProductFilters } from "../../api/product";
import Newsletter from "../../components/Newsletter";
import ProductCard from "../../components/ProductCard";
import { useLanguage } from "../../context/LanguageContext";
import type { ICategory, IProduct } from "../../types";
import ColorsSelector from "../dashboard/products/components/ColorsSelector";
import SizesSelector from "../dashboard/products/components/SizesSelector";

const PAGE_SIZE = 12;
const PRICE_MIN_DEFAULT = 0;
const PRICE_MAX_DEFAULT = 1000;

type SortOption = "newest" | "price_asc" | "price_desc" | "name";

export default function ProductsListingPage() {
  const { t } = useTranslation();
  const { currentLang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    PRICE_MIN_DEFAULT,
    PRICE_MAX_DEFAULT,
  ]);
  const [priceSliderValue, setPriceSliderValue] = useState<[number, number]>([
    PRICE_MIN_DEFAULT,
    PRICE_MAX_DEFAULT,
  ]);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const searchQueryFromUrl = searchParams.get("q") ?? "";

  const filters: ProductFilters = useMemo(
    () => ({
      categoryIds:
        selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
      colors: selectedColors.length > 0 ? selectedColors : undefined,
      sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
      priceMin: priceRange[0] > PRICE_MIN_DEFAULT ? priceRange[0] : undefined,
      priceMax: priceRange[1] < PRICE_MAX_DEFAULT ? priceRange[1] : undefined,
      sortBy,
      searchQuery: searchQueryFromUrl.trim() || undefined,
    }),
    [
      selectedCategoryIds,
      selectedColors,
      selectedSizes,
      priceRange,
      sortBy,
      searchQueryFromUrl,
    ],
  );

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;
  const startItem = (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, totalCount);

  const loadCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const { data } = await fetchAllCategories(1, 50, "");
      setCategories(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, count } = await fetchProducts(page, PAGE_SIZE, filters);
      setProducts(data || []);
      setTotalCount(count || 0);
    } catch (e) {
      console.error(e);
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategoryIds([cat]);
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [searchQueryFromUrl]);

  useEffect(() => {
    if (!mobileFiltersOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileFiltersOpen]);

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
    setPage(1);
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
    setPage(1);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
    setPage(1);
  };

  const removeCategoryFilter = (id: string) => {
    setSelectedCategoryIds((prev) => prev.filter((c) => c !== id));
    setPage(1);
  };

  const removeColorFilter = (color: string) => {
    setSelectedColors((prev) => prev.filter((c) => c !== color));
    setPage(1);
  };

  const removeSizeFilter = (size: string) => {
    setSelectedSizes((prev) => prev.filter((s) => s !== size));
    setPage(1);
  };

  const clearPriceFilter = () => {
    setPriceRange([PRICE_MIN_DEFAULT, PRICE_MAX_DEFAULT]);
    setPriceSliderValue([PRICE_MIN_DEFAULT, PRICE_MAX_DEFAULT]);
    setPage(1);
  };

  const applyPriceFilter = () => {
    setPriceRange(priceSliderValue);
    setPage(1);
  };

  const getCategoryName = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    return currentLang === "ar" ? cat?.name_ar : cat?.name;
  };

  const clearSearchFilter = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("q");
      return next;
    });
    setPage(1);
  };

  const hasActiveFilters =
    selectedCategoryIds.length > 0 ||
    selectedColors.length > 0 ||
    selectedSizes.length > 0 ||
    priceRange[0] > PRICE_MIN_DEFAULT ||
    priceRange[1] < PRICE_MAX_DEFAULT ||
    searchQueryFromUrl.trim().length > 0;

  const sortOptions: { value: SortOption; labelKey: string }[] = [
    { value: "newest", labelKey: "Catalog.Newest" },
    { value: "price_asc", labelKey: "Price: Low to High" },
    { value: "price_desc", labelKey: "Price: High to Low" },
    { value: "name", labelKey: "Sort by Name" },
  ];

  const paginationNumbers = useMemo(() => {
    const result: (number | "...")[] = [];
    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) result.push(i);
      return result;
    }
    result.push(1);
    if (page > 3) result.push("...");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      if (!result.includes(i)) result.push(i);
    }
    if (page < totalPages - 2) result.push("...");
    result.push(totalPages);
    return result;
  }, [totalPages, page]);

  const goToPage = (nextPage: number) => {
    const clampedPage = Math.min(totalPages, Math.max(1, nextPage));
    if (clampedPage === page) return;

    setPage(clampedPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filtersContent = (
    <>
      {/* Categories */}
      <div>
        <h3 className='text-sm font-semibold text-[var(--text-secondary)] tracking-wide mb-5'>
          {t("Categories")}
        </h3>
        {categoriesLoading ? (
          <div className='space-y-2'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className='h-5 bg-[var(--bg-secondary)] rounded animate-pulse'
              />
            ))}
          </div>
        ) : (
          <ul className='space-y-2 pr-1'>
            {categories.map((cat) => (
              <li
                key={cat.id}
                className='border-b border-[var(--border-color)] pb-1'
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      sx={{
                        color: "var(--accent-light)",
                        "&.Mui-checked": {
                          color: "var(--accent-primary)",
                        },
                        "&.MuiCheckbox-indeterminate": {
                          color: "var(--accent-primary)",
                        },
                      }}
                      checked={selectedCategoryIds.includes(cat.id!)}
                      onChange={() => toggleCategory(cat.id!)}
                      id={`cat-${cat.id}`}
                    />
                  }
                  label={currentLang === "ar" ? cat.name_ar : cat.name}
                  sx={{
                    margin: 0,
                    width: "100%",
                    "& .MuiTypography-root": {
                      flex: 1,
                      width: "100%",
                    },
                    "& .MuiFormControlLabel-label": {
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "var(--text-secondary)",
                    },
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Color */}
      <div>
        <h3 className='text-sm font-semibold text-[var(--text-secondary)]  tracking-wide mb-5'>
          {t("Catalog.Colors")}
        </h3>
        <div className='flex flex-wrap gap-2'>
          <ColorsSelector
            selectedColors={selectedColors}
            toggleColor={toggleColor}
          />
        </div>
      </div>

      {/* Size */}
      <div>
        <h3 className='text-sm font-semibold text-[var(--text-secondary)]  tracking-wide mb-5'>
          {t("Catalog.Sizes")}
        </h3>
        <div className='flex flex-wrap gap-2'>
          <SizesSelector
            selectedSizes={selectedSizes}
            toggleSize={toggleSize}
          />
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className='text-sm font-semibold text-[var(--text-secondary)]  tracking-wide mb-5'>
          {t("Price")}
        </h3>
        <div className='space-y-3'>
          <Slider
            value={priceSliderValue}
            onChange={(_e, value) =>
              setPriceSliderValue(value as [number, number])
            }
            valueLabelDisplay='auto'
            valueLabelFormat={(v) => `$${v}`}
            min={PRICE_MIN_DEFAULT}
            max={PRICE_MAX_DEFAULT}
            sx={{
              color: "var(--text-primary)",
              "& .MuiSlider-thumb": {
                color: "var(--accent-primary)",
              },
              "& .MuiSlider-track": {
                color: "var(--accent-primary)",
              },
              "& .MuiSlider-rail": {
                color: "var(--text-secondary)",
              },
            }}
          />
          <button
            type='button'
            onClick={applyPriceFilter}
            className='inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-colors duration-200 cursor-pointer px-4 py-2 text-sm min-h-[40px] bg-[var(--accent-primary)] text-[var(--text-primary)] hover:bg-[var(--accent-hover)] w-full'
          >
            {t("Catalog.Apply")}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className='max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8'>
        {mobileFiltersOpen && (
          <div className='fixed inset-0 z-[999] lg:hidden'>
            <button
              type='button'
              aria-label='Close filters'
              onClick={() => setMobileFiltersOpen(false)}
              className='absolute inset-0 bg-black/40'
            />
            <aside
              className={`absolute top-0 h-full w-[86%] max-w-sm overflow-y-auto bg-[var(--bg-primary)] p-4 sm:p-5 shadow-xl space-y-6 ${
                currentLang === "ar"
                  ? "right-0 text-right rounded-l-md"
                  : "left-0 rounded-r-md"
              }`}
            >
              <div className='flex items-center justify-between'>
                <h2 className='text-base font-semibold text-[var(--text-secondary)]'>
                  {t("Filters")}
                </h2>
                <button
                  type='button'
                  aria-label='Close filters'
                  onClick={() => setMobileFiltersOpen(false)}
                  className='p-1 rounded hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                >
                  <MdClose className='w-5 h-5' />
                </button>
              </div>
              {filtersContent}
            </aside>
          </div>
        )}

        <div className='grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8 lg:gap-10'>
          {/* Sidebar filters */}
          <aside
            className={`hidden lg:block self-start shadow-md py-8 px-5 rounded-md space-y-8 ${currentLang === "ar" ? "text-right" : ""}`}
          >
            {filtersContent}
          </aside>

          {/* Main content */}
          <div className='min-w-0'>
            {/* Applied filters + count + sort */}
            <div className='flex flex-col gap-4 mb-6'>
              {hasActiveFilters && (
                <div className='flex flex-wrap items-center gap-4'>
                  <h3 className='text-sm font-semibold text-[var(--text-secondary)]  tracking-wide w-full'>
                    {t("Catalog.AppliedFilters")}:
                  </h3>
                  {searchQueryFromUrl.trim() && (
                    <span className='inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-color)] font-medium'>
                      {t("Catalog.Search")}: &quot;{searchQueryFromUrl.trim()}
                      &quot;
                      <button
                        type='button'
                        onClick={clearSearchFilter}
                        className='ml-1 hover:text-[var(--error)] cursor-pointer'
                        aria-label='Remove'
                      >
                        <MdClose className='w-4 h-4' />
                      </button>
                    </span>
                  )}
                  {selectedCategoryIds.map((id) => (
                    <span
                      key={id}
                      className='inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-color)] font-medium'
                    >
                      {getCategoryName(id)}
                      <button
                        type='button'
                        onClick={() => removeCategoryFilter(id)}
                        className='ml-1 hover:text-[var(--error)] cursor-pointer'
                        aria-label='Remove'
                      >
                        <MdClose className='w-4 h-4' />
                      </button>
                    </span>
                  ))}
                  {selectedColors.map((color) => (
                    <span
                      key={color}
                      className='inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-color)] font-medium'
                    >
                      {color}
                      <button
                        type='button'
                        onClick={() => removeColorFilter(color)}
                        className='ml-1 hover:text-[var(--error)] cursor-pointer'
                        aria-label='Remove'
                      >
                        <MdClose className='w-4 h-4' />
                      </button>
                    </span>
                  ))}
                  {selectedSizes.map((size) => (
                    <span
                      key={size}
                      className='inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-color)] font-medium'
                    >
                      {t("Catalog.Size")}: {size}
                      <button
                        type='button'
                        onClick={() => removeSizeFilter(size)}
                        className='ml-1 hover:text-[var(--error)] cursor-pointer'
                        aria-label='Remove'
                      >
                        <MdClose className='w-4 h-4' />
                      </button>
                    </span>
                  ))}
                  {(priceRange[0] > PRICE_MIN_DEFAULT ||
                    priceRange[1] < PRICE_MAX_DEFAULT) && (
                    <span className='inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-color)] font-medium'>
                      ${priceRange[0].toFixed(0)} - ${priceRange[1].toFixed(0)}
                      <button
                        type='button'
                        onClick={clearPriceFilter}
                        className='ml-1 hover:text-[var(--error)] cursor-pointer'
                        aria-label='Remove'
                      >
                        <MdClose className='w-4 h-4' />
                      </button>
                    </span>
                  )}
                </div>
              )}

              <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between items-end gap-3'>
                <p className='hidden lg:block text-sm text-[var(--text-muted)]'>
                  {t("Catalog.ShowingResults", {
                    start: totalCount === 0 ? 0 : startItem,
                    end: endItem,
                    total: totalCount,
                  })}
                </p>

                <div className='flex items-center gap-2'>
                  <button
                    type='button'
                    onClick={() => setMobileFiltersOpen(true)}
                    className='lg:hidden inline-flex items-center justify-center rounded bg-[var(--bg-primary)] text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] w-9 h-9'
                    aria-label={t("Filters")}
                  >
                    <MdTune className='w-4 h-4' />
                  </button>

                  <div className='relative'>
                    <button
                      type='button'
                      onClick={() => setSortDropdownOpen((o) => !o)}
                      className='flex items-center gap-2 px-4 py-2 rounded bg-[var(--bg-primary)] text-[var(--text-muted)] text-xs font-medium hover:border-[var(--text-muted)] tracking-widest'
                    >
                      {t("Catalog.SortBy")}
                      <BsChevronDown
                        className={`w-4 h-4 transition-transform ${sortDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {sortDropdownOpen && (
                      <>
                        <div
                          className='fixed inset-0 z-10'
                          aria-hidden
                          onClick={() => setSortDropdownOpen(false)}
                        />
                        <ul className='absolute top-full left-0 mt-1 min-w-[180px] py-1 rounded border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-lg z-20'>
                          {sortOptions.map((opt) => (
                            <li key={opt.value}>
                              <button
                                type='button'
                                onClick={() => {
                                  setSortBy(opt.value);
                                  setSortDropdownOpen(false);
                                  setPage(1);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm ${
                                  sortBy === opt.value
                                    ? "bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-medium"
                                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                                }`}
                              >
                                {t(opt.labelKey)}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Product grid */}
            {loading ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-12'>
                {Array.from({ length: products.length }).map((_, i) => (
                  <ProductCard key={i} Loading className='!mx-0' />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className='text-center py-16'>
                <p className='text-[var(--text-secondary)] mb-2'>
                  {t("No products found")}
                </p>
                <p className='text-sm text-[var(--text-muted)]'>
                  {t("Try adjusting your search or filter criteria")}
                </p>
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-12'>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    Product={product}
                    className='!mx-0'
                    showAddToCart={true}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !loading && (
              <div
                className={`flex flex-wrap items-center justify-center mx-auto mb-2 gap-1 sm:gap-1.5 mt-12 sm:mt-20 rounded-md px-2 sm:px-3 py-1.5 w-full sm:w-fit max-w-full border border-[var(--border-color)] ${
                  currentLang === "ar" ? "flex-row-reverse" : ""
                }`}
              >
                <button
                  type='button'
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className='cursor-pointer px-2 sm:px-3 h-8 sm:h-9 rounded bg-[var(--bg-primary)] text-[var(--text-secondary)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--bg-secondary)]'
                  aria-label='Previous'
                >
                  <MdOutlineArrowBackIos className='w-4 h-4' />
                </button>
                {paginationNumbers.map((n, i) =>
                  n === "..." ? (
                    <span
                      key={`ellipsis-${i}`}
                      className='px-1 sm:px-2 text-[var(--text-muted)] text-sm'
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={n}
                      type='button'
                      onClick={() => goToPage(n as number)}
                      className={`cursor-pointer min-w-[34px] sm:min-w-[40px] h-8 sm:h-9 rounded px-2 sm:px-3 text-sm font-medium ${
                        page === n
                          ? "bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                          : "bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                      }`}
                    >
                      {n}
                    </button>
                  ),
                )}
                <button
                  type='button'
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  className='cursor-pointer px-2 sm:px-3 h-8 sm:h-9 rounded bg-[var(--bg-primary)] text-[var(--text-secondary)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--bg-secondary)]'
                  aria-label='Next'
                >
                  <MdOutlineArrowForwardIos className='w-4 h-4' />
                </button>
              </div>
            )}
            <p className='block lg:hidden text-sm text-center text-[var(--text-muted)]'>
              {t("Catalog.ShowingResults", {
                start: totalCount === 0 ? 0 : startItem,
                end: endItem,
                total: totalCount,
              })}
            </p>
          </div>
        </div>
      </div>
      <Newsletter />
    </>
  );
}
