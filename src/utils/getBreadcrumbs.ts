export const getBreadcrumbs = () => {
  const paths = location.pathname.split("/").filter(Boolean);

  if (paths.length === 0) return [{ name: "Dashboard", path: "/" }];

  return paths.map((path, index) => ({
    name: path.charAt(0).toUpperCase() + path.slice(1),
    path: "/" + paths.slice(0, index + 1).join("/"),
  }));
};