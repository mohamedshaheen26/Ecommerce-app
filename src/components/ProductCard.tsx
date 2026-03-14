import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import type { IProduct } from "../types";

interface ProductCardProps {
  Product?: IProduct;
  Loading?: boolean;
}

const ProductCard = ({ Product, Loading = false }: ProductCardProps) => {
  const { currentLang } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);

  const dragThreshold = 8;

  if (!Product) return null;

  if (Loading) {
    return (
      <div className='text-center sm:text-start mx-4'>
        <div className='product-card bg-[var(--bg-secondary)] p-4 rounded-md h-[300px] flex flex-col justify-center items-center animate-pulse'></div>
        <div className='h-5 bg-[var(--bg-secondary)] rounded w-3/4 my-4 mx-auto sm:mx-0'></div>
        <div className='flex items-center justify-center sm:justify-start gap-3'>
          <div className='h-5 w-16 bg-[var(--bg-secondary)] rounded-full'></div>
          <div className='h-5 w-10 bg-[var(--bg-secondary)] rounded'></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`text-center ${
        currentLang === "ar" ? "sm:text-end" : "sm:text-start"
      } mx-4 cursor-pointer`}
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
      <div className='product-card bg-[var(--bg-secondary)] p-4 rounded-md h-[300px] flex flex-col justify-center items-center'>
        <img
          src={Product.images?.[0] || "Hero-Img.png"}
          alt='Product 1'
          className='w-full h-40 object-contain mb-4 rounded'
        />
      </div>
      <h4 className='my-4 text-md font-semibold text-[var(--text-secondary)]'>
        {currentLang === "ar" ? Product.name_ar : Product.title}
      </h4>
      <div
        className={`flex items-center justify-center ${
          currentLang === "ar" ? "sm:justify-end" : "sm:justify-start"
        } gap-3`}
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
