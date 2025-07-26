import Button from "../components/common/Button";
import { useNavigate } from "react-router-dom";
import { MdMenu, MdLogout } from "react-icons/md";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Generate breadcrumbs from current location
  const getBreadcrumbs = () => {
    const paths = location.pathname.split("/").filter(Boolean);
    return paths.map((path, index) => ({
      name: path.charAt(0).toUpperCase() + path.slice(1),
      path: "/" + paths.slice(0, index + 1).join("/"),
    }));
  };

  const breadcrumbs = getBreadcrumbs();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className='sticky top-0 z-10'>
      <div className='flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8'>
        {/* Left section with menu button and breadcrumbs */}
        <div className='flex items-center gap-4'>
          <button
            onClick={onToggleSidebar}
            className='lg:hidden -ml-2 p-2 text-gray-500 hover:bg-gray-100 rounded-lg'
          >
            <span className='sr-only'>Open sidebar</span>
            <MdMenu className='h-6 w-6' />
          </button>

          {/* Breadcrumbs */}
          <nav className='hidden sm:flex items-center gap-2'>
            {breadcrumbs.map((item, index) => (
              <div key={item.path} className='flex items-center'>
                {index > 0 && <span className='mx-2 text-gray-400'>/</span>}
                <span
                  className={`
                      text-sm font-medium
                      ${
                        index === breadcrumbs.length - 1
                          ? "text-gray-800"
                          : "text-gray-500 hover:text-gray-700"
                      }
                    `}
                >
                  {item.name}
                </span>
              </div>
            ))}
          </nav>
        </div>

        {/* Right section with logout button */}
        <div>
          <Button
            variant='outline'
            onClick={handleLogout}
            className='flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border-none'
          >
            <MdLogout className='h-5 w-5' />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
