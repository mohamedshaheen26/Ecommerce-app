import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { useSettings } from "../../context/SettingsContext";
import Table from "../../components/common/Table";
import type { IDashboardStats, IRecentOrder } from "../../types/dashboard";
import {
  getBestSellingProducts,
  getCustomerCount,
  getOrderCountCurrentMonth,
  getRecentOrders,
  getTotalSalesCurrentMonth,
} from "../../api/dashboard";
import { getStatusColor } from "../../utils/orderStatus";
import Loader from "../../components/common/Loader";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";
import { formatDate } from "../../utils/formatDate";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DashboardRoot() {
  const navigate = useNavigate();
  const { settings, isLoading: settingsLoading } = useSettings();
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const [stats, setStats] = useState<IDashboardStats>({
    totalSales: 0,
    customers: 0,
    orders: 0,
    bestSelling: [],
    recentOrders: [],
  });
  const { currentLang } = useLanguage();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [totalSales, customers, orders, bestSelling, recentOrders] =
        await Promise.all([
          getTotalSalesCurrentMonth(),
          getCustomerCount(),
          getOrderCountCurrentMonth(),
          getBestSellingProducts(),
          getRecentOrders(),
        ]);

      setStats({
        totalSales,
        customers,
        orders,
        bestSelling,
        recentOrders,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const salesData = {
    labels: Array.from({ length: 30 }, (_, i) => i + 1),
    datasets: [
      {
        label: "Sales",
        data: Array.from(
          { length: 30 },
          () => Math.floor(Math.random() * 200) + 100
        ),
        borderColor: "#714b67",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const customersData = {
    labels: Array.from({ length: 30 }, (_, i) => i + 1),
    datasets: [
      {
        label: "Customers",
        data: Array.from(
          { length: 30 },
          () => Math.floor(Math.random() * 100) + 50
        ),
        borderColor: "#714b67",
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
    maintainAspectRatio: false,
  };

  if (loading || settingsLoading) {
    return <Loader />;
  }

  const monthlyGoal = settings.monthly_order_goal || 1000;
  const ordersLeft = Math.max(monthlyGoal - stats.orders, 0);
  const ordersProgress = Math.min((stats.orders / monthlyGoal) * 100, 100);

  const dashboardOrderColumns = [
    {
      header: t("Order"),
      accessor: (row: IRecentOrder) => (
        <div className='text-sm font-medium text-[var(--text-secondary)]'>
          {row.id.slice(0, 8)}
        </div>
      ),
    },
    {
      header: t("Date"),
      accessor: (row: IRecentOrder) => (
        <div className='text-sm text-[var(--text-secondary)]'>
          {formatDate(row.created_at || "")}
        </div>
      ),
    },
    {
      header: t("Total"),
      accessor: (row: IRecentOrder) => (
        <div className='text-sm text-[var(--text-secondary)]'>
          ${row.total.toFixed(2)}
        </div>
      ),
    },
    {
      header: t("Status"),
      accessor: (row: IRecentOrder) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
            row.status
          )}`}
        >
          {t(`statuses.${row.status}`)}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
        {/* Total Sales Card */}
        <div className='bg-[var(--bg-primary)] p-6 border border-[var(--border-color)] rounded-lg overflow-hidden'>
          <div className='flex justify-between mb-4'>
            <div>
              <h3 className='text-md text-[var(--text-secondary)] font-semibold'>
                {t("Total Sales")}
              </h3>
              <p className='text-[var(--text-muted)] text-xs mt-1'>
                {t("THIS MONTH")}
              </p>
            </div>
            <p className='text-[var(--text-secondary)] text-2xl font-semibold mt-2'>
              ${stats.totalSales.toLocaleString()}
            </p>
          </div>
          <div className='h-34'>
            <Line data={salesData} options={chartOptions} />
          </div>
        </div>

        {/* Customers Card */}
        <div className='bg-[var(--bg-primary)] p-6 border border-[var(--border-color)] rounded-lg overflow-hidden'>
          <div className='flex justify-between mb-4'>
            <div>
              <h3 className='text-md text-[var(--text-secondary)] font-semibold'>
                {t("Customers")}
              </h3>
              <p className='text-[var(--text-muted)] text-xs mt-1'>
                {t("THIS MONTH")}
              </p>
            </div>
            <p className='text-[var(--text-secondary)] text-2xl font-semibold mt-2'>
              {stats.customers.toLocaleString()}
            </p>
          </div>
          <div className='h-34'>
            <Line data={customersData} options={chartOptions} />
          </div>
        </div>

        {/* Orders Card */}
        <div className='bg-[var(--bg-primary)] p-6 border border-[var(--border-color)] rounded-lg overflow-hidden flex flex-col justify-between'>
          <div className='flex justify-between mb-4'>
            <div>
              <h3 className='text-md text-[var(--text-secondary)] font-semibold'>
                {t("Orders")}
              </h3>
              <p className='text-[var(--text-muted)] text-xs mt-1'>
                {t("MONTHLY GOALS")}: {monthlyGoal.toLocaleString()}
              </p>
            </div>
            <p className='text-[var(--text-secondary)] text-2xl font-semibold mt-2'>
              {stats.orders.toLocaleString()}
            </p>
          </div>
          <div className=''>
            <p className='text-sm text-[var(--text-muted)] mb-2'>
              {ordersLeft} {t("Left")}
            </p>
            <div className='h-2 bg-gray-100 rounded-full'>
              <div
                className='h-2 bg-[var(--accent-primary)] rounded-full'
                style={{ width: `${ordersProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Best Selling Products */}
        <div className='md:col-span-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg overflow-hidden'>
          <div className='p-6 border-b border-[var(--border-color)] pb-4'>
            <h3 className='text-md text-[var(--text-secondary)] font-semibold'>
              {t("Best Selling")}
            </h3>
            <p className='text-[var(--text-muted)] text-xs mt-1'>
              {t("THIS MONTH")}
            </p>
          </div>
          <div className='p-6'>
            <p className='text-[var(--text-secondary)] text-2xl font-semibold mt-2'>
              ${stats.totalSales.toLocaleString()} -{" "}
              <span className='text-[var(--text-muted)] text-sm'>
                {t("Total Sales")}
              </span>
            </p>
          </div>
          <div className='p-6 space-y-3'>
            {stats.bestSelling.map((product, index) => (
              <div
                key={index}
                className='py-1 px-5 border border-[var(--border-color)] w-fit rounded-full'
              >
                <span className='text-sm text-[var(--text-muted)]'>
                  {currentLang == "ar" ? product.name_ar : product.title}
                </span>
                <span className='text-sm text-[var(--text-muted)] mx-2'>-</span>
                <span className='text-sm text-[var(--text-secondary)] font-semibold'>
                  ${product.sales_count} {t("Sales")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className='md:col-span-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg overflow-hidden'>
          <div className='flex items-center justify-between p-6 border-b border-[var(--border-color)]'>
            <h3 className='text-md text-[var(--text-secondary)] font-semibold'>
              {t("Recent Orders")}
            </h3>
            <Button variant='primary' onClick={() => navigate("/orders")}>
              {t("View All")}
            </Button>
          </div>
          <div className='overflow-x-auto'>
            <Table
              data={stats.recentOrders}
              columns={dashboardOrderColumns}
              isLoading={loading}
            />
          </div>
        </div>
      </div>
    </>
  );
}
