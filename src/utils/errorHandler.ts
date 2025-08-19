import i18n from "../i18n/i18n";

type ErrorResponse = {
  code?: string;
  message?: string;
  detail?: string | null;
  hint?: string | null;
};

const columnTranslations: Record<string, string> = {
  employees_full_name_key: "Errors.EmployeesFullName",
  employees_name_ar_key: "Errors.EmployeesNameAr",
  employees_username_key: "Errors.Username",
  employees_email_key: "Errors.Email",
  categories_name_key: "Errors.CategoryName",
  categories_name_ar_key: "Errors.CategoryNameAr",
  products_title_key: "Errors.ProductName",
  products_name_ar_key: "Errors.ProductNameAr",
};

export function handleError(error: ErrorResponse): string {
  if (error.code === "23505" && error.message) {
    const columnKey = Object.keys(columnTranslations).find((key) =>
      error.message!.includes(key)
    );

    if (columnKey) {
      return `${i18n.t(columnTranslations[columnKey])} ${i18n.t("Errors.AlreadyExists")}`;
    }

    return i18n.t("Errors.DuplicateValue");
  }

  if (error.code === "23503") {
    return i18n.t("Errors.RelatedDataExists");
  }

  if (error.code === "23514") {
    return i18n.t("Errors.CheckConstraintFailed");
  }

  return i18n.t("Errors.UnexpectedError");
}
