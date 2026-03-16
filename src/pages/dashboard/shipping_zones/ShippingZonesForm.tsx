import { useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  createShippingZone,
  updateShippingZone,
} from "../../../api/shippingZones";
import Checkbox from "../../../components/common/Checkbox";
import FormField from "../../../components/common/FormField";
import Grid from "../../../components/common/Grid";
import Input from "../../../components/common/Input";
import Modal from "../../../components/common/Modal";
import { useYupForm } from "../../../hooks/useYupForm";
import type { IShippingZone, IShippingZoneValidation } from "../../../types";
import { handleError } from "../../../utils/errorHandler";
import { getShippingZoneSchema } from "../../../validation/shippingZoneSchema";

interface ShippingZonesFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingShippingZone: IShippingZone | null;
}

export default function ShippingZonesForm({
  isOpen,
  onClose,
  onSuccess,
  editingShippingZone,
}: ShippingZonesFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useYupForm<IShippingZoneValidation>(getShippingZoneSchema() as any, {
    name: editingShippingZone?.name ?? "",
    name_ar: editingShippingZone?.name_ar ?? "",
    shipping_fee: editingShippingZone?.shipping_fee ?? 0,
    estimated_days: editingShippingZone?.estimated_days ?? 1,
    is_active: editingShippingZone?.is_active ?? true,
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: editingShippingZone?.name ?? "",
        name_ar: editingShippingZone?.name_ar ?? "",
        shipping_fee: editingShippingZone?.shipping_fee ?? 0,
        estimated_days: editingShippingZone?.estimated_days ?? 1,
        is_active: editingShippingZone?.is_active ?? true,
      });
    }
  }, [editingShippingZone, isOpen, reset]);

  const onSubmit = async (data: IShippingZoneValidation) => {
    try {
      if (editingShippingZone?.id) {
        await updateShippingZone(editingShippingZone.id, data);
        toast.success(t("Shipping Zone updated successfully"));
      } else {
        await createShippingZone(data);
        toast.success(t("Shipping Zone created successfully"));
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(handleError(error));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleSubmit(onSubmit)}
      title={
        editingShippingZone ? "Edit Shipping Zone" : "Add New Shipping Zone"
      }
      maxWidth='max-w-2xl'
      isSubmitting={isSubmitting}
      confirmText={editingShippingZone ? "Update" : "Create"}
    >
      <Grid columns={{ default: 1, md: 2 }}>
        <FormField
          htmlFor='name_ar'
          label='Name'
          required
          error={errors.name_ar?.message}
        >
          <Input id='name_ar' {...register("name_ar")} />
        </FormField>
        <FormField
          htmlFor='name'
          label='Name Second Language'
          required
          error={errors.name?.message}
        >
          <Input id='name' {...register("name")} />
        </FormField>
      </Grid>

      <Grid columns={{ default: 1, md: 2 }}>
        <FormField
          htmlFor='shipping_fee'
          label='Shipping Fee'
          required
          error={errors.shipping_fee?.message}
        >
          <Input
            id='shipping_fee'
            type='number'
            min='0'
            step='any'
            {...register("shipping_fee")}
          />
        </FormField>
        <FormField
          htmlFor='estimated_days'
          label='Estimated Delivery Days'
          required
          error={errors.estimated_days?.message}
        >
          <Input
            id='estimated_days'
            type='number'
            min='1'
            step='1'
            {...register("estimated_days")}
          />
        </FormField>
      </Grid>

      <Checkbox id='is_active' label='Active' {...register("is_active")} />
    </Modal>
  );
}
