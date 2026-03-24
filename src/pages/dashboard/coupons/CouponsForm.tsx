import { useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { createCoupon, updateCoupon } from "../../../api/coupons";
import FormField from "../../../components/common/FormField";
import Grid from "../../../components/common/Grid";
import Input from "../../../components/common/Input";
import Modal from "../../../components/common/Modal";
import Select from "../../../components/common/Select";
import { useYupForm } from "../../../hooks/useYupForm";
import {
  DiscountType,
  type ICoupon,
  type ICouponValidation,
} from "../../../types";
import { handleError } from "../../../utils/errorHandler";
import { formatForDatetimeLocal } from "../../../utils/formatForDatetimeLocal";
import { getCouponSchema } from "../../../validation/couponSchema";

interface CouponsFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCoupon: ICoupon | null;
}

export default function CouponsForm({
  isOpen,
  onClose,
  onSuccess,
  editingCoupon,
}: CouponsFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useYupForm<ICouponValidation>(getCouponSchema() as any, {
    code: editingCoupon?.code ?? "",
    discount_type: editingCoupon?.discount_type ?? DiscountType.PERCENTAGE,
    discount_value: editingCoupon?.discount_value ?? 0,
    min_order_amount: editingCoupon?.min_order_amount ?? 0,
    max_discount_amount: editingCoupon?.max_discount_amount ?? 0,
    usage_limit: editingCoupon?.usage_limit ?? 0,
    starts_at: editingCoupon?.starts_at
      ? formatForDatetimeLocal(new Date(editingCoupon.starts_at))
      : formatForDatetimeLocal(new Date()),
    expires_at: editingCoupon?.expires_at
      ? formatForDatetimeLocal(new Date(editingCoupon.expires_at))
      : formatForDatetimeLocal(new Date()),
  });
  const discountType = watch("discount_type");

  useEffect(() => {
    if (isOpen) {
      reset({
        code: editingCoupon?.code ?? "",
        discount_type: editingCoupon?.discount_type ?? DiscountType.PERCENTAGE,
        discount_value: editingCoupon?.discount_value ?? 0,
        min_order_amount: editingCoupon?.min_order_amount ?? 0,
        max_discount_amount: editingCoupon?.max_discount_amount ?? 0,
        usage_limit: editingCoupon?.usage_limit ?? 0,
        starts_at: editingCoupon?.starts_at
          ? formatForDatetimeLocal(new Date(editingCoupon.starts_at))
          : formatForDatetimeLocal(new Date()),
        expires_at: editingCoupon?.expires_at
          ? formatForDatetimeLocal(new Date(editingCoupon.expires_at))
          : formatForDatetimeLocal(new Date()),
      });
    }
  }, [editingCoupon, isOpen, reset]);

  const onSubmit = async (data: ICouponValidation) => {
    try {
      const payload = {
        ...data,
        starts_at: new Date(data.starts_at).toISOString(),
        expires_at: new Date(data.expires_at).toISOString(),
      };

      if (editingCoupon?.id) {
        await updateCoupon(editingCoupon.id, payload);
        toast.success(t("Coupon updated successfully"));
      } else {
        await createCoupon(payload);
        toast.success(t("Coupon created successfully"));
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
      title={editingCoupon ? "Edit Coupon" : "Add New Coupon"}
      maxWidth='max-w-2xl'
      isSubmitting={isSubmitting}
      confirmText={editingCoupon ? "Update" : "Create"}
    >
      <Grid columns={{ default: 1, md: 2 }}>
        <FormField
          htmlFor='code'
          label='Code'
          required
          error={errors.code?.message}
        >
          <Input id='code' {...register("code")} />
        </FormField>
        <FormField
          htmlFor='discount_type'
          label='Discount Type'
          required
          error={errors.discount_type?.message}
        >
          <Select
            id='discount_type'
            {...register("discount_type")}
            options={[
              { value: DiscountType.PERCENTAGE, label: t("Percentage") },
              { value: DiscountType.FIXED, label: t("Fixed") },
            ]}
          />
        </FormField>
      </Grid>

      <Grid columns={{ default: 1, md: 2 }}>
        <FormField
          htmlFor='discount_value'
          label='Discount Value'
          required
          error={errors.discount_value?.message}
        >
          <Input
            id='discount_value'
            type='number'
            min='0'
            step='any'
            {...register("discount_value")}
          />
        </FormField>
        <FormField
          htmlFor='min_order_amount'
          label='Min Order Amount'
          required
          error={errors.min_order_amount?.message}
        >
          <Input
            id='min_order_amount'
            type='number'
            min='1'
            step='1'
            {...register("min_order_amount")}
          />
        </FormField>

        {discountType === DiscountType.PERCENTAGE && (
          <FormField
            htmlFor='max_discount_amount'
            label='Max Discount Amount'
            required
            error={errors.max_discount_amount?.message}
          >
            <Input
              id='max_discount_amount'
              type='number'
              min='0'
              step='any'
              {...register("max_discount_amount")}
            />
          </FormField>
        )}
        <FormField
          htmlFor='usage_limit'
          label='Usage Limit'
          required
          error={errors.usage_limit?.message}
        >
          <Input
            id='usage_limit'
            type='number'
            min='0'
            step='1'
            {...register("usage_limit")}
          />
        </FormField>
      </Grid>
      <Grid columns={{ default: 1, md: 2 }}>
        <FormField
          htmlFor='starts_at'
          label='Starts Date'
          required
          error={errors.starts_at?.message}
        >
          <Input
            id='starts_at'
            type='datetime-local'
            {...register("starts_at")}
          />
        </FormField>
        <FormField
          htmlFor='expires_at'
          label='Expires Date'
          required
          error={errors.expires_at?.message}
        >
          <Input
            id='expires_at'
            type='datetime-local'
            {...register("expires_at")}
          />
        </FormField>
      </Grid>
    </Modal>
  );
}
