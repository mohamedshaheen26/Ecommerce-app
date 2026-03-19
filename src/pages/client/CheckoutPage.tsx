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
import type { IShippingZone } from "../../types";
import Grid from "../../components/common/Grid";
import Input from "../../components/common/Input";
import { useYupForm } from "../../hooks/useYupForm";
import { getCheckoutFormSchema } from "../../validation/checkoutSchema";
import type { ICheckout } from "../../types/checkout";
import Select from "../../components/common/Select";
import TextArea from "../../components/common/TextArea";

const TAX_RATE = 0.04;

export default function CheckoutPage() {
  const { t } = useTranslation();
  const { currentLang } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { items, clearItems } = useCart();
  const [shippingZones, setShippingZones] = useState<IShippingZone[]>([]);
  const [shippingZonesLoading, setShippingZonesLoading] = useState(true);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

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
  const total = subtotal + shippingCost + tax;

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

  const onPlaceOrder = handleSubmit(async (values) => {
    if (isSubmitting) return;

    if (items.length === 0) {
      toast.error(t("Your cart is empty!"));
      return;
    }

    if (!isAuthenticated || !user?.email) {
      toast.error(t("Please login to place order"));
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
