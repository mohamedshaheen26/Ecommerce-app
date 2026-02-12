import { useTranslation } from "react-i18next";
import * as yup from "yup";
import { type ICategoryValidation } from "../types";

export const getCategorySchema = () => {
  const { t } = useTranslation();

  return yup.object<ICategoryValidation>({
    name: yup.string().required(t("validations.name_ar_required")),
    name_ar: yup.string().required(t("validations.name_required")),
    description: yup.string().required(t("validations.description_required")),
    description_ar: yup
      .string()
      .required(t("validations.description_ar_required")),
    parent_id: yup.string().nullable().optional(),
  });
};
