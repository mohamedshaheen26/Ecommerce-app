import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import {
  FiClock,
  FiDownload,
  FiRefreshCw,
  FiSmile,
  FiTrendingDown,
  FiTrendingUp,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getDashboardStats } from "../../api/dashboard";
import Button from "../../components/common/Button";
import Table from "../../components/common/Table";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useSettings } from "../../context/SettingsContext";
import type {
  DashboardPeriod,
  IDashboardStats,
  IRecentOrder,
} from "../../types/dashboard";
import { formatDate } from "../../utils/formatDate";
import { getStatusColor } from "../../utils/orderStatus";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

function DashboardSkeleton() {
  return (
    <div className='animate-pulse'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className='bg-[var(--bg-primary)] p-6 border border-[var(--border-color)] rounded-lg'
          >
            <div className='h-4 w-24 rounded bg-[var(--bg-secondary)] mb-3' />
            <div className='h-8 w-28 rounded bg-[var(--bg-secondary)] mb-6' />
            <div className='h-28 w-full rounded bg-[var(--bg-secondary)]' />
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg p-6'>
          <div className='h-4 w-32 rounded bg-[var(--bg-secondary)] mb-4' />
          <div className='space-y-3'>
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className='h-9 w-full rounded bg-[var(--bg-secondary)]'
              />
            ))}
          </div>
        </div>

        <div className='md:col-span-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg p-6'>
          <div className='h-4 w-40 rounded bg-[var(--bg-secondary)] mb-4' />
          <div className='space-y-3'>
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className='h-10 w-full rounded bg-[var(--bg-secondary)]'
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getPercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return ((current - previous) / previous) * 100;
}

export default function DashboardRoot() {
  const navigate = useNavigate();
  const { settings, isLoading: settingsLoading } = useSettings();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [period, setPeriod] = useState<DashboardPeriod>("30d");
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const { t } = useTranslation();
  const [stats, setStats] = useState<IDashboardStats>({
    totalSales: 0,
    customers: 0,
    orders: 0,
    bestSelling: [],
    recentOrders: [],
    salesPerDay: [],
    customersPerDay: [],
  });
  const { currentLang } = useLanguage();

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const dashboardStats = await getDashboardStats(period);
      setStats(dashboardStats);
      setLastSyncedAt(new Date());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportDashboardData = () => {
    try {
      setIsExporting(true);
      const escapeCsv = (value: string | number) => {
        const stringValue = String(value ?? "");
        return `"${stringValue.replace(/"/g, '""')}"`;
      };

      const rows: string[] = [];
      rows.push(`${escapeCsv(t("Metric"))},${escapeCsv(t("Value"))}`);
      rows.push(`${escapeCsv(t("Period"))},${escapeCsv(periodLabel)}`);
      rows.push(`${escapeCsv(t("Total Sales"))},${escapeCsv(stats.totalSales)}`);
      rows.push(`${escapeCsv(t("Customers"))},${escapeCsv(stats.customers)}`);
      rows.push(`${escapeCsv(t("Orders"))},${escapeCsv(stats.orders)}`);
      rows.push("");

      rows.push(
        `${escapeCsv(t("Daily"))},${escapeCsv(t("Sales"))},${escapeCsv(t("Customers"))}`,
      );
      const maxDays = Math.max(stats.salesPerDay?.length || 0, stats.customersPerDay?.length || 0);
      for (let i = 0; i < maxDays; i += 1) {
        rows.push(
          `${escapeCsv(i + 1)},${escapeCsv(stats.salesPerDay?.[i] ?? 0)},${escapeCsv(
            stats.customersPerDay?.[i] ?? 0,
          )}`,
        );
      }
      rows.push("");

      rows.push(
        `${escapeCsv(t("Best Selling"))},${escapeCsv(t("Sales"))}`,
      );
      stats.bestSelling.forEach((item) => {
        rows.push(
          `${escapeCsv(currentLang === "ar" ? item.name_ar : item.title)},${escapeCsv(
            item.sales_count,
          )}`,
        );
      });
      rows.push("");

      rows.push(
        `${escapeCsv(t("Recent Orders"))},${escapeCsv(t("Date"))},${escapeCsv(
          t("Total"),
        )},${escapeCsv(t("Status"))}`,
      );
      stats.recentOrders.forEach((order) => {
        rows.push(
          `${escapeCsv(order.id.slice(0, 8))},${escapeCsv(
            formatDate(order.created_at || ""),
          )},${escapeCsv(order.total.toFixed(2))},${escapeCsv(t(`statuses.${order.status}`))}`,
        );
      });

      const csvContent = rows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dashboard-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const salesData = {
    labels:
      stats.salesPerDay?.map((_, i) =>
        period === "today"
          ? t("Today")
          : period === "7d"
            ? `${t("D")} ${i + 1}`
            : i + 1,
      ) || [],
    datasets: [
      {
        label: t("Sales"),
        data: stats.salesPerDay || [],
        backgroundColor: "#714b67",
        borderColor: "#714b67",
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const customersData = {
    labels:
      stats.customersPerDay?.map((_, i) =>
        period === "today"
          ? t("Today")
          : period === "7d"
            ? `${t("D")} ${i + 1}`
            : i + 1,
      ) || [],
    datasets: [
      {
        label: t("Customers"),
        data: stats.customersPerDay || [],
        backgroundColor: "#714b67",
        borderColor: "#714b67",
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const bestSellingData = {
    labels:
      stats.bestSelling?.map((i) =>
        currentLang === "ar" ? i.name_ar : i.title,
      ) || [],
    datasets: [
      {
        label: t("Customers"),
        data: stats.bestSelling?.map((p) => p.sales_count) || [],
        backgroundColor: "#714b67",
        borderColor: "#714b67",
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
        spacing: 1,
        offset: 10,
        hoverOffset: 20,
        cutout: "85%",
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

  const monthlyGoal = settings?.monthly_order_goal ?? 1000;
  const ordersLeft = Math.max(monthlyGoal - stats.orders, 0);
  const ordersProgress = Math.min((stats.orders / monthlyGoal) * 100, 100);
  const previousMonth = stats.previousMonth || {
    totalSales: 0,
    customers: 0,
    orders: 0,
  };
  const salesChange = getPercentageChange(
    stats.totalSales,
    previousMonth.totalSales,
  );
  const customersChange = getPercentageChange(
    stats.customers,
    previousMonth.customers,
  );
  const ordersChange = getPercentageChange(stats.orders, previousMonth.orders);
  const formattedLastSync = lastSyncedAt
    ? new Intl.DateTimeFormat(currentLang === "ar" ? "ar-EG" : "en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(lastSyncedAt)
    : t("Never");

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
            row.status,
          )}`}
        >
          {t(`statuses.${row.status}`)}
        </span>
      ),
    },
  ];

  const authMeta = user?.user_metadata ?? {};
  const userFullName =
    typeof authMeta.full_name === "string" ? authMeta.full_name : "";
  const userArabicName =
    typeof authMeta.name_ar === "string" ? authMeta.name_ar : "";
  const userEmail = typeof user?.email === "string" ? user.email : "";
  const emailPrefix = userEmail.includes("@")
    ? userEmail.split("@")[0]
    : userEmail;
  const displayName =
    (currentLang === "ar" ? userArabicName : userFullName) ||
    userFullName ||
    userArabicName ||
    emailPrefix ||
    t("User");
  const periodLabel =
    period === "today"
      ? t("Today")
      : period === "7d"
        ? t("7Days")
        : t("30Days");

  return (
    <>
      <div className='flex items-center justify-end mb-2 gap-3'>
        <button
          type='button'
          onClick={fetchDashboardData}
          disabled={loading}
          title={t("Sync")}
          className='inline-flex items-center gap-1 text-sm font-medium text-[var(--accent-primary)] hover:text-[var(--accent-hover)] disabled:opacity-60 cursor-pointer'
        >
          <FiRefreshCw size={12} />
        </button>
        <p className='inline-flex items-center gap-2 text-xs text-[var(--text-muted)] whitespace-nowrap'>
          <FiClock size={12} />
          {t("Last synced")}: {formattedLastSync}
        </p>
      </div>
      <div className='mb-6 rounded-xl border border-[var(--border-color)] bg-gradient-to-r from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] p-5'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <div className='mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] px-3 py-1 text-xs text-[var(--text-muted)]'>
              <FiSmile className='text-[var(--accent-primary)]' />
              {t("Dashboard Greeting Tagline")}
            </div>
            <h2 className='text-2xl font-semibold text-[var(--text-secondary)]'>
              {t("Welcome")}, {displayName}
            </h2>
            <p className='text-sm text-[var(--text-muted)]'>
              {t("Dashboard Greeting Subtitle")}
            </p>
          </div>
          <div className='mt-3 flex flex-wrap items-center gap-2'>
            <div className='inline-flex items-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] p-1'>
              {(["today", "7d", "30d"] as DashboardPeriod[]).map((option) => (
                <button
                  key={option}
                  type='button'
                  onClick={() => setPeriod(option)}
                  className={`px-3 py-1.5 text-xs rounded-md transition-all duration-500 cursor-pointer ${
                    period === option
                      ? "bg-[var(--accent-primary)] text-[var(--text-primary)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  {option === "today"
                    ? t("Today")
                    : option === "7d"
                      ? t("7Days")
                      : t("30Days")}
                </button>
              ))}
            </div>
            <button
              type='button'
              onClick={exportDashboardData}
              disabled={loading || isExporting}
              title={t("Export")}
              className='text-sm font-medium inline-flex shrink-0 items-center justify-center rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] px-2.5 py-1.5 text-[var(--text-muted)] hover:text-[var(--accent-hover)] hover:border-[var(--accent-primary)]/30 disabled:opacity-60 cursor-pointer transition-colors'
            >
              <FiDownload size={14} className='mx-1' />
              {t("Export")}
            </button>
          </div>
        </div>
      </div>

      {loading || settingsLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
            {/* Total Sales Card */}
            <div className='bg-[var(--bg-primary)] p-6 border border-[var(--border-color)] rounded-lg overflow-hidden'>
              <div className='flex justify-between mb-4'>
                <div>
                  <h3 className='text-md text-[var(--text-secondary)] font-semibold'>
                    {t("Total Sales")}
                  </h3>
                  <p className='text-[var(--text-muted)] text-xs'>{periodLabel}</p>
                  <p
                    className={`mt-1 inline-flex items-center gap-1 text-xs ${
                      salesChange >= 0 ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {salesChange >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                    {salesChange >= 0 ? "+" : ""}
                    {salesChange.toFixed(1)}% {t("vs last month")}
                  </p>
                </div>
                <p className='text-[var(--text-secondary)] text-2xl font-semibold mt-2'>
                  ${stats.totalSales.toLocaleString()}
                </p>
              </div>
              <div className='h-34'>
                <Bar data={salesData} options={chartOptions} />
              </div>
            </div>

            {/* Customers Card */}
            <div className='bg-[var(--bg-primary)] p-6 border border-[var(--border-color)] rounded-lg overflow-hidden'>
              <div className='flex justify-between mb-4'>
                <div>
                  <h3 className='text-md text-[var(--text-secondary)] font-semibold'>
                    {t("Customers")}
                  </h3>
                  <p className='text-[var(--text-muted)] text-xs'>{periodLabel}</p>
                  <p
                    className={`mt-1 inline-flex items-center gap-1 text-xs ${
                      customersChange >= 0 ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {customersChange >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                    {customersChange >= 0 ? "+" : ""}
                    {customersChange.toFixed(1)}% {t("vs last month")}
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
                  <p className='text-[var(--text-muted)] text-xs'>
                    {period === "30d"
                      ? `${t("MONTHLY GOALS")}: ${monthlyGoal.toLocaleString()}`
                      : periodLabel}
                  </p>
                  <p
                    className={`mt-1 inline-flex items-center gap-1 text-xs ${
                      ordersChange >= 0 ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {ordersChange >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                    {ordersChange >= 0 ? "+" : ""}
                    {ordersChange.toFixed(1)}% {t("vs last month")}
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
              <div className='p-3 border-b border-[var(--border-color)]'>
                <h3 className='text-md text-[var(--text-secondary)] font-semibold'>
                  {t("Best Selling")}
                </h3>
                <p className='text-[var(--text-muted)] text-xs'>{periodLabel}</p>
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
              <div className='p-6 h-34'>
                <Doughnut data={bestSellingData} options={chartOptions} />
              </div>
            </div>

            {/* Recent Orders */}
            <div className='md:col-span-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg overflow-hidden'>
              <div className='flex items-center justify-between p-3 border-b border-[var(--border-color)]'>
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
                  size='medium'
                  isLoading={loading}
                  showBulkActions={false}
                  showPageSize={false}
                  showPagenation={false}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
