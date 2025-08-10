import * as yup from "yup";
import { type ICategoryValidation } from "../types";

export const categorySchema: yup.ObjectSchema<ICategoryValidation> = yup.object({
  name: yup.string().required("Name is required."),
  description: yup.string().required("Description is required."),
});