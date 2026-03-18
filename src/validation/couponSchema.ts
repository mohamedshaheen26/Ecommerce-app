import { useTranslation } from "react-i18next";
import * as yup from "yup";
import { DiscountType, type ICouponValidation } from "../types";

export const getCouponSchema = () => {
  const { t } = useTranslation();

  return yup.object<ICouponValidation>({
    code: yup.string().required(t("validations.code_required")),
    discount_type: yup
      .string()
      .oneOf(["percentage", "fixed"], t("validations.invalid_discount_type"))
      .required(t("validations.discount_type_required")),
    discount_value: yup
      .number()
      .min(0, t("validations.must_be_positive"))
      .required(t("validations.discount_value_required")),
    min_order_amount: yup
      .number()
      .min(0, t("validations.must_be_positive"))
      .required(t("validations.min_order_amount_required")),
    max_discount_amount: yup
      .number()
      .nullable()
      .when("discount_type", {
        is: DiscountType.PERCENTAGE,
        then: (schema) =>
          schema
            .typeError(t("validations.max_discount_amount_required"))
            .required(t("validations.max_discount_amount_required")),
        otherwise: (schema) => schema.notRequired(),
      }),
    usage_limit: yup
      .number()
      .min(0, t("validations.must_be_positive"))
      .required(t("validations.usage_limit_required")),
    starts_at: yup
      .date()
      .required(t("validations.starts_at_required"))
      .min(new Date(), t("validations.starts_at_future")),
    expires_at: yup
      .date()
      .required(t("validations.expires_at_required"))
      .min(yup.ref("starts_at"), t("validations.expires_at_after_starts_at")),
    is_active: yup.boolean().default(true),
  });
};
