import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Line } from 'react-chartjs-2';
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
  Filler
} from 'chart.js';

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

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalSales: 4235,
    customers: 2571,
    orders: 734,
    bestSelling: [
      { name: 'Classic Monochrome Tees', sales: 940 },
      { name: 'Monochromatic Wardrobe', sales: 790 },
      { name: 'Essential Neutrals', sales: 740 }
    ],
    recentOrders: [
      { item: 'Mens Black T-Shirts', date: '20 Mar, 2023', total: 75.00, status: 'Processing' },
      { item: 'Essential Neutrals', date: '19 Mar, 2023', total: 22.00, status: 'Processing' },
      { item: 'Sleek and Cozy Black', date: '7 Feb, 2023', total: 57.00, status: 'Completed' },
      { item: 'MOCKUP Black', date: '29 Jan, 2023', total: 30.00, status: 'Completed' },
      { item: 'Monochromatic Wardrobe', date: '27 Jan, 2023', total: 27.00, status: 'Completed' }
    ]
  });

  const salesData = {
    labels: Array.from({ length: 30 }, (_, i) => i + 1),
    datasets: [{
      label: 'Sales',
      data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 200) + 100),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      fill: true
    }]
  };

  const customersData = {
    labels: Array.from({ length: 30 }, (_, i) => i + 1),
    datasets: [{
      label: 'Customers',
      data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 100) + 50),
      borderColor: 'rgb(59, 130, 246)',
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 2
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        display: false
      },
      y: {
        display: false
      }
    },
    maintainAspectRatio: false
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Sales Card */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg overflow-hidden">
          <div className="mb-4">
            <h3 className="text-sm text-gray-500 uppercase">Total Sales</h3>
            <p className="text-gray-400 text-xs mt-1">THIS MONTH</p>
            <p className="text-2xl font-semibold mt-2">$ {stats.totalSales}</p>
          </div>
          <div className="h-24">
            <Line data={salesData} options={chartOptions} />
          </div>
        </div>

        {/* Customers Card */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg overflow-hidden">
          <div className="mb-4">
            <h3 className="text-sm text-gray-500 uppercase">Customers</h3>
            <p className="text-gray-400 text-xs mt-1">THIS MONTH</p>
            <p className="text-2xl font-semibold mt-2">{stats.customers}</p>
          </div>
          <div className="h-24">
            <Line data={customersData} options={chartOptions} />
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg overflow-hidden">
          <div className="mb-4">
            <h3 className="text-sm text-gray-500 uppercase">Orders</h3>
            <p className="text-gray-400 text-xs mt-1">MONTHLY GOALS: 1,000</p>
            <p className="text-2xl font-semibold mt-2">{stats.orders}</p>
          </div>
          <div className="mt-4">
            <div className="h-2 bg-gray-100 rounded-full">
              <div 
                className="h-2 bg-blue-500 rounded-full" 
                style={{ width: `${(stats.orders / 1000) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">266 Left</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Best Selling Products */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg overflow-hidden">
          <div className="mb-6">
            <h3 className="text-sm text-gray-500 uppercase">Best Selling</h3>
            <p className="text-gray-400 text-xs mt-1">THIS MONTH</p>
            <p className="text-2xl font-semibold mt-2">$2,400</p>
            <p className="text-gray-500 text-sm mt-1">Total Sales</p>
          </div>
          <div className="space-y-4">
            {stats.bestSelling.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{product.name}</span>
                <span className="text-sm text-gray-500">${product.sales} Sales</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm text-gray-500 uppercase">Recent Orders</h3>
            <button className="text-sm text-blue-500 hover:text-blue-600">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500">
                  <th className="pb-3 font-medium">Item</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {stats.recentOrders.map((order, index) => (
                  <tr key={index} className="border-t border-gray-100">
                    <td className="py-3 text-gray-900">{order.item}</td>
                    <td className="py-3 text-gray-500">{order.date}</td>
                    <td className="py-3 text-gray-900">${order.total.toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'Completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
} 