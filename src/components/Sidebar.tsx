import { NavLink } from 'react-router-dom';
import { 
  MdDashboard, 
  MdInventory, 
  MdShoppingCart, 
  MdPeople,
  MdStarBorder,
  MdSettings,
  MdAdd
} from 'react-icons/md';

export default function Sidebar() {
  return (
    <div className="bg-white w-64 min-h-screen p-4 border-r border-gray-200">
      <div className="mb-8 px-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold">A</span>
          </div>
          <span className="text-xl font-semibold">Admin</span>
        </div>
      </div>
      
      <nav className="space-y-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `
            flex items-center px-4 py-2.5 text-sm font-medium rounded-lg
            ${isActive 
              ? 'bg-gray-100 text-gray-900' 
              : 'text-gray-600 hover:bg-gray-50'
            }
          `}
        >
          <MdDashboard className="w-5 h-5 mr-3" />
          Dashboard
        </NavLink>

        <NavLink
          to="/dashboard/products"
          className={({ isActive }) => `
            flex items-center px-4 py-2.5 text-sm font-medium rounded-lg
            ${isActive 
              ? 'bg-gray-100 text-gray-900' 
              : 'text-gray-600 hover:bg-gray-50'
            }
          `}
        >
          <MdInventory className="w-5 h-5 mr-3" />
          Products
        </NavLink>

        <NavLink
          to="/dashboard/orders"
          className={({ isActive }) => `
            flex items-center px-4 py-2.5 text-sm font-medium rounded-lg
            ${isActive 
              ? 'bg-gray-100 text-gray-900' 
              : 'text-gray-600 hover:bg-gray-50'
            }
          `}
        >
          <MdShoppingCart className="w-5 h-5 mr-3" />
          Orders
        </NavLink>

        <NavLink
          to="/dashboard/customers"
          className={({ isActive }) => `
            flex items-center px-4 py-2.5 text-sm font-medium rounded-lg
            ${isActive 
              ? 'bg-gray-100 text-gray-900' 
              : 'text-gray-600 hover:bg-gray-50'
            }
          `}
        >
          <MdPeople className="w-5 h-5 mr-3" />
          Customers
        </NavLink>

        <NavLink
          to="/dashboard/reviews"
          className={({ isActive }) => `
            flex items-center px-4 py-2.5 text-sm font-medium rounded-lg
            ${isActive 
              ? 'bg-gray-100 text-gray-900' 
              : 'text-gray-600 hover:bg-gray-50'
            }
          `}
        >
          <MdStarBorder className="w-5 h-5 mr-3" />
          Reviews
        </NavLink>

        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) => `
            flex items-center px-4 py-2.5 text-sm font-medium rounded-lg
            ${isActive 
              ? 'bg-gray-100 text-gray-900' 
              : 'text-gray-600 hover:bg-gray-50'
            }
          `}
        >
          <MdSettings className="w-5 h-5 mr-3" />
          Settings
        </NavLink>

        <div className="pt-4 mt-4 border-t border-gray-200">
          <button className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg w-full">
            <MdAdd className="w-5 h-5 mr-3" />
            Extras
          </button>
        </div>
      </nav>
    </div>
  );
} 