import { MenuItem, TextField } from "@mui/material";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { fetchCustomerByEmail } from "../../api/customers";
import { fetchActiveShippingZones } from "../../api/shippingZones";
import FormField from "../../components/common/FormField";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useLanguage } from "../../context/LanguageContext";
import type { IShippingZone } from "../../types";

const TAX_RATE = 0.04;
const muiInputSx = {
  "& .MuiOutlinedInput-root": {
    color: "var(--text-secondary)",
    "& fieldset": { borderColor: "var(--border-color)" },
    "&:hover fieldset": { borderColor: "var(--accent-primary)" },
    "&.Mui-focused fieldset": { borderColor: "var(--accent-primary)" },
  },
};

type CheckoutFormState = {
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  orderNotes: string;
  email: string;
  shippingZone: IShippingZone | null;
};

const initialFormState: CheckoutFormState = {
  fullName: "",
  phoneNumber: "",
  streetAddress: "",
  orderNotes: "",
  email: "",
  shippingZone: null,
};

export default function CheckoutPage() {
  const { t } = useTranslation();
  const { currentLang } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { items } = useCart();
  const [formData, setFormData] = useState<CheckoutFormState>(initialFormState);
  const [shippingZones, setShippingZones] = useState<IShippingZone[]>([]);
  const [shippingZonesLoading, setShippingZonesLoading] = useState(true);
  const [selectedShippingZoneId, setSelectedShippingZoneId] = useState("");

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

    setFormData((prev) => ({
      ...prev,
      fullName: prev.fullName || authFullName,
      phoneNumber: prev.phoneNumber || authPhone,
      email: prev.email || authEmail,
    }));
  }, [user]);

  useEffect(() => {
    const loadCustomerProfile = async () => {
      if (!isAuthenticated || !user?.email) return;

      try {
        const customer = await fetchCustomerByEmail(user.email);
        if (!customer) return;

        setFormData((prev) => ({
          ...prev,
          fullName:
            prev.fullName ||
            (currentLang === "ar" ? customer.name_ar : customer.full_name) ||
            "",
          phoneNumber: prev.phoneNumber || customer.phone || "",
          email: prev.email || customer.email || "",
          streetAddress:
            prev.streetAddress ||
            (currentLang === "ar" ? customer.address_ar : customer.address) ||
            "",
        }));
      } catch (error) {
        console.error("Failed to auto-fill customer profile:", error);
      }
    };

    loadCustomerProfile();
  }, [currentLang, isAuthenticated, user?.email]);

  useEffect(() => {
    const loadShippingZones = async () => {
      try {
        setShippingZonesLoading(true);
        const zones = await fetchActiveShippingZones();
        setShippingZones(zones);
        if (zones.length > 0 && zones[0].id) {
          setSelectedShippingZoneId(zones[0].id);
        }
      } catch (error) {
        console.error("Failed to load shipping zones:", error);
        toast.error(t("Failed to load shipping zones"));
      } finally {
        setShippingZonesLoading(false);
      }
    };

    loadShippingZones();
  }, [t]);

  const onInputChange =
    (field: keyof CheckoutFormState) => (e: ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const onPlaceOrder = (e: FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error(t("Your cart is empty!"));
      return;
    }

    const requiredFields = [
      formData.fullName,
      formData.phoneNumber,
      formData.streetAddress,
      formData.shippingZone,
    ];
    const hasMissingRequired = requiredFields.some(
      (value) => !value?.toString().trim(),
    );

    if (hasMissingRequired) {
      toast.error(t("Please fill all required fields"));
      return;
    }

    if (!selectedShippingZoneId) {
      toast.error(t("Please select shipping zone"));
      return;
    }

    toast.success(t("Order placed successfully"));
  };

  return (
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
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <FormField htmlFor='fullName' label='Full name' required>
                <TextField
                  id='fullName'
                  size='small'
                  fullWidth
                  value={formData.fullName}
                  onChange={onInputChange("fullName")}
                  sx={muiInputSx}
                />
              </FormField>
              <FormField htmlFor='phoneNumber' label='Phone number' required>
                <TextField
                  id='phoneNumber'
                  size='small'
                  fullWidth
                  value={formData.phoneNumber}
                  onChange={onInputChange("phoneNumber")}
                  sx={muiInputSx}
                />
              </FormField>
            </div>

            <FormField htmlFor='streetAddress' label='Street Address' required>
              <TextField
                id='streetAddress'
                size='small'
                fullWidth
                value={formData.streetAddress}
                onChange={onInputChange("streetAddress")}
                sx={muiInputSx}
              />
            </FormField>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <FormField htmlFor='shippingZone' label='City' required>
                <TextField
                  id='shippingZone'
                  size='small'
                  fullWidth
                  select
                  value={selectedShippingZoneId}
                  onChange={(e) => setSelectedShippingZoneId(e.target.value)}
                  disabled={shippingZonesLoading || shippingZones.length === 0}
                  sx={muiInputSx}
                >
                  {shippingZones.map((zone) => (
                    <MenuItem key={zone.id} value={zone.id || ""}>
                      {currentLang === "ar"
                        ? zone.name_ar || zone.name
                        : zone.name || zone.name_ar}
                    </MenuItem>
                  ))}
                </TextField>
                {!shippingZonesLoading && shippingZones.length === 0 && (
                  <p className='text-xs mt-1 text-[var(--text-muted)]'>
                    {t("No shipping zones available")}
                  </p>
                )}
              </FormField>
              <FormField htmlFor='email' label='Email'>
                <TextField
                  id='email'
                  size='small'
                  fullWidth
                  type='email'
                  value={formData.email}
                  onChange={onInputChange("email")}
                  sx={muiInputSx}
                />
              </FormField>
            </div>

            <div className='pt-2 space-y-3'>
              <FormField htmlFor='orderNotes' label='Order Notes'>
                <TextField
                  id='orderNotes'
                  size='small'
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.orderNotes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      orderNotes: e.target.value,
                    }))
                  }
                  sx={muiInputSx}
                />
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
                {shippingCost === 0 ? t("Free") : `$${shippingCost.toFixed(2)}`}
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
            disabled={items.length === 0}
            className='w-full h-11 rounded-md bg-[#0A122B] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {t("Place Order")}
          </button>
        </aside>
      </form>
    </section>
  );
}
