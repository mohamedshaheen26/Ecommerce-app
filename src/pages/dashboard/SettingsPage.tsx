import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useSettings } from '../../context/SettingsContext';
import FormField from '../../components/common/FormField';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';

export default function SettingsPage() {
  const { settings, isLoading, error: contextError, updateSettings } = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    siteName: '',
    supportEmail: '',
    monthlyOrderGoal: '1000'
  });

  useEffect(() => {
    if (!isLoading && settings) {
      setFormData({
        siteName: settings.siteName,
        supportEmail: settings.supportEmail,
        monthlyOrderGoal: settings.monthlyOrderGoal.toString()
      });
    }
  }, [settings, isLoading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Create a promise for the toast
    const updatePromise = new Promise(async (resolve, reject) => {
      try {
        setIsSaving(true);
        await updateSettings({
          siteName: formData.siteName,
          supportEmail: formData.supportEmail,
          monthlyOrderGoal: parseInt(formData.monthlyOrderGoal)
        });
        resolve('Settings updated successfully');
      } catch (error) {
        reject(error instanceof Error ? error.message : 'Failed to update settings');
      } finally {
        setIsSaving(false);
      }
    });

    // Show toast with promise
    toast.promise(updatePromise, {
      loading: 'Saving changes...',
      success: 'Settings updated successfully',
      error: (err) => `Error: ${err}`,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex justify-between items-center py-6 px-8 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
      </div>
      {contextError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {contextError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 py-6 px-8">
        <FormField label="Site Name">
          <Input
            id="siteName"
            name="siteName"
            type="text"
            value={formData.siteName}
            onChange={handleChange}
            required
          />
        </FormField>

        <FormField label="Support Email">
          <Input
            id="supportEmail"
            name="supportEmail"
            type="email"
            value={formData.supportEmail}
            onChange={handleChange}
            required
          />
        </FormField>

        <FormField label="Monthly Order Goal">
          <Input
            id="monthlyOrderGoal"
            name="monthlyOrderGoal"
            type="number"
            value={formData.monthlyOrderGoal}
            onChange={handleChange}
            required
            min="1"
          />
        </FormField>

        <div>
          <Button
            type="submit"
            variant='secondary'
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
} 