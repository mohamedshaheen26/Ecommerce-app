import i18n from "../i18n/i18n";

export const formatDate = (dateString: string) => {
  if (!dateString) return "";

  return new Date(dateString).toLocaleDateString(i18n.language, {
    year: "numeric",
    month: "long", 
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};