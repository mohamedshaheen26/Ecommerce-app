import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { BsChevronDown, BsThreeDots } from "react-icons/bs";
import { FaRegHeart, FaStar } from "react-icons/fa";
import { FiCheck, FiShare2 } from "react-icons/fi";
import { GoStar } from "react-icons/go";
import { useParams } from "react-router-dom";
import { fetchProductBySlug, fetchRelatedProducts } from "../../api/product";
import BreadcrumbsComponents from "../../components/Breadcrumbs";
import Carousel from "../../components/Carousel";
import Button from "../../components/common/Button";
import QuantitySelector from "../../components/common/QuantitySelector";
import Newsletter from "../../components/Newsletter";
import ProductCard from "../../components/ProductCard";
import { useCart } from "../../context/CartContext";
import { useLanguage } from "../../context/LanguageContext";
import { useSettings } from "../../context/SettingsContext";
import type { ICartItem, IProduct } from "../../types";

const ProductPage = () => {
  const { t } = useTranslation();
  const { currentLang } = useLanguage();
  const { settings } = useSettings();
  const { slug } = useParams();
  const { addItem, items } = useCart();
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

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

  const demoReviews = [
    {
      id: 1,
      name: "Emily Davis",
      date: t("1 week ago"),
      comment: t(
        "This company always goes above and beyond to satisfy their customers.",
      ),
      rating: 4,
    },
    {
      id: 2,
      name: "Daniel Smith",
      date: t("2 months ago"),
      comment: t(
        "I can't believe how affordable and high-quality this item is!",
      ),
      rating: 4,
    },
    {
      id: 3,
      name: "Benjamin Clark",
      date: t("23 april"),
      comment: t(
        "These guys know their stuff, and it shows in their products.",
      ),
      rating: 4,
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
                {product?.images?.map((image) => (
                  <img
                    key={image}
                    src={image}
                    alt={product?.title}
                    className='h-[360px] mx-auto object-contain object-center transition-transform duration-500 group-hover:scale-105'
                  />
                ))}
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
                  5
                </span>
                <span
                  className={`text-xs text-[var(--text-muted)] ${currentLang === "ar" ? "border-r pr-2 mr-1" : "border-l pl-2 ml-1"} border-[var(--border-color)]`}
                >
                  10 {t("reviews")}
                </span>
              </div>
              <span className='text-xs px-3 py-1.5 rounded-full text-[var(--text-secondary)] border border-[var(--border-color)] uppercase tracking-wide'>
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
            </div>
            {/* Actions */}
            <div className='flex gap-4 mt-auto'>
              <Button
                variant='primary'
                className='flex-1 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] py-4 rounded-xl text-base font-bold transition-all duration-300'
                onClick={handleAddToCart}
                isLoading={isAddingToCart}
                disabled={isAddingToCart}
              >
                {t("Add to cart")}
              </Button>
              <button className='px-6 py-4 border border-[var(--border-color)] rounded-xl hover:bg-[var(--accent-hover)] hover:border-[var(--border-color)] text-[var(--text-secondary)] transition-all  group'>
                <FaRegHeart
                  size={20}
                  className='group-hover:text-red-500 transition-colors'
                />
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
          <div className='space-y-2'>
            <button
              className={`cursor-pointer w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === "details"
                  ? "bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-secondary)]"
              }`}
              onClick={() => setActiveSection("details")}
            >
              <BsThreeDots
                size={16}
                className={
                  activeSection === "details"
                    ? "text-[var(--text-secondary)]"
                    : "text-[var(--text-muted)]"
                }
              />
              {t("Details")}
            </button>

            <button
              className={`cursor-pointer w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === "reviews"
                  ? "bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-secondary)]"
              }`}
              onClick={() => setActiveSection("reviews")}
            >
              <GoStar
                className={
                  activeSection === "reviews"
                    ? "text-[var(--text-secondary)]"
                    : "text-[var(--text-muted)]"
                }
                size={14}
              />
              {t("Reviews")}
            </button>
          </div>

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
                      4.2
                    </span>
                    <span className='text-xs text-[var(--text-muted)] mb-1'>
                      — 54 {t("Reviews")}
                    </span>
                  </div>

                  <Button
                    variant='outline'
                    className='cursor-pointer rounded-md text-sm font-medium'
                  >
                    {t("Write a review")}
                  </Button>
                </div>

                <div className='flex items-center justify-end gap-2 mb-3 text-[10px] font-semibold tracking-[0.1em] uppercase text-[var(--text-muted)]'>
                  <span className='text-[var(--text-secondary)]'>
                    {t("Sort by")}
                  </span>
                  <BsChevronDown />
                </div>
                <div className='w-full h-px bg-[var(--border-color)]' />

                <div className='space-y-10'>
                  {demoReviews.map((review) => (
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
                              {review.date}
                            </p>
                          </div>

                          <div className='flex items-center gap-1'>
                            {Array.from({ length: 5 }, (_, i) =>
                              i < review.rating ? (
                                <FaStar
                                  key={i}
                                  size={14}
                                  className='text-[var(--text-secondary)]'
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
                  ))}
                </div>

                <div className='pt-4 text-center'>
                  <Button
                    variant='outline'
                    className='cursor-pointer rounded-md text-sm font-medium mx-auto block'
                  >
                    {t("Load more reviews")}
                  </Button>
                </div>
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
