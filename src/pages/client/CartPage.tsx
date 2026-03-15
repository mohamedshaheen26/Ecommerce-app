import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import QuantitySelector from "../../components/common/QuantitySelector";
import { useCart } from "../../context/CartContext";
import { useLanguage } from "../../context/LanguageContext";

const SHIPPING_COST: number = 0;
const TAX_RATE = 0.0333333333;

export default function CartPage() {
  const { t } = useTranslation();
  const { currentLang } = useLanguage();
  const { items, updateItemQuantity, removeItem, clearItems } = useCart();
  const [pendingQuantityId, setPendingQuantityId] = useState<string | null>(
    null,
  );
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const [clearCartLoading, setClearCartLoading] = useState(false);

  const subtotal = useMemo(
    () =>
      items.reduce((acc, item) => {
        return acc + (item.product?.price || 0) * item.quantity;
      }, 0),
    [items],
  );
  const tax = useMemo(
    () => Number((subtotal * TAX_RATE).toFixed(2)),
    [subtotal],
  );
  const total = subtotal + SHIPPING_COST + tax;

  const updateQuantity = async (id: string, nextQuantity: number) => {
    if (nextQuantity < 1) return;
    if (pendingQuantityId || pendingRemoveId) return;

    try {
      setPendingQuantityId(id);
      await updateItemQuantity(id, nextQuantity);
    } catch (error) {
      console.error(error);
      toast.error(t("Failed to update quantity"));
    } finally {
      setPendingQuantityId(null);
    }
  };

  const handleRemoveItem = async (id: string) => {
    if (pendingQuantityId || pendingRemoveId) return;

    try {
      setPendingRemoveId(id);
      await removeItem(id);
    } catch (error) {
      console.error(error);
      toast.error(t("Failed to remove item"));
    } finally {
      setPendingRemoveId(null);
    }
  };

  const handleClearCart = async () => {
    if (clearCartLoading) return;
    setClearCartLoading(true);

    try {
      await clearItems();
      toast.success(t("Cart cleared"));
    } catch (error) {
      console.error(error);
      toast.error(t("Failed to clear cart"));
    } finally {
      setClearCartLoading(false);
    }
  };

  return (
    <section className='max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 md:py-12'>
      <div className='grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8 lg:gap-12'>
        <div>
          <div className='flex items-center justify-between mb-7 pb-4 border-b border-[var(--border-color)]'>
            <h1 className='text-xl sm:text-2xl font-semibold text-[var(--text-secondary)]'>
              {t("Your cart")}
            </h1>
            {items.length > 0 && (
              <button
                type='button'
                onClick={handleClearCart}
                className='text-xs underline text-[var(--text-muted)] hover:text-[var(--error)] cursor-pointer'
              >
                {t("Clear cart")}
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-10'>
              <div className='mb-6'>
                {/* Basket Icon in subtle background circle */}
                <div className='flex items-center justify-center w-20 h-20 rounded-full bg-[var(--bg-secondary)] mx-auto'>
                  <img
                    src='/Empty-Cart.png'
                    alt={t("Cart empty")}
                    className='w-10 h-10'
                  />
                </div>
              </div>
              <h2 className='text-xl font-semibold text-[var(--text-secondary)] mb-2'>
                {t("Your cart is empty!")}
              </h2>
              <p className='text-[var(--text-muted)] mb-6'>
                {t("Looks like you haven't added anything to your cart yet")}
              </p>
              <Link
                to='/products'
                className='inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-[var(--accent-primary)] text-[var(--text-primary)] hover:bg-[var(--accent-hover)] transition-colors font-medium'
              >
                {t("Continue Shopping")}
              </Link>
            </div>
          ) : clearCartLoading ? (
            <ul className='space-y-4 animate-pulse'>
              {Array.from({ length: items.length }).map((_, idx) => (
                <li
                  key={idx}
                  className='grid grid-cols-[64px_1fr_auto] gap-4 pb-4'
                >
                  <div className='w-16 h-16 rounded-md bg-[var(--bg-secondary)]' />
                  <div className='min-w-0 space-y-2'>
                    <div className='h-4 w-2/3 rounded bg-[var(--bg-secondary)]' />
                    <div className='h-3 w-1/3 rounded bg-[var(--bg-secondary)]' />
                  </div>
                  <div className='flex flex-col items-end gap-3'>
                    <div className='h-4 w-12 rounded bg-[var(--bg-secondary)]' />
                    <div className='flex items-center gap-2'>
                      <div className='h-8 w-24 rounded bg-[var(--bg-secondary)]' />
                      <div className='h-8 w-8 rounded bg-[var(--bg-secondary)]' />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <ul className='space-y-4'>
              {items.map((item) => {
                const isQuantityPending = pendingQuantityId === item.id;
                const isRemovePending = pendingRemoveId === item.id;
                const isItemPending = isQuantityPending || isRemovePending;

                return (
                  <li
                    key={item.id}
                    className='grid grid-cols-[64px_1fr_auto] items-center gap-4 pb-4'
                  >
                    <img
                      src={
                        item.product?.images?.[0] ||
                        item.product?.image_url ||
                        ""
                      }
                      alt={item.product?.title || t("Product image")}
                      className='w-16 h-16 object-cover rounded-md bg-[var(--bg-secondary)]'
                    />

                    <div className='min-w-0 space-y-1'>
                      <h2 className='text-sm font-medium text-[var(--text-secondary)] truncate'>
                        {currentLang === "ar"
                          ? item.product?.name_ar || item.product?.title
                          : item.product?.title}
                      </h2>
                      {(item.selected_color || item.selected_size) && (
                        <p className='text-xs text-[var(--text-muted)] flex gap-1 items-center'>
                          {item.selected_color && (
                            <>
                              {t("Color")}:{" "}
                              <span
                                className={`inline-block w-3 h-3 rounded-full transition-all`}
                                style={{
                                  backgroundColor: item.selected_color || "",
                                }}
                              ></span>{" "}
                            </>
                          )}
                          {item.selected_size && (
                            <>
                              - {t("Size")}:{" "}
                              <span className='text-[var(--text-secondary)]'>
                                {item.selected_size || "-"}
                              </span>
                            </>
                          )}
                        </p>
                      )}
                    </div>

                    <div className='flex flex-col items-end gap-3'>
                      <p className='text-sm font-semibold text-[var(--text-secondary)]'>
                        ${(item.product?.price || 0).toFixed(2)}
                      </p>
                      <div className='flex items-center gap-2'>
                        <QuantitySelector
                          value={item.quantity}
                          onChange={(nextValue) =>
                            updateQuantity(item.id, nextValue)
                          }
                          min={1}
                          max={item.product?.available_quantity}
                          size='sm'
                          editable={false}
                          loading={isQuantityPending}
                          disabled={isRemovePending}
                        />
                        <button
                          type='button'
                          onClick={() => handleRemoveItem(item.id)}
                          className='h-8 w-8 inline-flex items-center justify-center border border-[var(--border-color)] rounded-md text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--bg-secondary)] cursor-pointer'
                          aria-label={t("Remove item")}
                          disabled={isItemPending}
                        >
                          {isRemovePending ? (
                            <span className='h-3.5 w-3.5 border-2 border-[var(--error)] border-t-transparent rounded-full animate-spin' />
                          ) : (
                            <FiX className='w-4 h-4' />
                          )}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <aside className='self-start border border-[var(--border-color)] rounded-lg p-5 space-y-5 bg-[var(--bg-primary)]'>
          <h2 className='text-base font-semibold text-[var(--text-secondary)]'>
            {t("Order Summary")}
          </h2>

          <div className='space-y-2 text-sm'>
            <div className='flex items-center justify-between text-[var(--text-muted)]'>
              <span>{t("Subtotal")}</span>
              <span className='text-[var(--text-secondary)]'>
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className='flex items-center justify-between text-[var(--text-muted)]'>
              <span>{t("Shipping")}</span>
              <span className='text-[var(--text-secondary)]'>
                {SHIPPING_COST === 0
                  ? t("Free")
                  : `$${SHIPPING_COST.toFixed(2)}`}
              </span>
            </div>
            <div className='flex items-center justify-between text-[var(--text-muted)]'>
              <span>{t("Tax")}</span>
              <span className='text-[var(--text-secondary)]'>
                ${tax.toFixed(2)}
              </span>
            </div>
          </div>

          <div className='pt-3 border-t border-[var(--border-color)]'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-semibold text-[var(--text-secondary)]'>
                {t("Total")}
              </span>
              <span className='text-lg font-semibold text-[var(--text-secondary)]'>
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            type='button'
            className='w-full h-10 rounded-md bg-[#0A122B] text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={items.length === 0}
          >
            {t("Checkout")}
          </button>

          <Link
            to='/products'
            className='block text-center text-xs underline text-[var(--text-secondary)] hover:text-[var(--accent-primary)]'
          >
            {t("Continue Shopping")}
          </Link>
        </aside>
      </div>
    </section>
  );
}
