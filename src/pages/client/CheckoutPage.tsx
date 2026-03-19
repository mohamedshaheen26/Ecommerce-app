import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { fetchCustomerByEmail } from "../../api/customers";
import { createOrder } from "../../api/orders";
import { fetchActiveShippingZones } from "../../api/shippingZones";
import BreadcrumbsComponents from "../../components/Breadcrumbs";
import FormField from "../../components/common/FormField";
import Newsletter from "../../components/Newsletter";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useLanguage } from "../../context/LanguageContext";
import { DiscountType, type ICoupon, type IShippingZone } from "../../types";
import Grid from "../../components/common/Grid";
import Input from "../../components/common/Input";
import { useYupForm } from "../../hooks/useYupForm";
import { getCheckoutFormSchema } from "../../validation/checkoutSchema";
import type { ICheckout } from "../../types/checkout";
import Select from "../../components/common/Select";
import TextArea from "../../components/common/TextArea";
import { fetchActiveCoupons } from "../../api/coupons";
import Loader from "../../components/common/Loader";

const TAX_RATE = 0.04;

export default function CheckoutPage() {
  const { t } = useTranslation();
  const { currentLang } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { items, clearItems } = useCart();
  const [shippingZones, setShippingZones] = useState<IShippingZone[]>([]);
  const [shippingZonesLoading, setShippingZonesLoading] = useState(true);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<ICoupon | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useYupForm<ICheckout>(getCheckoutFormSchema() as any, {
    fullName: "",
    phoneNumber: "",
    streetAddress: "",
    shippingZone: "",
    email: "",
    orderNotes: "",
  });

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
  const selectedShippingZoneId = watch("shippingZone");
  const selectedShippingZone = useMemo(
    () => shippingZones.find((zone) => zone.id === selectedShippingZoneId),
    [shippingZones, selectedShippingZoneId],
  );
  const shippingCost = Number(selectedShippingZone?.shipping_fee || 0);

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon || subtotal <= 0) return 0;

    if (subtotal < Number(appliedCoupon.min_order_amount || 0)) {
      return 0;
    }

    if (appliedCoupon.discount_type === DiscountType.PERCENTAGE) {
      const percentageDiscount =
        subtotal * (Number(appliedCoupon.discount_value || 0) / 100);
      const maxDiscount = Number(appliedCoupon.max_discount_amount || 0);
      const discount =
        maxDiscount > 0
          ? Math.min(percentageDiscount, maxDiscount)
          : percentageDiscount;
      return Number(discount.toFixed(2));
    }

    return Number(
      Math.min(subtotal, Number(appliedCoupon.discount_value || 0)).toFixed(2),
    );
  }, [appliedCoupon, subtotal]);

  const total = Math.max(
    0,
    Number((subtotal + shippingCost + tax - couponDiscount).toFixed(2)),
  );

  useEffect(() => {
    const authMeta = user?.user_metadata ?? {};
    const authFullName =
      (typeof authMeta.full_name === "string" ? authMeta.full_name : "") || "";
    const authPhone =
      (typeof authMeta.phone === "string" ? authMeta.phone : "") || "";
    const authEmail = user?.email || "";

    if (!getValues("fullName") && authFullName) {
      setValue("fullName", authFullName);
    }
    if (!getValues("phoneNumber") && authPhone) {
      setValue("phoneNumber", authPhone);
    }
    if (!getValues("email") && authEmail) {
      setValue("email", authEmail);
    }
  }, [getValues, setValue, user]);

  useEffect(() => {
    const loadCustomerProfile = async () => {
      if (!isAuthenticated || !user?.email) return;

      try {
        const customer = await fetchCustomerByEmail(user.email);
        if (!customer) return;

        const customerName =
          (currentLang === "ar" ? customer.name_ar : customer.full_name) || "";
        const customerAddress =
          (currentLang === "ar" ? customer.address_ar : customer.address) || "";

        if (!getValues("fullName") && customerName) {
          setValue("fullName", customerName);
        }
        if (!getValues("phoneNumber") && customer.phone) {
          setValue("phoneNumber", customer.phone);
        }
        if (!getValues("email") && customer.email) {
          setValue("email", customer.email);
        }
        if (!getValues("streetAddress") && customerAddress) {
          setValue("streetAddress", customerAddress);
        }
      } catch (error) {
        console.error("Failed to auto-fill customer profile:", error);
      }
    };

    loadCustomerProfile();
  }, [currentLang, getValues, isAuthenticated, setValue, user?.email]);

  useEffect(() => {
    const loadShippingZones = async () => {
      try {
        setShippingZonesLoading(true);
        const zones = await fetchActiveShippingZones();
        setShippingZones(zones);
        if (!getValues("shippingZone") && zones.length > 0 && zones[0].id) {
          setValue("shippingZone", zones[0].id);
        }
      } catch (error) {
        console.error("Failed to load shipping zones:", error);
        toast.error(t("Failed to load shipping zones"));
      } finally {
        setShippingZonesLoading(false);
      }
    };

    loadShippingZones();
  }, [getValues, setValue, t]);

  useEffect(() => {
    if (!appliedCoupon) return;
    if (subtotal >= Number(appliedCoupon.min_order_amount || 0)) return;

    setAppliedCoupon(null);
  }, [appliedCoupon, subtotal]);

  const onPlaceOrder = handleSubmit(async (values) => {
    if (isSubmitting) return;

    if (items.length === 0) {
      toast.error(t("Your cart is empty!"));
      return;
    }

    try {
      const customer = await fetchCustomerByEmail(user.email);
      if (!customer?.id) {
        toast.error(t("Customer profile not found"));
        return;
      }

      const order = await createOrder({
        customer_id: customer.id,
        shipping_zone_id: values.shippingZone,
        shipping_address: values.streetAddress,
        total_amount: total,
        notes: values.orderNotes || null,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.product?.price || 0,
        })),
        coupon_id: appliedCoupon?.id || null,
      });

      if (!order) {
        toast.error(t("Failed to place order"));
        return;
      }

      await clearItems();
      setIsOrderPlaced(true);
      toast.success(t("Order placed successfully"));
    } catch (error) {
      console.error("Failed to place order:", error);
      toast.error(t("Failed to place order"));
    }
  });

  const handleApplyCoupon = async () => {
    if (couponLoading || !couponCode.trim()) return;
    debugger;
    try {
      setCouponLoading(true);
      const activeCoupons = await fetchActiveCoupons();
      const normalizedInput = couponCode.trim().toLowerCase();
      const matchingCoupon = activeCoupons.find(
        (coupon) => coupon.code?.trim().toLowerCase() === normalizedInput,
      );

      if (!matchingCoupon) {
        toast.error(t("Invalid coupon code"));
        return;
      }

      if (!matchingCoupon.computed_is_active) {
        toast.error(t("This coupon is not active yet"));
        return;
      }

      if (matchingCoupon.usage_limit === matchingCoupon.used_count) {
        toast.error(t("COUPON_LIMIT_REACHED"));
        return;
      }

      if (subtotal < Number(matchingCoupon.min_order_amount || 0)) {
        toast.error(t("Minimum order amount not met for this coupon"));
        return;
      }

      setAppliedCoupon(matchingCoupon);
      setCouponCode(matchingCoupon.code);
      toast.success(t("Coupon applied successfully"));
    } catch (error) {
      console.error(error);
      toast.error(t("Failed to apply coupon"));
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success(t("Coupon removed"));
  };

  if (isOrderPlaced) {
    return (
      <>
        <BreadcrumbsComponents
          title='Checkout'
          path={`NovaStore/checkout`}
          className={`${isOrderPlaced ? "bg-[var(--bg-success)]" : ""}`}
        />
        <section className='max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-16 md:py-24'>
          <div className='mx-auto max-w-md text-center'>
            <img
              src='/Order-Complete.svg'
              alt='Order complete'
              className='w-20 h-20 mx-auto mb-6'
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <h2 className='text-3xl font-semibold text-[var(--text-secondary)] mb-3'>
              {t("Thank you for shopping")}
            </h2>
            <p className='text-sm text-[var(--text-muted)] mb-8'>
              {t(
                "Your order has been successfully placed and is now being processed.",
              )}
            </p>
            <Link
              to='/account'
              className='inline-flex items-center justify-center h-11 px-6 rounded-md bg-[#0A122B] text-white text-sm font-medium hover:opacity-90 transition-opacity'
            >
              {t("Go to my account")}
            </Link>
          </div>
        </section>
        <Newsletter />
      </>
    );
  }

  return (
    <>
      <BreadcrumbsComponents
        title='Checkout'
        path={`NovaStore/checkout`}
        className={`${isOrderPlaced ? "bg-[var(--success)]" : ""}`}
      />
      <section className='max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 md:py-12'>
        <form
          onSubmit={onPlaceOrder}
          className='grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8 lg:gap-10'
        >
          <div
            className={`${currentLang === "ar" ? "lg:pl-10 lg:border-l border-[var(--border-color)]" : "lg:pr-10 lg:border-r border-[var(--border-color)]"}`}
          >
            <h2 className='text-lg font-semibold text-[var(--text-secondary)] mb-7'>
              {t("Shipping Address")}
            </h2>

            <div className='space-y-4'>
              <Grid columns={{ default: 1, md: 2 }}>
                <FormField
                  htmlFor='fullName'
                  label='Full name'
                  required
                  error={errors.fullName?.message}
                >
                  <Input id='fullName' {...register("fullName")} />
                </FormField>
                <FormField
                  htmlFor='phoneNumber'
                  label='Phone number'
                  required
                  error={errors.phoneNumber?.message}
                >
                  <Input id='phoneNumber' {...register("phoneNumber")} />
                </FormField>
              </Grid>

              <FormField
                htmlFor='streetAddress'
                label='Street Address'
                required
                error={errors.streetAddress?.message}
              >
                <Input id='streetAddress' {...register("streetAddress")} />
              </FormField>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <FormField
                  htmlFor='shippingZone'
                  label='City'
                  required
                  error={errors.shippingZone?.message}
                >
                  <Select
                    id='shippingZone'
                    {...register("shippingZone")}
                    options={[
                      ...shippingZones.map((zone) => ({
                        value: zone.id ? zone.id : "",
                        label:
                          currentLang === "ar"
                            ? zone.name_ar || zone.name
                            : zone.name || zone.name_ar,
                      })),
                    ]}
                  />
                  {!shippingZonesLoading && shippingZones.length === 0 && (
                    <p className='text-xs mt-1 text-[var(--text-muted)]'>
                      {t("No shipping zones available")}
                    </p>
                  )}
                </FormField>
                <FormField
                  htmlFor='email'
                  label='Email'
                  error={errors.email?.message}
                >
                  <Input id='email' {...register("email")} />
                </FormField>
              </div>

              <div className='pt-2 space-y-3'>
                <FormField
                  htmlFor='orderNotes'
                  label='Order Notes'
                  error={errors.orderNotes?.message}
                >
                  <TextArea id='orderNotes' {...register("orderNotes")} />
                </FormField>
              </div>
            </div>
          </div>

          <aside className='self-start'>
            <h2 className='text-lg font-semibold text-[var(--text-secondary)] mb-5'>
              {t("Your Order")}
            </h2>

            <div className='flex items-center justify-between mb-5'>
              <div className='flex items-center gap-2'>
                {items.slice(0, 4).map((item) => (
                  <img
                    key={item.id}
                    src={
                      item.product?.images?.[0] || item.product?.image_url || ""
                    }
                    alt={
                      currentLang === "ar"
                        ? item.product?.name_ar || item.product?.title
                        : item.product?.title
                    }
                    className='w-9 h-9 rounded-full object-cover bg-[var(--bg-secondary)] border border-[var(--border-color)]'
                  />
                ))}
              </div>
              <Link
                to='/cart'
                className='h-9 px-4 inline-flex items-center justify-center rounded-md border border-[var(--border-color)] text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              >
                {t("Edit Cart")}
              </Link>
            </div>

            {items.length > 0 && (
              <div className='space-y-2 mb-2  '>
                <label
                  htmlFor='cart-coupon-code'
                  className='block text-sm font-medium text-[var(--text-secondary)]'
                >
                  {t("Coupon Code")}
                </label>
                <div className='flex items-center gap-2'>
                  <Input
                    id='cart-coupon-code'
                    type='text'
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder={t("Enter coupon code")}
                    disabled={couponLoading || appliedCoupon !== null}
                    fullWidth={true}
                  />
                  {!appliedCoupon ? (
                    <button
                      type='button'
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className='h-10 px-4 rounded-md bg-[#0A122B] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-1'
                    >
                      {couponLoading ? <Loader /> : t("Apply")}
                    </button>
                  ) : (
                    <button
                      type='button'
                      onClick={handleRemoveCoupon}
                      className='h-10 px-4 rounded-md border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] cursor-pointer flex-1'
                    >
                      {t("Remove")}
                    </button>
                  )}
                </div>
                {appliedCoupon && (
                  <p className='text-xs text-green-600'>
                    {t("Applied coupon")}: {appliedCoupon.code}
                  </p>
                )}
              </div>
            )}

            <div className='space-y-2 text-sm'>
              <div className='flex items-center justify-between text-[var(--text-muted)]'>
                <span>{t("Subtotal")}:</span>
                <span className='text-[var(--text-secondary)]'>
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className='flex items-center justify-between text-[var(--text-muted)]'>
                <span>{t("Shipping")}:</span>
                <span className='text-[var(--text-secondary)]'>
                  {shippingCost === 0
                    ? t("Free")
                    : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              {selectedShippingZone && (
                <div className='flex items-center justify-between text-[var(--text-muted)]'>
                  <span>{t("Estimated Delivery Days")}:</span>
                  <span className='text-[var(--text-secondary)]'>
                    {selectedShippingZone.estimated_days}
                  </span>
                </div>
              )}
              <div className='flex items-center justify-between text-[var(--text-muted)]'>
                <span>{t("Tax")}:</span>
                <span className='text-[var(--text-secondary)]'>
                  ${tax.toFixed(2)}
                </span>
              </div>
              {couponDiscount > 0 && (
                <div className='flex items-center justify-between text-[var(--text-muted)]'>
                  <span>{t("Discount")}</span>
                  <span className='text-green-600'>
                    -${couponDiscount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className='my-4 border-t border-[var(--border-color)]' />

            <div className='flex items-center justify-between mb-5'>
              <span className='text-sm font-semibold text-[var(--text-secondary)]'>
                {t("Total")}
              </span>
              <span className='text-lg font-semibold text-[var(--text-secondary)]'>
                ${total.toFixed(2)}
              </span>
            </div>

            <button
              type='submit'
              disabled={items.length === 0 || isSubmitting}
              className='cursor-pointer w-full h-11 rounded-md bg-[#0A122B] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isSubmitting ? t("Processing Order...") : t("Place Order")}
            </button>
          </aside>
        </form>
      </section>
      <Newsletter />
    </>
  );
}
