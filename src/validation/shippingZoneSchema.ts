import { useTranslation } from "react-i18next";
import * as yup from "yup";
import type { IShippingZoneValidation } from "../types";

export const getShippingZoneSchema = () => {
  const { t } = useTranslation();

  return yup.object<IShippingZoneValidation>({
    name: yup.string().required(t("validations.name_ar_required")),
    name_ar: yup.string().required(t("validations.name_required")),
    shipping_fee: yup
      .number()
      .typeError(t("validations.shipping_fee_required"))
      .required(t("validations.shipping_fee_required"))
      .min(0, t("validations.price_positive")),
    estimated_days: yup
      .number()
      .typeError(t("validations.estimated_days_required"))
      .required(t("validations.estimated_days_required"))
      .min(1, t("validations.estimated_days_positive"))
      .integer(t("validations.stock_integer")),
    is_active: yup.boolean().default(true),
  });
};
