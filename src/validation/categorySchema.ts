import * as yup from "yup";
import { type ICategoryValidation } from "../types";
import { useTranslation } from "react-i18next";

export const getCategorySchema = () => {
  const { t } = useTranslation();
  
  return yup.object<ICategoryValidation>({
    name: yup.string().required(t("validations.name_required")),
    name_ar: yup.string().required(t("validations.name_ar_required")),
    description: yup.string().required(t("validations.description_required")),
    description_ar: yup.string().required(t("validations.description_ar_required")),
  });
};