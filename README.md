# 🛒 NovaStore - E-Commerce Platform

NovaStore is a modern, full-featured e-commerce platform built with **React**, **TypeScript**, **Vite**, and **Supabase**, and it includes a dedicated customer-facing **storefront** plus an admin dashboard for managing products, categories, orders, customers, employees, and reviews.

## ✨ Features

- **📊 Dashboard**: Real-time analytics and insights with charts
- **🏷️ Products Management**: Create, read, update, and delete products with images, colors, and sizes
- **📂 Categories**: Organize products into categories
- **👥 Customers**: View and manage customer information
- **📦 Orders**: Track and manage customer orders with status updates
- **👨‍💼 Employees**: Manage team members with role-based permissions
- **⭐ Reviews**: Monitor and manage product reviews
- **⚙️ Settings**: Configure system settings and preferences

### Advanced Features

- **🔐 Role-Based Access Control**: Admin and Employee roles with different permissions
- **🌍 Multi-Language Support**: Bilingual interface (English & Arabic) with RTL/LTR support
- **🎨 Theme System**: Light/Dark mode support with customizable themes
- **📱 Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **🔔 Notifications**: Real-time notifications with toast messages
- **🔑 Authentication**: Secure login with Supabase
- **📊 Data Visualization**: Charts and graphs for analytics
- **🚀 Performance Optimized**: Virtual scrolling for large datasets
- **⚙️ Admin Utility APIs**: User admin operations via local Express endpoints and Vercel serverless functions (`change-password`, `delete-user`)

## 🆕 New Features (Latest Update)

- **🛍️ Client Storefront**: Public pages for home, product listing, product details, cart, checkout, favorites, about, and contact
- **🧭 Expanded Routing**: Dedicated `ClientLayout` for storefront routes and protected `MainLayout` for dashboard routes
- **🔒 Improved Route Protection**: Role-based guards for dashboard modules (Admin and Employee permissions)
- **🌐 Better Language UX**: Automatic document `lang` and `dir` switching for English/Arabic
- **🔔 Global Notifications**: Unified toast notifications across app sections

## 🛠️ Tech Stack

### Frontend

- **React 19** - Latest React framework
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hook Form** - Efficient form management
- **Material-UI (MUI)** - Component library
- **React Hot Toast** - Toast notifications

### Backend & APIs

- **Supabase** - PostgreSQL database & authentication
- **Axios** - HTTP client for API calls
- **Express.js** - Backend server (API proxy)

### Additional Libraries

- **i18next** - Internationalization (English & Arabic)
- **Chart.js** - Data visualization
- **React Context API** - Global state management
- **React Virtuoso** - Virtual scrolling for performance

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Supabase** account
- **.env** file with Supabase credentials

## 🚀 Getting Started

### 1. Installation

```bash
npm install
cd api && npm install && cd ..
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Create a `.env` file in the `api` directory:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Development

```bash
# Run both frontend and backend concurrently
npm run dev:full

# Or run separately:
npm run dev      # Frontend (Terminal 1)
npm run server   # Backend (Terminal 2)
```

The app will open at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```text
src/
├── api/              # API endpoints
├── components/       # Reusable components
├── context/          # React Context (Auth, Theme, Language)
├── pages/            # Page components (auth, client, dashboard)
├── hooks/            # Custom React hooks
├── layouts/          # Layout components
├── routes/           # Routing configuration
├── types/            # TypeScript definitions
├── utils/            # Utility functions
├── validation/       # Form validation schemas
├── i18n/             # Internationalization setup
└── locales/          # Translation files (en.json, ar.json)

api/                  # Vercel serverless handlers
server.js             # Local Express admin utility server
```

## 🔐 Authentication & Authorization

- **Admin**: Full access to all features and settings
- **Employee**: Limited access (Dashboard, Products, Categories, Employees)

Routes are protected using the `ProtectedRoute` component.

## 🌍 Multi-Language Support

The app supports English and Arabic with automatic direction switching (LTR/RTL). Translation files are located in `src/locales/`.

## 🎨 Theme Support

Switch between light and dark themes. Theme definitions are in `src/styles/themes.ts`.

## 📊 API Routes

- **Products**: `GET|POST|PUT|DELETE /api/products`
- **Categories**: `GET|POST|PUT|DELETE /api/categories`
- **Orders**: `GET /api/orders`, `GET|PUT /api/orders/:id`
- **Customers**: `GET /api/customers`, `GET /api/customers/:id`
- **Employees**: `GET|POST|PUT|DELETE /api/employees`
- **Dashboard**: `GET /api/dashboard`

### Additional Admin Utility Routes

- **Local Express**: `POST /change-password`, `POST /delete-user`
- **Vercel Functions**: `POST /api/change-password`, `POST /api/delete-user`

## 🧪 Available Scripts

```bash
npm run dev          # Start development server
npm run server       # Start backend Express server
npm run dev:full     # Run frontend and backend concurrently
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🚢 Deployment

### Vercel

```bash
npm run build
vercel deploy
```

### Other Platforms

1. Build: `npm run build`
2. Deploy the `dist/` folder
3. Set environment variables

## 🐛 Troubleshooting

- **Port in use**: `npm run dev -- --port 3000`
- **API Proxy**: Ensure Express server is running on port 3001
- **Supabase**: Verify `.env` credentials and RLS policies

## 📝 License

MIT License

## 👨‍💻 Author

**Mohamed Shaheen**

---

**Built with ❤️ using React, TypeScript, and Vite**
