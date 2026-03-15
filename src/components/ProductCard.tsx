import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FaRegHeart } from "react-icons/fa";
import { FiShoppingCart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import type { IProduct } from "../types";
import Loader from "./common/Loader";

interface ProductCardProps {
  Product?: IProduct;
  Loading?: boolean;
  className?: string;
  /** When true, shows an Add to cart button (e.g. in carousels) */
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
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);

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
          onClick={(e) => e.stopPropagation()}
          className='absolute top-2 right-2 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-[var(--text-secondary)] shadow-sm transition-colors'
          aria-label={t("Add to favorites")}
        >
          <FaRegHeart className='w-4 h-4' />
        </button>
        <img
          src={Product.images?.[0] || "Hero-Img.png"}
          alt='Product 1'
          className='w-full h-40 object-contain mb-4 rounded'
        />
        {showAddToCart && Product.stock_status === "in_stock" && (
          <div className='absolute inset-x-0 bottom-0 p-2 flex justify-center bg-gradient-to-t from-black/60 to-transparent rounded-b-md opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
            <button
              type='button'
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className='flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-[var(--accent-primary)] text-[var(--text-primary)] hover:bg-[var(--accent-hover)] transition-colors text-sm font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
            >
              {isAddingToCart ? (
                <Loader />
              ) : (
                <FiShoppingCart className='w-4 h-4 shrink-0' />
              )}
            </button>
          </div>
        )}
      </div>
      <h4 className='my-4 text-md font-semibold text-[var(--text-secondary)]'>
        {currentLang === "ar" ? Product.name_ar : Product.title}
      </h4>
      <div
        className={`flex items-center justify-center sm:justify-start gap-3 flex-wrap`}
      >
        <div className='inline-block border border-[var(--border-color)] text-[var(--text-secondary)] px-4 py-1 rounded-full text-xs font-semibold'>
          {Product.stock_status === "in_stock"
            ? t("Stock Statuses.in_stock")
            : t("Stock Statuses.out_of_stock")}
        </div>
        <span className='text-[var(--text-muted)] ml-2'>${Product.price}</span>
      </div>
    </div>
  );
};

export default ProductCard;
