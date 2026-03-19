import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { BsHeartFill } from "react-icons/bs";
import { FaRegHeart } from "react-icons/fa";
import { FiShoppingCart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { StockStatus, type IProduct } from "../types";
import Carousel from "./Carousel";
import Loader from "./common/Loader";

interface ProductCardProps {
  Product?: IProduct;
  Loading?: boolean;
  className?: string;
  showAddToCart?: boolean;
}

const ProductCard = ({
  Product,
  Loading = false,
  className = "",
  showAddToCart = false,
}: ProductCardProps) => {
  const { currentLang } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addItem, items } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const { currentTheme } = useTheme();
  const dragThreshold = 8;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!Product || isAddingToCart) return;
    const currentQty =
      items
        .filter((item) => item.product_id === Product.id)
        .reduce((acc, item) => acc + item.quantity, 0) || 0;
    if (currentQty >= Product.available_quantity) {
      toast.error(
        t("Only {{count}} items are available", {
          count: Product.available_quantity,
        }),
      );
      return;
    }
    try {
      setIsAddingToCart(true);
      await addItem({
        productId: Product.id,
        quantity: 1,
        selectedColor: Product.colors?.[0] ?? null,
        selectedSize: Product.sizes?.[0] ?? null,
        product: Product,
      });
      toast.success(t("Added to cart successfully"));
    } catch {
      toast.error(t("Failed to add item to cart"));
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!Product) return;

    const alreadyFavorite = isFavorite(Product.id);
    toggleFavorite(Product);
    toast.success(
      alreadyFavorite ? t("Removed from favorites") : t("Added to favorites"),
    );
  };

  if (Loading) {
    return (
      <div className={`text-center sm:text-start mx-4 ${className}`}>
        <div className='product-card bg-[var(--bg-secondary)] p-4 rounded-md h-[300px] flex flex-col justify-center items-center animate-pulse'></div>
        <div className='h-5 bg-[var(--bg-secondary)] rounded w-3/4 my-4 mx-auto sm:mx-0'></div>
        <div className='flex items-center justify-center sm:justify-start gap-3'>
          <div className='h-5 w-16 bg-[var(--bg-secondary)] rounded-full'></div>
          <div className='h-5 w-10 bg-[var(--bg-secondary)] rounded'></div>
        </div>
      </div>
    );
  }

  if (!Product) return null;
  const favorite = isFavorite(Product.id);

  return (
    <div className={`text-center sm:text-start mx-4 ${className}`}>
      <div
        className='product-card group bg-[var(--bg-secondary)] p-4 rounded-md h-[300px] flex flex-col justify-center items-center cursor-pointer relative overflow-hidden'
        onMouseDown={(e) => {
          dragStartRef.current = { x: e.clientX, y: e.clientY };
          isDraggingRef.current = false;
        }}
        onMouseMove={(e) => {
          if (!dragStartRef.current) return;

          const movedX = Math.abs(e.clientX - dragStartRef.current.x);
          const movedY = Math.abs(e.clientY - dragStartRef.current.y);
          if (movedX > dragThreshold || movedY > dragThreshold) {
            isDraggingRef.current = true;
          }
        }}
        onMouseLeave={() => {
          dragStartRef.current = null;
        }}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          if (!touch) return;
          dragStartRef.current = { x: touch.clientX, y: touch.clientY };
          isDraggingRef.current = false;
        }}
        onTouchMove={(e) => {
          if (!dragStartRef.current) return;
          const touch = e.touches[0];
          if (!touch) return;

          const movedX = Math.abs(touch.clientX - dragStartRef.current.x);
          const movedY = Math.abs(touch.clientY - dragStartRef.current.y);
          if (movedX > dragThreshold || movedY > dragThreshold) {
            isDraggingRef.current = true;
          }
        }}
        onClick={(e) => {
          if (isDraggingRef.current) {
            e.preventDefault();
            e.stopPropagation();
            isDraggingRef.current = false;
            return;
          }

          navigate(`/${Product.slug}`);
        }}
      >
        <button
          type='button'
          onClick={handleToggleFavorite}
          className={`absolute top-2 right-2 z-10 p-2 rounded-full bg-[var(--bg-primary)] hover:bg-[var(--accent-hover)] shadow-sm transition-colors cursor-pointer ${
            favorite
              ? "text-[var(--error)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
          aria-label={
            favorite ? t("Remove from favorites") : t("Add to favorites")
          }
        >
          {favorite ? <BsHeartFill size={14} /> : <FaRegHeart size={14} />}
        </button>
        {Product.stock_status === StockStatus.LOW_STOCK && (
          <div className='absolute top-2 left-2 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg-primary)] border border-[var(--warning)] text-[var(--warning)] text-[11px] font-semibold shadow-sm'>
            <span className='animate-pulse w-1.5 h-1.5 bg-[var(--warning)] rounded-full'></span>
            {t("Only {{count}} left!", {
              count: Product.available_quantity,
            })}
          </div>
        )}

        <Carousel
          slidesToShow={1}
          arrows={false}
          dots={true}
          infinite={true}
          speed={1000}
          autoplay={true}
          autoplaySpeed={5000}
        >
          {Product.images.length > 0 ? (
            Product.images.map((image) => (
              <img
                key={image}
                src={image}
                alt={Product?.title}
                className='w-full h-40 object-contain mb-4 rounded'
              />
            ))
          ) : (
            <img
              src={Product.image_url || "Image_not_Available.jpg"}
              alt='Product 1'
              className={`w-full h-40 object-contain mb-4 rounded ${
                currentTheme == "dark" || currentTheme == "system"
                  ? "dark:invert"
                  : ""
              }`}
            />
          )}
        </Carousel>
        {showAddToCart && Product.stock_status !== StockStatus.OUT_OF_STOCK && (
          <div className='absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[var(--bg-gradient)] to-transparent rounded-b-md opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200'>
            <div className='flex flex-col items-center gap-2.5'>
              <button
                type='button'
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className='w-full max-w-[170px] flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-[var(--accent-primary)] text-[var(--text-primary)] hover:bg-[var(--accent-hover)] transition-colors text-sm font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
              >
                {isAddingToCart ? (
                  <Loader className='text-[var(--bg-secondary)]' />
                ) : (
                  <FiShoppingCart className='w-4 h-4 shrink-0' />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      <h4 className='my-4 text-md font-semibold text-[var(--text-secondary)]'>
        {currentLang === "ar" ? Product.name_ar : Product.title}
      </h4>
      <div
        className={`flex items-center justify-center sm:justify-start gap-3 flex-wrap`}
      >
        <div
          className={`inline-block border border-[var(--border-color)] ${Product.stock_status === StockStatus.OUT_OF_STOCK ? "text-[var(--error)]" : Product.stock_status === StockStatus.LOW_STOCK ? "text-[var(--warning)]" : "text-[var(--text-secondary)]"} px-4 py-1 rounded-full text-xs font-semibold`}
        >
          {Product.stock_status === StockStatus.IN_STOCK
            ? t("Stock Statuses.in_stock")
            : Product.stock_status === StockStatus.LOW_STOCK
              ? t("Stock Statuses.low_stock")
              : Product.stock_status === StockStatus.OUT_OF_STOCK
                ? t("Stock Statuses.out_of_stock")
                : ""}
        </div>
        <span className='text-[var(--text-muted)] ml-2'>${Product.price}</span>
      </div>
    </div>
  );
};

export default ProductCard;
