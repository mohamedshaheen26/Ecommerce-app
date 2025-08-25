import * as yup from "yup";
import { StockStatus, type IProductValidation } from "../types";

import { useTranslation } from "react-i18next";

export const getProductSchema = () => {
  const { t } = useTranslation();
  return yup.object<IProductValidation>({
    title: yup.string().required(t("validations.name_ar_required")),
    name_ar: yup.string().required(t("validations.name_required")),
    price: yup
      .number()
      .required(t("validations.price_required"))
      .min(0, t("validations.price_positive")),
    description: yup.string().default("").defined(),
    description_ar: yup.string().default("").defined(),
    category_id: yup.string().required(t("validations.category_required")),
    stock_status: yup
      .mixed<StockStatus>()
      .transform((curr, orig) => orig === "" ? undefined : curr)
      .required(t("validations.stock_required"))
      .oneOf(
        [StockStatus.IN_STOCK, StockStatus.OUT_OF_STOCK, StockStatus.LOW_STOCK],
        t("validations.stock_status_values", {
          values: `"${StockStatus.IN_STOCK}", "${StockStatus.OUT_OF_STOCK}", "${StockStatus.LOW_STOCK}"`, 
        })
      ),
    available_quantity: yup
      .number()
      .required(t("validations.stock_required"))
      .min(0, t("validations.stock_positive"))
      .integer(t("validations.stock_integer")),
    images: yup
      .array()
      .of(yup.string().url().required(t("validations.images_required")))
      .ensure()
      .required(t("validations.images_required"))
      .default([]),
    colors: yup
      .array()
      .of(yup.string().required(t("validations.colors_required")))
      .ensure()
      .required(t("validations.colors_required"))
      .default([]),
    sizes: yup
      .array()
      .of(yup.string().required(t("validations.sizes_required")))
      .ensure()
      .required(t("validations.sizes_required"))
      .default([]),
  });
};