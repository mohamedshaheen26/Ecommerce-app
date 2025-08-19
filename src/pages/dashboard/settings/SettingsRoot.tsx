import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useSettings } from "../../../context/SettingsContext";
import FormField from "../../../components/common/FormField";
import Input from "../../../components/common/Input";
import toast from "react-hot-toast";
import Button from "../../../components/common/Button";
import type { ISettings } from "../../../types/setting";
import { useTranslation } from "react-i18next";
import Grid from "../../../components/common/Grid";

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
    support_email: "",
    monthly_order_goal: 0,
  });
  const { t } = useTranslation();

  useEffect(() => {
    if (!isLoading && settings) {
      setFormData({
        site_name: settings.site_name,
        site_name_ar: settings.site_name_ar,
        support_email: settings.support_email,
        monthly_order_goal: settings.monthly_order_goal,
      });
    }
  }, [settings, isLoading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const updatePromise = new Promise(async (resolve, reject) => {
      try {
        setIsSaving(true);
        await updateSettings({
          site_name: formData?.site_name,
          site_name_ar: formData?.site_name_ar,
          support_email: formData?.support_email,
          monthly_order_goal: formData?.monthly_order_goal,
        });
        resolve("Settings updated successfully");
      } catch (error) {
        reject(
          error instanceof Error ? error.message : "Failed to update settings"
        );
      } finally {
        setIsSaving(false);
      }
    });

    toast.promise(updatePromise, {
      loading: "Saving changes...",
      success: "Settings updated successfully",
      error: (err) => `Error: ${err}`,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: name === "monthly_order_goal" ? Number(value) : value,
      };
    });
  };

  return (
    <div className='bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg overflow-hidden'>
      <div className='flex justify-between items-center py-6 px-8 border-b border-[var(--border-color)]'>
        <h1 className='text-2xl font-semibold text-[var(--text-secondary)]'>
          {t("Settings")}
        </h1>
      </div>
      {contextError && (
        <div className='mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md'>
          {contextError}
        </div>
      )}

      <form onSubmit={handleSubmit} className='py-6 px-8'>
        <Grid columns={2} gap={4}>
          <FormField htmlFor='siteName' label='Site Name'>
            <Input
              id='siteName'
              name='site_name'
              type='text'
              value={formData?.site_name}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField htmlFor='siteName_ar' label='Arabic Site Name'>
            <Input
              id='siteName_ar'
              name='site_name_ar'
              type='text'
              value={formData?.site_name_ar}
              onChange={handleChange}
              required
            />
          </FormField>
        </Grid>

        <Grid columns={2} gap={4}>
          {" "}
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
        </Grid>

        <div>
          <Button type='submit' variant='primary' disabled={isSaving}>
            {isSaving ? t("Saving...") : t("Save Changes")}
          </Button>
        </div>
      </form>
    </div>
  );
}
