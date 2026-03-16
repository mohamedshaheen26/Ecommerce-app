import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

interface BreadcrumbsComponentsProps {
  path: string;
  productName?: string;
  title?: string;
  className?: string;
}

export default function BreadcrumbsComponents({
  path,
  productName,
  title,
  className,
}: BreadcrumbsComponentsProps) {
  const { t } = useTranslation();
  const pathParts = path
    .split("/")
    .map((item) => item.trim())
    .filter(Boolean);

  const breadcrumbs = pathParts.map((item, index) => ({
    name: item.charAt(0).toUpperCase() + item.slice(1),
    path: "/" + pathParts.slice(0, index + 1).join("/"),
  }));

  if (productName?.trim()) {
    breadcrumbs.push({
      name: productName,
      path: "#",
    });
  }
  console.log(breadcrumbs);

  return (
    <div
      className={`mb-4 ${title ? "bg-[var(--bg-secondary)]" : ""} ${className}`}
    >
      <div
        className={` ${title ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" : ""}`}
      >
        {title && (
          <h2 className='text-xl sm:text-2xl font-semibold text-[var(--text-secondary)] mb-2'>
            {t(title)}
          </h2>
        )}
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize='small' />}
          aria-label='breadcrumb'
        >
          {breadcrumbs.map((item, index) =>
            index !== breadcrumbs.length - 1 ? (
              <Link
                key={item.path}
                underline='hover'
                href={item.name === "NovaStore" ? "/" : item.path}
                className='!text-[var(--text-muted)]'
              >
                {t(item.name)}
              </Link>
            ) : (
              <Typography
                key={item.name}
                className='text-[var(--text-secondary)]'
              >
                {t(item.name)}
              </Typography>
            ),
          )}
        </Breadcrumbs>
      </div>
    </div>
  );
}
