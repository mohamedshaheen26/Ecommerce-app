import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useSettings } from '../../context/SettingsContext';
import Grid from '../../components/common/Grid';
import FormField from '../../components/common/FormField';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';

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
          <button
            type="submit"
            className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving Changes...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 