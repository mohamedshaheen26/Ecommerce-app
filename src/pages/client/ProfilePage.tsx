import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  BsCart3,
  BsGeoAlt,
  BsHeart,
  BsKey,
  BsPerson,
  BsPower,
} from "react-icons/bs";
import { FiPackage } from "react-icons/fi";
import { Navigate, useNavigate } from "react-router-dom";
import { updatePassword } from "../../api/auth";
import {
  fetchCustomerByEmail,
  fetchCustomerOrders,
  updateCustomer,
} from "../../api/customers";
import { fetchOrderItemsByOrderId } from "../../api/orders";
import BreadcrumbsComponents from "../../components/Breadcrumbs";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import VerticalTabs, {
  type VerticalTabItem,
} from "../../components/common/VerticalTabs";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";
import { useLanguage } from "../../context/LanguageContext";
import type { ICustomer, IOrder } from "../../types";
import { formatDate } from "../../utils/formatDate";
import { getStatusColor } from "../../utils/orderStatus";

type AccountSection =
  | "orders"
  | "wishlist"
  | "address"
  | "password"
  | "details"
  | "logout";

type AccountFormState = {
  fullName: string;
  email: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  newPassword: string;
  confirmPassword: string;
};

const initialFormState: AccountFormState = {
  fullName: "",
  email: "",
  streetAddress: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  newPassword: "",
  confirmPassword: "",
};

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentLang } = useLanguage();
  const { user, isAuthenticated, isAuthReady, logout } = useAuth();
  const { favorites, removeFavorite } = useFavorites();
  const { addItem } = useCart();

  const [activeSection, setActiveSection] = useState<AccountSection>("orders");
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [customer, setCustomer] = useState<ICustomer | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isOrderDetailsLoading, setIsOrderDetailsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [formData, setFormData] = useState<AccountFormState>(initialFormState);

  useEffect(() => {
    const loadAccountData = async () => {
      if (!isAuthenticated || !user?.email) {
        setIsLoadingData(false);
        return;
      }

      try {
        setIsLoadingData(true);
        const customerData = await fetchCustomerByEmail(user.email);
        setCustomer(customerData);

        if (customerData?.id) {
          const customerOrders = await fetchCustomerOrders(customerData.id);
          setOrders(customerOrders);
        } else {
          setOrders([]);
        }

        const authMeta = user.user_metadata ?? {};
        const fullNameFallback =
          (typeof authMeta.full_name === "string" ? authMeta.full_name : "") ||
          "";
        const streetFallback =
          currentLang === "ar"
            ? customerData?.address_ar || customerData?.address || ""
            : customerData?.address || customerData?.address_ar || "";

        setFormData((prev) => ({
          ...prev,
          fullName:
            (currentLang === "ar"
              ? customerData?.name_ar
              : customerData?.full_name) ||
            customerData?.full_name ||
            fullNameFallback,
          email: customerData?.email || user.email || "",
          streetAddress: streetFallback,
          country: prev.country || "United States",
        }));
      } catch (error) {
        console.error("Failed to load account data:", error);
        toast.error(t("Failed to load account data"));
      } finally {
        setIsLoadingData(false);
      }
    };

    loadAccountData();
  }, [currentLang, isAuthenticated, t, user]);

  const openOrderModal = async (order: IOrder) => {
    const orderId = order.id;
    setSelectedOrder(order);
    setIsOrderModalOpen(true);

    if (order.order_items && order.order_items.length > 0) return;

    try {
      setIsOrderDetailsLoading(true);
      const items = await fetchOrderItemsByOrderId(orderId);
      setSelectedOrder((prev) => {
        if (!prev || prev.id !== orderId) return prev;
        return { ...prev, order_items: items };
      });
    } catch (error) {
      console.error("Failed to load order items:", error);
    } finally {
      setIsOrderDetailsLoading(false);
    }
  };

  const accountTabs: VerticalTabItem<AccountSection>[] = useMemo(
    () => [
      {
        id: "orders",
        label: t("Orders"),
        icon: (isActive) => (
          <BsCart3
            size={14}
            className={
              isActive
                ? "text-[var(--text-secondary)]"
                : "text-[var(--text-muted)]"
            }
          />
        ),
      },
      {
        id: "wishlist",
        label: t("Wishlist"),
        icon: (isActive) => (
          <BsHeart
            size={14}
            className={
              isActive
                ? "text-[var(--text-secondary)]"
                : "text-[var(--text-muted)]"
            }
          />
        ),
      },
      {
        id: "address",
        label: t("Address"),
        icon: (isActive) => (
          <BsGeoAlt
            size={14}
            className={
              isActive
                ? "text-[var(--text-secondary)]"
                : "text-[var(--text-muted)]"
            }
          />
        ),
      },
      {
        id: "password",
        label: t("Password"),
        icon: (isActive) => (
          <BsKey
            size={14}
            className={
              isActive
                ? "text-[var(--text-secondary)]"
                : "text-[var(--text-muted)]"
            }
          />
        ),
      },
      {
        id: "details",
        label: t("Account Detail"),
        icon: (isActive) => (
          <BsPerson
            size={14}
            className={
              isActive
                ? "text-[var(--text-secondary)]"
                : "text-[var(--text-muted)]"
            }
          />
        ),
      },
      {
        id: "logout",
        label: t("Logout"),
        icon: (isActive) => (
          <BsPower
            size={14}
            className={
              isActive ? "text-[var(--error)]" : "text-[var(--text-muted)]"
            }
          />
        ),
      },
    ],
    [t],
  );

  const handleTabChange = async (tabId: AccountSection) => {
    if (tabId === "logout") {
      await logout();
      navigate("/");
      return;
    }
    setActiveSection(tabId);
  };

  const handleSaveAddress = async () => {
    if (!customer?.id) return;
    try {
      setIsSaving(true);
      await updateCustomer(customer.id, {
        address: formData.streetAddress,
        address_ar: formData.streetAddress,
      });
      toast.success(t("Address updated successfully"));
    } catch (error) {
      console.error("Failed to update address:", error);
      toast.error(t("Failed to update address"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDetails = async () => {
    if (!customer?.id) return;
    try {
      setIsSaving(true);
      await updateCustomer(customer.id, {
        full_name: formData.fullName,
        name_ar: formData.fullName,
      });
      toast.success(t("Profile updated successfully"));
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(t("Failed to update profile"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error(t("Please fill all required fields"));
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error(t("Password must be at least 6 characters"));
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error(t("Passwords do not match"));
      return;
    }

    try {
      setIsSaving(true);
      const result = await updatePassword(formData.newPassword);
      if (!result.success) {
        toast.error(t("Failed to update password"));
        return;
      }
      toast.success(t("Password updated successfully"));
      setFormData((prev) => ({
        ...prev,
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      console.error("Failed to update password:", error);
      toast.error(t("Failed to update password"));
    } finally {
      setIsSaving(false);
    }
  };

  const renderSection = () => {
    if (isLoadingData) {
      return (
        <div className='space-y-4'>
          <div className='h-7 w-40 bg-[var(--bg-secondary)] rounded animate-pulse' />
          <div className='h-12 w-full bg-[var(--bg-secondary)] rounded animate-pulse' />
          <div className='h-12 w-full bg-[var(--bg-secondary)] rounded animate-pulse' />
        </div>
      );
    }

    switch (activeSection) {
      case "orders":
        return (
          <div className='space-y-6'>
            {orders.length === 0 ? (
              <div className='min-h-[320px] rounded-lg flex flex-col items-center justify-center gap-4 text-center'>
                <FiPackage size={50} className='text-[var(--text-muted)]' />
                <p className='text-sm text-[var(--text-muted)]'>
                  {t("Your order history is waiting to be filled.")}
                </p>
                <Button
                  variant='primary'
                  className='bg-[#0A122B] hover:bg-[#151f45] text-white'
                  onClick={() => navigate("/products")}
                >
                  {t("Start Shopping")}
                </Button>
              </div>
            ) : (
              <div className=''>
                <h3 className='text-xl font-semibold text-[var(--text-secondary)] mb-10'>
                  {t("Orders")}
                </h3>
                {orders.map((order: IOrder) => {
                  const firstItem = order.order_items?.[0];
                  const itemName =
                    currentLang === "ar"
                      ? firstItem?.product?.name_ar || firstItem?.product?.title
                      : firstItem?.product?.title ||
                        firstItem?.product?.name_ar;

                  return (
                    <div
                      key={order.id}
                      className='py-4 flex flex-col md:flex-row md:items-center gap-4 border-b border-[var(--border-color)]'
                    >
                      <img
                        src={firstItem?.product?.image_url || "/Logo.svg"}
                        alt={itemName || "Order item"}
                        className='w-16 h-16 rounded bg-[var(--bg-secondary)] object-contain'
                      />
                      <div className='flex-1'>
                        <p className='font-semibold text-[var(--text-secondary)] mb-1'>
                          #{order.id.slice(0, 8)}
                        </p>
                        <p className='text-xs text-[var(--text-muted)] mb-2'>
                          {t("Ordered On")}: {formatDate(order.created_at)}
                        </p>
                        <p className='text-sm text-[var(--text-secondary)]'>
                          ${Number(order.total_amount || 0).toFixed(2)}
                        </p>
                      </div>
                      <span className='text-xs tracking-wider text-[var(--text-secondary)] font-medium underline pb-0.5'>
                        {t(`statuses.${order.status}`)}
                      </span>
                      <Button
                        variant='outline'
                        className='rounded-md'
                        onClick={() => openOrderModal(order)}
                      >
                        {t("View item")}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      case "wishlist":
        return (
          <div className='space-y-6'>
            {favorites.length === 0 ? (
              <div className='rounded-lg border border-[var(--border-color)] p-10 text-center text-sm text-[var(--text-muted)]'>
                {t("Your wishlist is empty.")}
              </div>
            ) : (
              <div className=''>
                <h3 className='text-xl font-semibold text-[var(--text-secondary)] mb-10'>
                  {t("Wishlist")}
                </h3>
                {favorites.map((item) => (
                  <div
                    key={item.id}
                    className='py-4 flex flex-col md:flex-row md:items-center gap-4 border-b border-[var(--border-color)]'
                  >
                    <img
                      src={item.images?.[0] || item.image_url || "/Logo.svg"}
                      alt={currentLang === "ar" ? item.name_ar : item.title}
                      className='w-16 h-16 rounded bg-[var(--bg-secondary)] object-contain'
                    />
                    <div className='flex-1'>
                      <p className='font-semibold text-[var(--text-secondary)] mb-1'>
                        {currentLang === "ar" ? item.name_ar : item.title}
                      </p>
                      <p className='text-xs text-[var(--text-muted)] mb-2'>
                        {t("Added on")}: {formatDate(item.created_at)}
                      </p>
                      <button
                        type='button'
                        onClick={() => removeFavorite(item.id)}
                        className='text-sm text-[var(--text-muted)] hover:text-[var(--error)] cursor-pointer'
                      >
                        {t("Remove item")}
                      </button>
                    </div>
                    <span className='text-[var(--text-secondary)] font-medium'>
                      ${item.price.toFixed(2)}
                    </span>
                    <Button
                      variant='outline'
                      className='rounded-md'
                      onClick={async () => {
                        try {
                          await addItem({
                            productId: item.id,
                            quantity: 1,
                            selectedColor: item.colors?.[0] || null,
                            selectedSize: item.sizes?.[0] || null,
                            product: item,
                          });
                          toast.success(t("Added to cart successfully"));
                        } catch (error) {
                          console.error(error);
                          toast.error(t("Failed to add item to cart"));
                        }
                      }}
                    >
                      {t("Add to cart")}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "address":
        return (
          <div className='space-y-5 max-w-2xl'>
            <h3 className='text-xl font-semibold text-[var(--text-secondary)] mb-10'>
              {t("Shipping Address")}
            </h3>
            <div className='space-y-4'>
              <div>
                <p className='text-sm mb-1.5 text-[var(--text-secondary)]'>
                  {t("Street Address")}
                </p>
                <input
                  value={formData.streetAddress}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      streetAddress: e.target.value,
                    }))
                  }
                  className='w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-secondary)]'
                />
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm mb-1.5 text-[var(--text-secondary)]'>
                    {t("City")}
                  </p>
                  <input
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, city: e.target.value }))
                    }
                    className='w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-secondary)]'
                  />
                </div>
                <div>
                  <p className='text-sm mb-1.5 text-[var(--text-secondary)]'>
                    {t("State")}
                  </p>
                  <input
                    value={formData.state}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        state: e.target.value,
                      }))
                    }
                    className='w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-secondary)]'
                  />
                </div>
                <div>
                  <p className='text-sm mb-1.5 text-[var(--text-secondary)]'>
                    {t("Zip Code")}
                  </p>
                  <input
                    value={formData.zipCode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        zipCode: e.target.value,
                      }))
                    }
                    className='w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-secondary)]'
                  />
                </div>
                <div>
                  <p className='text-sm mb-1.5 text-[var(--text-secondary)]'>
                    {t("Country")}
                  </p>
                  <input
                    value={formData.country}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                    className='w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-secondary)]'
                  />
                </div>
              </div>
            </div>
            <Button
              variant='primary'
              className='bg-[#0A122B] hover:bg-[#151f45] text-white'
              isLoading={isSaving}
              onClick={handleSaveAddress}
            >
              {t("Save Changes")}
            </Button>
          </div>
        );
      case "password":
        return (
          <div className='space-y-5 max-w-2xl'>
            <h3 className='text-xl font-semibold text-[var(--text-secondary)] mb-10'>
              {t("Change Password")}
            </h3>
            <div className='grid grid-cols-1 gap-4 max-w-md'>
              <div>
                <p className='text-sm mb-1.5 text-[var(--text-secondary)]'>
                  {t("New Password")}
                </p>
                <input
                  type='password'
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className='w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-secondary)]'
                />
              </div>
              <div>
                <p className='text-sm mb-1.5 text-[var(--text-secondary)]'>
                  {t("Confirm Password")}
                </p>
                <input
                  type='password'
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className='w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-secondary)]'
                />
              </div>
            </div>
            <Button
              variant='primary'
              className='bg-[#0A122B] hover:bg-[#151f45] text-white'
              isLoading={isSaving}
              onClick={handleChangePassword}
            >
              {t("Change Password")}
            </Button>
          </div>
        );
      case "details":
        return (
          <div className='space-y-5 max-w-2xl'>
            <h3 className='text-xl font-semibold text-[var(--text-secondary)] mb-10'>
              {t("Account Detail")}
            </h3>
            <div className='w-12 h-12 rounded-full bg-[#eef1ff] text-[#a0a7cf] flex items-center justify-center text-sm font-semibold'>
              {formData.fullName
                .split(" ")
                .map((part) => part[0] || "")
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className='grid grid-cols-1 gap-4 max-w-md'>
              <div>
                <p className='text-sm mb-1.5 text-[var(--text-secondary)]'>
                  {t("Full name")}
                </p>
                <input
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  className='w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-secondary)]'
                />
              </div>
              <div>
                <p className='text-sm mb-1.5 text-[var(--text-secondary)]'>
                  {t("Email")}
                </p>
                <input
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className='w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-secondary)]'
                />
              </div>
            </div>
            <Button
              variant='primary'
              className='bg-[#0A122B] hover:bg-[#151f45] text-white'
              isLoading={isSaving}
              onClick={handleSaveDetails}
            >
              {t("Save Changes")}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isAuthReady) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600' />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  return (
    <>
      <BreadcrumbsComponents title='My Account' path='NovaStore/My Account' />
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setIsOrderDetailsLoading(false);
          setSelectedOrder(null);
        }}
        title='Order Details'
        maxWidth='max-w-3xl'
        showActions={false}
        showSaveBtn={false}
        showCancelBtn={false}
      >
        {!selectedOrder ? null : (
          <div className='space-y-6'>
            <div className='bg-[var(--bg-secondary)]/40 border border-[var(--border-color)] rounded-lg p-5'>
              <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4'>
                <div>
                  <p className='text-xs text-[var(--text-muted)] mb-1'>
                    {t("Order ID")}
                  </p>
                  <p className='text-lg font-semibold text-[var(--text-secondary)]'>
                    #{selectedOrder.id}
                  </p>

                  <p className='text-xs text-[var(--text-muted)] mt-2'>
                    {t("Ordered On")}:{" "}
                    {selectedOrder.created_at
                      ? formatDate(selectedOrder.created_at)
                      : "-"}
                  </p>

                  <p className='text-sm text-[var(--text-secondary)] mt-2'>
                    ${Number(selectedOrder.total_amount || 0).toFixed(2)}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
                    selectedOrder.status,
                  )}`}
                >
                  {t(`statuses.${selectedOrder.status}`)}
                </span>
              </div>

              {selectedOrder.shipping_address ? (
                <div className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <p className='text-xs text-[var(--text-muted)] mb-1'>
                      {t("Shipping Address")}
                    </p>
                    <p className='text-sm text-[var(--text-secondary)]'>
                      {selectedOrder.shipping_address}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-[var(--text-muted)] mb-1'>
                      {t("Items")}
                    </p>
                    <p className='text-sm text-[var(--text-secondary)]'>
                      {selectedOrder.order_items?.length ?? 0}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {isOrderDetailsLoading ? (
              <div className='space-y-3'>
                <div className='h-6 w-40 bg-[var(--bg-secondary)] rounded animate-pulse' />
                <div className='h-4 w-full bg-[var(--bg-secondary)] rounded animate-pulse' />
                <div className='h-4 w-full bg-[var(--bg-secondary)] rounded animate-pulse' />
                <div className='h-4 w-2/3 bg-[var(--bg-secondary)] rounded animate-pulse' />
              </div>
            ) : (
              <div>
                <h4 className='text-sm font-semibold text-[var(--text-secondary)] mb-3'>
                  {t("Order Items")}
                </h4>
                <div className='space-y-3'>
                  {selectedOrder.order_items &&
                  selectedOrder.order_items.length > 0 ? (
                    selectedOrder.order_items.map((item) => {
                      const productTitle =
                        currentLang === "ar"
                          ? item.product?.name_ar || item.product?.title
                          : item.product?.title || item.product?.name_ar;
                      const qty = Number(item.quantity || 0);
                      const price = Number(item.price || 0);
                      const lineTotal = qty * price;

                      return (
                        <div
                          key={item.id}
                          className='flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]'
                        >
                          <img
                            src={item.product?.image_url || "/Logo.svg"}
                            alt={productTitle || "Order item"}
                            className='w-14 h-14 rounded bg-[var(--bg-secondary)] object-contain'
                          />

                          <div className='flex-1 min-w-0'>
                            <p className='font-semibold text-[var(--text-secondary)] truncate'>
                              {productTitle || "-"}
                            </p>
                            <p className='text-xs text-[var(--text-muted)] mt-1'>
                              {t("Qty")}: {qty}
                            </p>
                          </div>

                          <div className='text-right'>
                            <p className='text-xs text-[var(--text-muted)]'>
                              {t("Unit Price")}: ${price.toFixed(2)}
                            </p>
                            <p className='font-semibold text-[var(--text-secondary)]'>
                              ${lineTotal.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className='text-sm text-[var(--text-muted)]'>
                      {t("No order items found")}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
      <section className='max-w-7xl mx-auto px-3 sm:px-6 lg:px-8'>
        <div className='bg-[var(--bg-primary)] p-4 sm:p-6 md:p-8 lg:p-10 rounded-lg'>
          <div className='grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-8 lg:gap-10'>
            <div
              className={`${
                currentLang === "ar"
                  ? "lg:pl-8 lg:border-l border-[var(--border-color)]"
                  : "lg:pr-8 lg:border-r border-[var(--border-color)]"
              }`}
            >
              <VerticalTabs
                items={accountTabs}
                activeTab={activeSection}
                onChange={handleTabChange}
              />
            </div>
            <div>{renderSection()}</div>
          </div>
        </div>
      </section>
    </>
  );
}
