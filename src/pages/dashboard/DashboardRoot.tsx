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
  const [stats, setStats] = useState<IDashboardStats>({
    totalSales: 0,
    customers: 0,
    orders: 0,
    bestSelling: [],
    recentOrders: [],
  });

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
        borderColor: "rgb(59, 130, 246)",
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
        borderColor: "rgb(59, 130, 246)",
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
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
      </div>
    );
  }

  const monthlyGoal = settings.monthly_order_goal || 1000;
  const ordersLeft = Math.max(monthlyGoal - stats.orders, 0);
  const ordersProgress = Math.min((stats.orders / monthlyGoal) * 100, 100);

  const dashboardOrderColumns = [
    {
      header: "Order",
      accessor: (row: IRecentOrder) => (
        <div className='text-sm font-medium text-gray-900'>
          {row.id.slice(0, 8)}
        </div>
      ),
    },
    {
      header: "Date",
      accessor: (row: IRecentOrder) => (
        <div className='text-sm text-gray-500'>{row.created_at}</div>
      ),
    },
    {
      header: "Total",
      accessor: (row: IRecentOrder) => (
        <div className='text-sm text-gray-500'>${row.total.toFixed(2)}</div>
      ),
    },
    {
      header: "Status",
      accessor: (row: IRecentOrder) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.status === "Completed"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
        {/* Total Sales Card */}
        <div className='bg-white p-6 border border-gray-200 rounded-lg overflow-hidden'>
          <div className='flex justify-between mb-4'>
            <div>
              <h3 className='text-md text-black font-semibold'>Total Sales</h3>
              <p className='text-gray-400 text-xs mt-1'>THIS MONTH</p>
            </div>
            <p className='text-2xl font-semibold mt-2'>
              $ {stats.totalSales.toLocaleString()}
            </p>
          </div>
          <div className='h-34'>
            <Line data={salesData} options={chartOptions} />
          </div>
        </div>

        {/* Customers Card */}
        <div className='bg-white p-6 border border-gray-200 rounded-lg overflow-hidden'>
          <div className='flex justify-between mb-4'>
            <div>
              <h3 className='text-md text-black font-semibold'>Customers</h3>
              <p className='text-gray-400 text-xs mt-1'>THIS MONTH</p>
            </div>
            <p className='text-2xl font-semibold mt-2'>
              {stats.customers.toLocaleString()}
            </p>
          </div>
          <div className='h-34'>
            <Line data={customersData} options={chartOptions} />
          </div>
        </div>

        {/* Orders Card */}
        <div className='bg-white p-6 border border-gray-200 rounded-lg overflow-hidden flex flex-col justify-between'>
          <div className='flex justify-between mb-4'>
            <div>
              <h3 className='text-md text-black font-semibold'>Orders</h3>
              <p className='text-gray-400 text-xs mt-1'>
                MONTHLY GOALS: {monthlyGoal.toLocaleString()}
              </p>
            </div>
            <p className='text-2xl font-semibold mt-2'>
              {stats.orders.toLocaleString()}
            </p>
          </div>
          <div className=''>
            <p className='text-sm text-gray-500 mb-2'>{ordersLeft} Left</p>
            <div className='h-2 bg-gray-100 rounded-full'>
              <div
                className='h-2 bg-blue-500 rounded-full'
                style={{ width: `${ordersProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Best Selling Products */}
        <div className='md:col-span-1 bg-white border border-gray-200 rounded-lg overflow-hidden'>
          <div className='p-6 border-b border-gray-200 pb-4'>
            <h3 className='text-md text-black font-semibold'>Best Selling</h3>
            <p className='text-gray-400 text-xs mt-1'>THIS MONTH</p>
          </div>
          <div className='p-6'>
            <p className='text-2xl font-semibold mt-2'>
              $2,400 -{" "}
              <span className='text-gray-500 text-sm'>Total Sales</span>
            </p>
          </div>
          <div className='p-6 space-y-3'>
            {stats.bestSelling.map((product, index) => (
              <div
                key={index}
                className='py-1 px-5 border border-gray-200 w-fit rounded-full'
              >
                <span className='text-sm text-gray-600'>{product.title}</span>
                <span className='text-sm text-gray-500 mx-2'>-</span>
                <span className='text-sm text-gray-[#5C5F6A] font-semibold'>
                  ${product.sales_count} Sales
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className='md:col-span-2 bg-white border border-gray-200 rounded-lg overflow-hidden'>
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <h3 className='text-md text-black font-semibold'>Recent Orders</h3>
            <Button
              variant='outline'
              className='text-blue-500 hover:text-blue-600'
              onClick={() => navigate("/orders")}
            >
              View All
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
