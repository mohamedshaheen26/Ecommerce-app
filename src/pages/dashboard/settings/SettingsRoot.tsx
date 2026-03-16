import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Button from "../../../components/common/Button";
import FormField from "../../../components/common/FormField";
import Grid from "../../../components/common/Grid";
import Input from "../../../components/common/Input";
import RichTextEditor from "../../../components/common/RichTextEditor";
import { useSettings } from "../../../context/SettingsContext";
import type { ISettings } from "../../../types/setting";

export default function SettingsRoot() {
  const {
    settings,
    isLoading,
    error: contextError,
    updateSettings,
  } = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ISettings>({
    site_name: "",
    site_name_ar: "",
    about_us: "",
    about_us_ar: "",
    address: "",
    address_ar: "",
    phone_number: "",
    support_email: "",
    monthly_order_goal: 0,
    first_order_discount: 0,
    free_shipping_minimum: 0,
  });
  const { t } = useTranslation();

  useEffect(() => {
    if (!isLoading && settings) {
      setFormData({
        site_name: settings.site_name,
        site_name_ar: settings.site_name_ar,
        about_us: settings.about_us,
        about_us_ar: settings.about_us_ar,
        address: settings.address,
        address_ar: settings.address_ar,
        phone_number: settings.phone_number,
        support_email: settings.support_email,
        monthly_order_goal: settings.monthly_order_goal,
        first_order_discount: settings.first_order_discount,
        free_shipping_minimum: settings.free_shipping_minimum,
      });
    }
  }, [settings, isLoading]);

  const discountError =
    formData.first_order_discount < 0
      ? t("Discount cannot be less than 0")
      : formData.first_order_discount > 100
        ? t("Discount cannot be greater than 100")
        : undefined;
  const freeShippingError =
    formData.free_shipping_minimum < 0
      ? t("Free shipping minimum cannot be less than 0")
      : undefined;
  const hasValidationErrors = !!discountError || !!freeShippingError;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (hasValidationErrors) {
      toast.error(discountError || freeShippingError || t("Invalid form data"));
      return;
    }

    const updatePromise = new Promise(async (resolve, reject) => {
      try {
        setIsSaving(true);
        await updateSettings({
          site_name: formData?.site_name,
          site_name_ar: formData?.site_name_ar,
          about_us: formData?.about_us,
          about_us_ar: formData?.about_us_ar,
          address: formData?.address,
          address_ar: formData?.address_ar,
          phone_number: formData?.phone_number,
          support_email: formData?.support_email,
          monthly_order_goal: formData?.monthly_order_goal,
          first_order_discount: formData?.first_order_discount,
          free_shipping_minimum: formData?.free_shipping_minimum,
        });
        resolve("Settings updated successfully");
      } catch (error) {
        reject(
          error instanceof Error ? error.message : "Failed to update settings",
        );
      } finally {
        setIsSaving(false);
      }
    });

    toast.promise(updatePromise, {
      loading: t("Saving changes"),
      success: `${t("Settings updated successfully")}`,
      error: (err) => `Error: ${err}`,
    });
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]:
          name === "monthly_order_goal" ||
          name === "first_order_discount" ||
          name === "free_shipping_minimum"
            ? Number(value)
            : value,
      };
    });
  };

  const handleRichTextChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className='space-y-5'>
      <div className='bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg overflow-hidden'>
        <div className='py-5 px-6 border-b border-[var(--border-color)]'>
          <h1 className='text-2xl font-semibold text-[var(--text-secondary)]'>
            {t("Settings")}
          </h1>
          <p className='text-sm text-[var(--text-muted)] mt-1'>
            {t("Manage your store information and commerce rules")}
          </p>
        </div>
      </div>

      {contextError && (
        <div className='p-4 bg-red-50 border border-red-200 text-red-700 rounded-md'>
          {contextError}
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-5'>
        <div className='bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg p-6'>
          <h2 className='text-lg font-semibold text-[var(--text-secondary)] mb-4'>
            {t("Store Identity")}
          </h2>
          <Grid columns={{ default: 1, md: 2 }} gap={4}>
            <FormField htmlFor='siteName_ar' label='Site Name'>
              <Input
                id='siteName_ar'
                name='site_name_ar'
                type='text'
                value={formData?.site_name_ar}
                onChange={handleChange}
                required
              />
            </FormField>
            <FormField htmlFor='siteName' label='Site Name Second Language'>
              <Input
                id='siteName'
                name='site_name'
                type='text'
                value={formData?.site_name}
                onChange={handleChange}
                required
              />
            </FormField>

            <FormField htmlFor='aboutUs' label='About Us'>
              <RichTextEditor
                id='aboutUs'
                name='about_us'
                placeholder={t("About Us")}
                value={formData?.about_us}
                onChange={handleRichTextChange}
                required
              />
            </FormField>
            <FormField htmlFor='aboutUsAr' label='About Us Second Language'>
              <RichTextEditor
                id='aboutUsAr'
                name='about_us_ar'
                value={formData?.about_us_ar}
                onChange={handleRichTextChange}
                required
              />
            </FormField>
          </Grid>
        </div>

        <div className='bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg p-6'>
          <h2 className='text-lg font-semibold text-[var(--text-secondary)] mb-4'>
            {t("Contact")}
          </h2>
          <Grid columns={{ default: 1, md: 2 }} gap={4}>
            <FormField htmlFor='supportEmail' label='Support Email'>
              <Input
                id='supportEmail'
                name='support_email'
                type='email'
                value={formData?.support_email}
                onChange={handleChange}
                required
              />
            </FormField>
            <FormField htmlFor='phoneNumber' label='Phone number'>
              <Input
                id='phoneNumber'
                name='phone_number'
                type='text'
                value={formData?.phone_number}
                onChange={handleChange}
                required
              />
            </FormField>
            <FormField htmlFor='address' label='Address'>
              <Input
                id='address'
                name='address'
                type='text'
                value={formData?.address}
                onChange={handleChange}
                required
              />
            </FormField>
            <FormField htmlFor='address_ar' label='Address Second Language'>
              <Input
                id='address_ar'
                name='address_ar'
                type='text'
                value={formData?.address_ar}
                onChange={handleChange}
                required
              />
            </FormField>
          </Grid>
        </div>

        <div className='bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg p-6'>
          <h2 className='text-lg font-semibold text-[var(--text-secondary)] mb-4'>
            {t("Commerce Rules")}
          </h2>
          <Grid columns={{ default: 1, md: 2 }} gap={4}>
            <FormField htmlFor='monthlyOrderGoal' label='Monthly Order Goal'>
              <Input
                id='monthlyOrderGoal'
                name='monthly_order_goal'
                type='number'
                value={formData?.monthly_order_goal}
                onChange={handleChange}
                required
                min='1'
              />
            </FormField>
            <FormField
              htmlFor='firstOrderDiscount'
              label='First Order Discount'
            >
              <Input
                id='firstOrderDiscount'
                name='first_order_discount'
                type='number'
                value={formData?.first_order_discount}
                onChange={handleChange}
                required
                min='0'
                max='100'
                className='text-sm text-[var(--text-muted)]'
                error={discountError}
              />
            </FormField>
            <FormField
              htmlFor='freeShippingMinimum'
              label='Free Shipping Minimum'
            >
              <Input
                id='freeShippingMinimum'
                name='free_shipping_minimum'
                type='number'
                value={formData?.free_shipping_minimum}
                onChange={handleChange}
                required
                className='text-sm text-[var(--text-muted)]'
                error={freeShippingError}
              />
            </FormField>
          </Grid>
        </div>

        <div className='bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg p-4 flex items-center justify-end'>
          <Button
            type='submit'
            variant='primary'
            disabled={isSaving || hasValidationErrors}
          >
            {isSaving ? t("Saving...") : t("Save Changes")}
          </Button>
        </div>
      </form>
    </div>
  );
}
