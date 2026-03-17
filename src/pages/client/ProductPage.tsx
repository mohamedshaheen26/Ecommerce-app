import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { BsChevronDown, BsHeartFill, BsThreeDots } from "react-icons/bs";
import { FaRegHeart, FaStar } from "react-icons/fa";
import { FiCheck, FiShare2 } from "react-icons/fi";
import { GoStar } from "react-icons/go";
import { useParams } from "react-router-dom";
import { fetchCustomerByEmail } from "../../api/customers";
import { fetchProductBySlug, fetchRelatedProducts } from "../../api/product";
import { createProductReview, fetchProductReviews } from "../../api/review";
import BreadcrumbsComponents from "../../components/Breadcrumbs";
import Carousel from "../../components/Carousel";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import QuantitySelector from "../../components/common/QuantitySelector";
import VerticalTabs, {
  type VerticalTabItem,
} from "../../components/common/VerticalTabs";
import Newsletter from "../../components/Newsletter";
import ProductCard from "../../components/ProductCard";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";
import { useLanguage } from "../../context/LanguageContext";
import { useSettings } from "../../context/SettingsContext";
import { useTheme } from "../../context/ThemeContext";
import {
  StockStatus,
  type ICartItem,
  type IProduct,
  type IProductReview,
  type IProductReviewsResult,
  type ReviewSort,
} from "../../types";
import { formatDate } from "../../utils/formatDate";

const ProductPage = () => {
  const REVIEWS_PER_PAGE = 4;
  const { t } = useTranslation();
  const { currentLang } = useLanguage();
  const { settings } = useSettings();
  const { slug } = useParams();
  const { currentTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { addItem, items } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [product, setProduct] = useState<IProduct>();
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<IProduct[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [amount, setAmount] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [activeSection, setActiveSection] = useState<"details" | "reviews">(
    "details",
  );
  const [reviewSort, setReviewSort] = useState<ReviewSort>("newest");
  const [reviewPage, setReviewPage] = useState(1);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviews, setReviews] = useState<IProductReview[]>([]);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewsReloadKey, setReviewsReloadKey] = useState(0);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewSortDropdownOpen, setReviewSortDropdownOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  useEffect(() => {
    setReviewPage(1);
    setReviewSort("newest");
    setIsReviewFormOpen(false);
    setReviewRating(0);
    setReviewComment("");
    setReviews([]);
    setReviewsCount(0);
    setAverageRating(0);
  }, [slug]);

  useEffect(() => {
    setReviewPage(1);
  }, [reviewSort]);

  useEffect(() => {
    async function fetchData() {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchProduct = await fetchProductBySlug(slug);
        if (!fetchProduct) {
          setProduct(undefined);
          return;
        }

        const relatedProductsData = await fetchRelatedProducts(
          fetchProduct.category_id,
          fetchProduct.id,
        );
        setProduct(fetchProduct);
        setRelatedProducts(relatedProductsData || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    if (!selectedColor && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    }
    if (!selectedSize && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product, selectedColor, selectedSize]);

  useEffect(() => {
    async function loadReviews() {
      if (!product?.id) return;
      const startedAt = Date.now();
      try {
        setIsLoadingReviews(true);
        const pagedResult: IProductReviewsResult = await fetchProductReviews(
          product.id,
          reviewPage,
          REVIEWS_PER_PAGE,
          reviewSort,
        );
        setReviews((prevReviews) => {
          if (reviewPage === 1) {
            return pagedResult.data;
          }

          const existingIds = new Set(prevReviews.map((item) => item.id));
          const newRows = pagedResult.data.filter(
            (item) => !existingIds.has(item.id),
          );
          return [...prevReviews, ...newRows];
        });
        setReviewsCount(pagedResult.count);
        setAverageRating(pagedResult.averageRating);
      } catch (error) {
        console.error(error);
      } finally {
        if (reviewPage > 1) {
          const minVisibleMs = 450;
          const elapsed = Date.now() - startedAt;
          if (elapsed < minVisibleMs) {
            await new Promise((resolve) =>
              setTimeout(resolve, minVisibleMs - elapsed),
            );
          }
        }
        setIsLoadingReviews(false);
      }
    }

    loadReviews();
  }, [product?.id, reviewPage, reviewSort, reviewsReloadKey]);

  const path =
    currentLang === "ar"
      ? product?.category?.path_ar || product?.category?.name_ar || ""
      : product?.category?.path || product?.category?.name || "";

  const productName =
    currentLang === "ar" ? product?.name_ar || product?.title : product?.title;

  if (loading) {
    return (
      <>
        <div className='flex flex-col gap-2 relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-4'>
          <div className='h-5 w-72 bg-[var(--bg-secondary)] rounded animate-pulse' />

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mt-4'>
            <div className='h-[550px] w-full rounded-xl bg-[var(--bg-secondary)] animate-pulse' />

            <div className='space-y-5'>
              <div className='h-10 w-3/4 bg-[var(--bg-secondary)] rounded animate-pulse' />
              <div className='h-7 w-48 bg-[var(--bg-secondary)] rounded animate-pulse' />
              <div className='h-8 w-24 bg-[var(--bg-secondary)] rounded animate-pulse' />
              <div className='h-px w-full bg-[var(--border-color)]' />
              <div className='h-20 w-full bg-[var(--bg-secondary)] rounded animate-pulse' />
              <div className='h-20 w-full bg-[var(--bg-secondary)] rounded animate-pulse' />
              <div className='h-20 w-56 bg-[var(--bg-secondary)] rounded animate-pulse' />
              <div className='h-14 w-full bg-[var(--bg-secondary)] rounded animate-pulse' />
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-8 lg:gap-12 pt-12 mt-4 mb-20'>
            <div className='space-y-2'>
              <div className='h-10 w-full rounded-lg bg-[var(--bg-secondary)] animate-pulse' />
              <div className='h-10 w-full rounded-lg bg-[var(--bg-secondary)] animate-pulse' />
            </div>

            <div className='space-y-4'>
              <div className='h-8 w-40 rounded bg-[var(--bg-secondary)] animate-pulse' />
              <div className='h-4 w-full rounded bg-[var(--bg-secondary)] animate-pulse' />
              <div className='h-4 w-11/12 rounded bg-[var(--bg-secondary)] animate-pulse' />
              <div className='h-4 w-10/12 rounded bg-[var(--bg-secondary)] animate-pulse' />
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className='h-[320px] rounded-lg bg-[var(--bg-secondary)] animate-pulse'
              />
            ))}
          </div>
        </div>
        <Newsletter />
      </>
    );
  }

  if (!product) return <div>Product not found</div>;

  const handleAddToCart = async () => {
    if (!product) return;

    if (amount < 1) {
      toast.error(t("Please select valid quantity"));
      return;
    }

    const currentProductQty =
      items
        .filter((item: ICartItem) => item.product_id === product.id)
        .reduce((acc, item) => acc + item.quantity, 0) || 0;

    if (amount + currentProductQty > product.available_quantity) {
      setErrorMessage(
        t("Only {{count}} items are available", {
          count: product.available_quantity,
        }),
      );
      return;
    }

    try {
      setIsAddingToCart(true);
      await addItem({
        productId: product.id,
        quantity: amount,
        selectedColor: selectedColor || product.colors[0] || null,
        selectedSize: selectedSize || product.sizes[0] || null,
        product,
      });
      toast.success(t("Added to cart successfully"));
    } catch (error) {
      console.error(error);
      toast.error(t("Failed to add item to cart"));
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product) return;

    const alreadyFavorite = isFavorite(product.id);
    toggleFavorite(product);
    toast.success(
      alreadyFavorite ? t("Removed from favorites") : t("Added to favorites"),
    );
  };

  if (!product) return null;
  const favorite = isFavorite(product.id);

  type ProductReview = {
    id: string;
    name: string;
    comment: string;
    rating: number;
    created_at: string | null;
  };

  const clampRating = (value: number) => Math.max(0, Math.min(5, value));
  const getString = (value: unknown) =>
    typeof value === "string" ? value.trim() : "";
  const getNumber = (value: unknown) => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : NaN;
    }
    return NaN;
  };

  const normalizedReviews: ProductReview[] = (() => {
    return reviews
      .map((review, index) => {
        const name = getString(review.name) || t("Anonymous");
        const comment = getString(review.comment);
        const rating = clampRating(getNumber(review.rating));
        if (!comment || Number.isNaN(rating)) return null;

        return {
          id: getString(review.id) || `${product.id}-review-${index}`,
          name,
          comment,
          rating,
          created_at: getString(review.created_at) || null,
        };
      })
      .filter((reviewItem): reviewItem is ProductReview => Boolean(reviewItem));
  })();

  const totalReviewPages = Math.max(
    1,
    Math.ceil(reviewsCount / REVIEWS_PER_PAGE),
  );
  const displayedReviews = normalizedReviews;
  const hasMoreReviews = reviewPage < totalReviewPages;

  const handleReviewButtonClick = () => {
    if (!isAuthenticated || !user?.email) {
      toast.error(t("Please login to write a review"));
      return;
    }
    setIsReviewFormOpen((prev) => !prev);
  };

  const handleSubmitReview = async () => {
    if (!product) return;
    if (!isAuthenticated || !user?.email) {
      toast.error(t("Please login to write a review"));
      return;
    }
    if (reviewRating < 1 || reviewRating > 5) {
      toast.error(t("Please provide a rating"));
      return;
    }
    if (!reviewComment.trim()) {
      toast.error(t("Please write your review"));
      return;
    }

    try {
      setIsSubmittingReview(true);
      const customer = await fetchCustomerByEmail(user.email);
      const fallbackName =
        typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : "";
      const customerName =
        currentLang === "ar"
          ? customer?.name_ar || customer?.full_name || fallbackName
          : customer?.full_name || customer?.name_ar || fallbackName;

      await createProductReview({
        productId: product.id,
        customerId: customer?.id ?? null,
        customerName: customerName || t("Anonymous"),
        comment: reviewComment,
        rating: reviewRating,
      });

      setIsReviewFormOpen(false);
      setReviewComment("");
      setReviewRating(0);
      setReviewPage(1);
      setReviewsReloadKey((prev) => prev + 1);
      toast.success(t("Review submitted successfully"));
    } catch (error) {
      console.error(error);
      toast.error(t("Failed to submit review"));
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const sectionTabs: VerticalTabItem<"details" | "reviews">[] = [
    {
      id: "details",
      label: t("Details"),
      icon: (isActive) => (
        <BsThreeDots
          size={16}
          className={
            isActive
              ? "text-[var(--text-secondary)]"
              : "text-[var(--text-muted)]"
          }
        />
      ),
    },
    {
      id: "reviews",
      label: t("Reviews"),
      icon: (isActive) => (
        <GoStar
          size={14}
          className={
            isActive
              ? "text-[var(--text-secondary)]"
              : "text-[var(--text-muted)]"
          }
        />
      ),
    },
  ];

  return (
    <>
      <div className='flex flex-col gap-2 relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-4'>
        <BreadcrumbsComponents path={path} productName={productName} />

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16'>
          {/* Left Column: Images */}
          <div className='flex flex-col gap-6'>
            {/* Main Image */}
            <div className='flex items-center justify-center w-full h-[550px] bg-[var(--bg-secondary)] rounded-xl overflow-hidden relative group'>
              <Carousel
                slidesToShow={1}
                arrows={false}
                dots={true}
                infinite={true}
                speed={1000}
                autoplay={true}
                autoplaySpeed={5000}
              >
                {product?.images.length > 0 ? (
                  product?.images.map((image) => (
                    <img
                      key={image}
                      src={image}
                      alt={product?.title}
                      className='h-[360px] mx-auto object-contain object-center transition-transform duration-500 group-hover:scale-105'
                    />
                  ))
                ) : (
                  <img
                    src={product?.image_url || "Image_not_Available.jpg"}
                    alt={product?.title}
                    className={`h-[360px] mx-auto object-contain object-center transition-transform duration-500 group-hover:scale-105 ${
                      currentTheme == "dark" || currentTheme == "system"
                        ? "dark:invert"
                        : ""
                    }`}
                  />
                )}
              </Carousel>
            </div>
          </div>

          {/* Right Column: Product Details */}
          <div className='flex flex-col h-full pt-2'>
            <div className='flex justify-between items-start mb-4'>
              <h1 className='text-2xl md:text-3xl font-bold text-[var(--text-secondary)] tracking-tight'>
                {currentLang === "ar" ? product?.name_ar : product?.title}
              </h1>
              <button className='p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all'>
                <FiShare2 size={24} />
              </button>
            </div>
            {/* Rating & Stock */}
            <div className='flex items-center gap-4 mb-6'>
              <div className='flex items-center gap-1 bg-[var(--bg-secondary)] px-3 py-1.5 rounded-full'>
                <FaStar className='text-yellow-400' size={16} />
                <span className='text-xs font-semibold text-[var(--text-secondary)]'>
                  {averageRating ? averageRating.toFixed(1) : "0.0"}
                </span>
                <span
                  className={`text-xs text-[var(--text-muted)] ${currentLang === "ar" ? "border-r pr-2 mr-1" : "border-l pl-2 ml-1"} border-[var(--border-color)]`}
                >
                  {reviewsCount} {t("reviews")}
                </span>
              </div>
              <span
                className={`text-xs px-3 py-1.5 rounded-full ${product?.stock_status === StockStatus.OUT_OF_STOCK ? "text-[var(--error)]" : product?.stock_status === StockStatus.LOW_STOCK ? "text-[var(--warning)]" : "text-[var(--text-secondary)]"} border border-[var(--border-color)] uppercase tracking-wide`}
              >
                {t(`Stock Statuses.${product?.stock_status}`)}
              </span>
            </div>
            {/* Price */}
            <div className='mb-4'>
              <span className='text-xl font-bold text-[var(--text-secondary)]'>
                ${product?.price.toFixed(2)}
              </span>
            </div>
            {/* Divider */}
            <div className='w-full h-px bg-[var(--border-color)] mb-4' />
            {/* Colors */}
            <div className='mb-8'>
              <span className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block'>
                {t("Available Colors")}
              </span>
              <div className='flex gap-3'>
                {product?.colors.map((color) => (
                  <button
                    key={color}
                    type='button'
                    onClick={() => setSelectedColor(color)}
                    className={`relative w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? `border-[var(--accent-primary)]`
                        : "border-[var(--border-color)] cursor-pointer"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                    aria-label={`Select color ${color}`}
                    aria-pressed={selectedColor === color}
                  >
                    {selectedColor === color && (
                      <span className='absolute inset-0 flex items-center justify-center text-white'>
                        <FiCheck size={12} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            {/* Sizes */}
            <div className='mb-8'>
              <span className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block'>
                {t("Select Size")}
              </span>
              <div className='flex flex-wrap gap-3'>
                {product?.sizes.map((size) => (
                  <Button
                    className={`rounded-sm border-2`}
                    key={size}
                    variant={selectedSize === size ? "primary" : "outline"}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            <div className='mb-8'>
              <span className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block'>
                {t("Quantity")}
              </span>
              <div className='flex items-center'>
                <QuantitySelector
                  value={amount}
                  onChange={setAmount}
                  min={1}
                  max={product.available_quantity}
                  size='md'
                />
              </div>
              {errorMessage && (
                <p className='text-red-500 text-xs mt-1'>{errorMessage}</p>
              )}

              {product.stock_status === StockStatus.LOW_STOCK && (
                <div className='mt-1 flex items-center gap-2 text-[var(--warning)] text-xs'>
                  <span className='animate-pulse w-2 h-2 bg-[var(--warning)] rounded-full'></span>
                  {t("Only {{count}} left!", {
                    count: product.available_quantity,
                  })}
                </div>
              )}
            </div>
            {/* Actions */}
            <div className='flex gap-4 mt-auto'>
              <Button
                variant='primary'
                className='flex-1 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] py-4 rounded-xl text-base font-bold transition-all duration-300'
                onClick={handleAddToCart}
                isLoading={isAddingToCart}
                disabled={
                  isAddingToCart ||
                  product.stock_status === StockStatus.OUT_OF_STOCK
                }
              >
                {t("Add to cart")}
              </Button>
              <button
                type='button'
                onClick={handleToggleFavorite}
                className={`cursor-pointer px-6 py-4 border border-[var(--border-color)] bg-[var(--bg-primary)] hover:bg-[var(--accent-hover)] rounded-xl transition-all group ${
                  favorite
                    ? "text-[var(--error)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
                aria-label={
                  favorite ? t("Remove from favorites") : t("Add to favorites")
                }
              >
                {favorite ? (
                  <BsHeartFill size={20} />
                ) : (
                  <FaRegHeart size={20} />
                )}
              </button>
            </div>
            {/* Footer Info */}
            <div className='mt-2 flex flex-col gap-2 text-xs text-[var(--text-muted)]'>
              <p>
                —{" "}
                {t("Free shipping on all orders over {{amount}}+", {
                  amount: settings.free_shipping_minimum,
                })}
              </p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-8 lg:gap-12 pt-12 mt-4 my-22'>
          <VerticalTabs
            items={sectionTabs}
            activeTab={activeSection}
            onChange={setActiveSection}
          />

          <div className='text-[var(--text-muted)]'>
            {activeSection === "details" ? (
              <div className='space-y-6'>
                <h3 className='text-xl font-semibold text-[var(--text-secondary)]'>
                  {t("Detail")}
                </h3>

                <p className='leading-8 whitespace-pre-line'>
                  {currentLang === "ar"
                    ? product?.description_ar
                    : product?.description}
                </p>
              </div>
            ) : (
              <div className='space-y-8'>
                <div className='space-y-4'>
                  <h3 className='text-xl font-semibold text-[var(--text-secondary)]'>
                    {t("Reviews")}
                  </h3>

                  <div className='flex items-end gap-3'>
                    <span className='text-3xl font-semibold text-[var(--text-secondary)] leading-none'>
                      {averageRating ? averageRating.toFixed(1) : "0.0"}
                    </span>
                    <span className='text-xs text-[var(--text-muted)] mb-1'>
                      — {reviewsCount} {t("Reviews")}
                    </span>
                  </div>

                  <Button
                    variant='outline'
                    className='cursor-pointer rounded-md text-sm font-medium'
                    onClick={handleReviewButtonClick}
                  >
                    {t("Write a review")}
                  </Button>
                </div>

                {isReviewFormOpen && (
                  <div className='rounded-xl border border-[var(--border-color)] p-4 sm:p-5 bg-[var(--bg-secondary)] space-y-4'>
                    <div>
                      <p className='text-sm font-medium text-[var(--text-secondary)] mb-2'>
                        {t("Your rating")}
                      </p>
                      <div className='flex items-center gap-1'>
                        {Array.from({ length: 5 }, (_, i) => {
                          const value = i + 1;
                          const active = value <= reviewRating;
                          return (
                            <button
                              key={value}
                              type='button'
                              onClick={() => setReviewRating(value)}
                              aria-label={t("Rate {{count}} stars", {
                                count: value,
                              })}
                              className='cursor-pointer'
                            >
                              {active ? (
                                <FaStar
                                  size={18}
                                  className='text-yellow-400 transition-colors'
                                />
                              ) : (
                                <GoStar
                                  size={18}
                                  className='text-[var(--text-muted)] transition-colors'
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor='review-comment'
                        className='text-sm font-medium text-[var(--text-secondary)] mb-2 block'
                      >
                        {t("Your review")}
                      </label>
                      <textarea
                        id='review-comment'
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder={t(
                          "Share your experience with this product",
                        )}
                        rows={4}
                        maxLength={800}
                        className='w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]'
                      />
                    </div>

                    <div className='flex items-center justify-end gap-2'>
                      <Button
                        variant='outline'
                        className='cursor-pointer'
                        onClick={() => setIsReviewFormOpen(false)}
                        disabled={isSubmittingReview}
                      >
                        {t("Cancel")}
                      </Button>
                      <Button
                        variant='primary'
                        className='cursor-pointer'
                        onClick={handleSubmitReview}
                        isLoading={isSubmittingReview}
                      >
                        {t("Submit review")}
                      </Button>
                    </div>
                  </div>
                )}

                <div className='flex items-center justify-end gap-2 mb-3 text-[10px] font-semibold tracking-[0.1em] uppercase text-[var(--text-muted)]'>
                  <div className='relative'>
                    <button
                      type='button'
                      onClick={() => setReviewSortDropdownOpen((o) => !o)}
                      className='flex items-center gap-2 px-4 py-2 rounded bg-[var(--bg-primary)] text-[var(--text-muted)] text-xs font-medium tracking-widest'
                    >
                      {t("Catalog.SortBy")}
                      <BsChevronDown
                        className={`w-4 h-4 transition-transform ${reviewSortDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {reviewSortDropdownOpen && (
                      <>
                        <div
                          className='fixed inset-0 z-10'
                          aria-hidden
                          onClick={() => setReviewSortDropdownOpen(false)}
                        />
                        <ul className='absolute top-full right-0 mt-1 min-w-[180px] py-1 rounded border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-lg z-20'>
                          {[
                            { value: "newest", labelKey: "Newest" },
                            { value: "highest", labelKey: "Highest rating" },
                            { value: "lowest", labelKey: "Lowest rating" },
                          ].map((opt) => (
                            <li key={opt.value}>
                              <button
                                type='button'
                                onClick={() => {
                                  setReviewSort(opt.value as ReviewSort);
                                  setReviewSortDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm ${
                                  reviewSort === opt.value
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
                <div className='w-full h-px bg-[var(--border-color)]' />

                <div className='space-y-10'>
                  {isLoadingReviews && reviewPage === 1 ? (
                    Array.from({ length: REVIEWS_PER_PAGE }, (_, index) => (
                      <div key={`review-skeleton-${index}`} className='flex gap-4'>
                        <div className='w-10 h-10 rounded-full bg-[var(--bg-secondary)] animate-pulse shrink-0' />
                        <div className='flex-1 space-y-2'>
                          <div className='flex items-start justify-between gap-3'>
                            <div className='space-y-2'>
                              <div className='h-4 w-40 rounded bg-[var(--bg-secondary)] animate-pulse' />
                              <div className='h-3 w-24 rounded bg-[var(--bg-secondary)] animate-pulse' />
                            </div>
                            <div className='h-4 w-24 rounded bg-[var(--bg-secondary)] animate-pulse' />
                          </div>
                          <div className='h-4 w-full rounded bg-[var(--bg-secondary)] animate-pulse' />
                          <div className='h-4 w-11/12 rounded bg-[var(--bg-secondary)] animate-pulse' />
                        </div>
                      </div>
                    ))
                  ) : displayedReviews.length > 0 ? (
                    displayedReviews.map((review) => (
                      <div key={review.id} className='flex gap-4'>
                        <div className='w-10 h-10 rounded-full bg-[#eef1ff] text-[#a0a7cf] flex items-center justify-center text-sm font-semibold shrink-0'>
                          {review.name
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>

                        <div className='flex-1 space-y-2'>
                          <div className='flex items-start justify-between gap-3'>
                            <div className='space-y-1'>
                              <p className='font-semibold text-[var(--text-secondary)]'>
                                {review.name}
                              </p>
                              <p className='text-xs uppercase tracking-wider text-[var(--text-muted)]'>
                                {formatDate(
                                  review.created_at || new Date().toISOString(),
                                )}
                              </p>
                            </div>

                            <div className='flex items-center gap-1'>
                              {Array.from({ length: 5 }, (_, i) =>
                                i < review.rating ? (
                                  <FaStar
                                    key={i}
                                    size={14}
                                    className='text-[var(--warning)]'
                                  />
                                ) : (
                                  <GoStar
                                    key={i}
                                    size={14}
                                    className='text-[var(--text-secondary)]'
                                  />
                                ),
                              )}
                            </div>
                          </div>

                          <p className='text-[var(--text-muted)] leading-7'>
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='rounded-xl p-5 flex flex-col items-center justify-center'>
                      <span className='mb-3 text-[var(--text-muted)] text-3xl'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 28 28'
                          width='60'
                          height='60'
                        >
                          <circle cx='14' cy='14' r='13' fill='#EEF1FF' />
                          <path
                            d='M9 11.6a.9.9 0 0 1 .9-.9h8.2a.9.9 0 1 1 0 1.8H9.9A.9.9 0 0 1 9 11.6Zm0 4a.9.9 0 0 1 .9-.9h8.2a.9.9 0 1 1 0 1.8H9.9a.9.9 0 0 1-.9-.9Z'
                            fill='#A0A7CF'
                          />
                          <path
                            d='M18.8 18c0 2.43-1.92 4.4-4.28 4.4-2.36 0-4.28-1.97-4.28-4.4 0-2.42 1.92-4.4 4.28-4.4 2.36 0 4.28 1.98 4.28 4.4Z'
                            fill='#A0A7CF'
                            opacity='0.22'
                          />
                        </svg>
                      </span>
                      <p className='text-[var(--text-secondary)] font-semibold mb-2 text-center'>
                        {t("No reviews yet")}
                      </p>
                    </div>
                  )}
                </div>

                {(hasMoreReviews || (isLoadingReviews && reviewPage > 1)) && (
                  <div className='pt-4 text-center'>
                    {isLoadingReviews && reviewPage > 1 && (
                      <div className='flex items-center justify-center gap-2 mb-2 text-xs text-[var(--text-muted)]'>
                        <Loader />
                      </div>
                    )}
                    {hasMoreReviews && (
                      <Button
                        variant='outline'
                        className='cursor-pointer rounded-md text-sm font-medium mx-auto block'
                        onClick={() => setReviewPage((prev) => prev + 1)}
                        disabled={isLoadingReviews}
                      >
                        {t("Load more reviews")}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className='my-22'>
          <div className='mb-10'>
            <h3 className='text-xl font-semibold text-[var(--text-secondary)]'>
              {t("You might also like")}
            </h3>
            <span className='text-xs text-[var(--text-muted)]'>
              {t("SIMILAR PRODUCTS")}
            </span>
          </div>
          <Carousel
            arrows={true}
            dots={false}
            infinite={true}
            speed={1000}
            autoplay={true}
            autoplaySpeed={5000}
          >
            {loading
              ? Array(4).fill(0)
              : relatedProducts?.map((product) => (
                  <ProductCard
                    key={product?.id}
                    Product={product}
                    Loading={loading}
                    showAddToCart
                  />
                ))}
          </Carousel>
        </div>
      </div>
      <Newsletter />
    </>
  );
};

export default ProductPage;
