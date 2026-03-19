import { useTranslation } from "react-i18next";
import * as yup from "yup";
import type { ICheckoutFormValidation } from "../types/checkout";

export const getCheckoutFormSchema = () => {
  const { t } = useTranslation();

  return yup.object<ICheckoutFormValidation>({
    fullName: yup.string().required(t("validations.full_name_required")),
    phoneNumber: yup.string().required(t("validations.phone_number_required")),
    streetAddress: yup.string().required(t("validations.street_address_required")),
    orderNotes: yup.string().optional().max(255, t("validations.order_notes_max")),
  });
};
