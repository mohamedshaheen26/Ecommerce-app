import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface BreadcrumbsComponentsProps {
  path: string;
  productName?: string;
}

export default function BreadcrumbsComponents({
  path,
  productName,
}: BreadcrumbsComponentsProps) {
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

  return (
    <Stack spacing={2}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize='small' />}
        aria-label='breadcrumb'
      >
        {breadcrumbs.map((item, index) =>
          index !== breadcrumbs.length - 1 ? (
            <Link
              key={item.path}
              underline='hover'
              href={item.path}
              className='!text-[var(--text-muted)]'
            >
              {item.name}
            </Link>
          ) : (
            <Typography
              key={item.name}
              className='text-[var(--text-secondary)]'
            >
              {item.name}
            </Typography>
          ),
        )}
      </Breadcrumbs>
    </Stack>
  );
}
