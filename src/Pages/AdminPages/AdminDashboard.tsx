import { useState, useEffect } from "react";
import { TbUser, TbRobot, TbBook2, TbBorderAll, TbTrendingUp, TbCalendar, TbChevronDown } from "react-icons/tb";
import { backendRequest } from "../../Helpers/backendRequest";
import { Loading } from "../../Components/Loading";
import ReactECharts from "echarts-for-react";

export const AdminDashboard = () => {
  const [statistics, setStatistics] = useState({
    leads: 0,
    files: 0,
    users: 0,
    assistants: 0,
  });
  const [userStats, setUserStats] = useState([]);
  const [plStats, setPlStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  const periodOptions = [
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "3m", label: "Last 3 Months" },
    { value: "6m", label: "Last 6 Months" },
  ];

  const getPeriodLabel = (value) => {
    const option = periodOptions.find(opt => opt.value === value);
    return option ? option.label : "Last 30 Days";
  };

  async function fetchStatistics() {
    setLoading(true);
    try {
      const response = await backendRequest("GET", "/admin/statistics");
      setStatistics(response);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserStats() {
    try {
      const response = await backendRequest(
        "GET",
        `/admin/users-stats?period=${selectedPeriod}`
      );
      setUserStats(response);
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  }

  async function fetchPlStats() {
    try {
      const response = await backendRequest(
        "GET",
        `/admin/pl-report?period=${selectedPeriod}`
      );
      setPlStats(response);
    } catch (error) {
      console.error("Error fetching profit and loss stats:", error);
    }
  }

  useEffect(() => {
    fetchStatistics();
    fetchUserStats();
    fetchPlStats();
  }, [selectedPeriod]);

  if (loading) return <Loading />;

  const chartOptions = {
    title: {
      text: "User Growth",
      left: "center",
      textStyle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
      },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#e5e7eb",
      borderWidth: 1,
      textStyle: {
        color: "#374151",
        fontSize: 12,
      },
      formatter: function (params) {
        return `${params[0].axisValue}<br/>Users: ${params[0].value}`;
      },
    },
    xAxis: {
      type: "category",
      data: userStats.map((item) => item.date),
      axisLabel: { 
        rotate: 45, 
        color: "#6b7280",
        fontSize: 11,
      },
      axisLine: {
        lineStyle: {
          color: "#e5e7eb",
        },
      },
    },
    yAxis: {
      type: "value",
      axisLabel: { 
        color: "#6b7280",
        fontSize: 11,
      },
      splitLine: {
        lineStyle: {
          color: "#f3f4f6",
        },
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      top: "15%",
      containLabel: true,
    },
    series: [
      {
        name: "Users",
        type: "line",
        data: userStats.map((item) => item.count),
        smooth: true,
        lineStyle: {
          width: 3,
          color: "#fab800",
        },
        itemStyle: {
          color: "#fab800",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(250, 184, 0, 0.3)" },
              { offset: 1, color: "rgba(250, 184, 0, 0.05)" },
            ],
          },
        },
        animationDuration: 800,
        symbol: "circle",
        symbolSize: 6,
      },
    ],
  };

  const plChartOptions = {
    title: {
      text: "Financial Overview",
      left: "center",
      textStyle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
      },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#e5e7eb",
      borderWidth: 1,
      textStyle: {
        color: "#374151",
        fontSize: 12,
      },
      formatter: function (params) {
        return params
          .map(
            (param) => `${param.seriesName}: $${param.value.toLocaleString()}`
          )
          .join("<br/>");
      },
    },
    legend: {
      data: ["Cost", "Profit"],
      left: "center",
      bottom: "5%",
      textStyle: {
        color: "#6b7280",
        fontSize: 11,
      },
    },
    xAxis: {
      type: "category",
      data: ["Call", "Numbers", "Total", "Call", "Numbers", "Net"],
      axisLabel: {
        color: "#6b7280",
        fontSize: 11,
      },
      axisLine: {
        lineStyle: {
          color: "#e5e7eb",
        },
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#6b7280",
        fontSize: 11,
        formatter: function (value) {
          return `$${value.toLocaleString()}`;
        },
      },
      splitLine: {
        lineStyle: {
          color: "#f3f4f6",
        },
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      top: "15%",
      containLabel: true,
    },
    series: [
      {
        name: "Cost",
        type: "bar",
        data: [
          plStats?.total_call_cost || 0,
          plStats?.total_purchased_number_cost || 0,
          (plStats?.total_call_cost || 0) +
            (plStats?.total_purchased_number_cost || 0),
          0,
          0,
          0,
        ],
        barWidth: "35%",
        itemStyle: {
          color: "#ef4444",
          borderRadius: [2, 2, 0, 0],
        },
        animationDuration: 800,
      },
      {
        name: "Profit",
        type: "bar",
        data: [
          0,
          0,
          0,
          plStats?.total_call_profit || 0,
          plStats?.total_purchased_number_profit || 0,
          plStats?.net_profit || 0,
        ],
        barWidth: "35%",
        itemStyle: {
          color: "#10b981",
          borderRadius: [2, 2, 0, 0],
        },
        animationDuration: 800,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Monitor and manage your system performance</p>
          </div>
          
          {/* Custom Period Selector */}
          <div className="relative">
            <button
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 hover:border-gray-400 transition-colors min-w-[160px]"
            >
              <TbCalendar className="w-4 h-4 text-gray-500" />
              <span className="flex-1 text-left">{getPeriodLabel(selectedPeriod)}</span>
              <TbChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showPeriodDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showPeriodDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowPeriodDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                  {periodOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedPeriod(option.value);
                        setShowPeriodDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        selectedPeriod === option.value 
                          ? 'text-primary bg-primary/10' 
                          : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            name: "Total Leads",
            count: statistics.leads,
            icon: <TbBorderAll className="w-5 h-5" />,
            color: "text-primary",
            bgColor: "bg-white",
            iconBg: "bg-primary/10",
          },
          {
            name: "Total Files",
            count: statistics.files,
            icon: <TbBook2 className="w-5 h-5" />,
            color: "text-blue-600",
            bgColor: "bg-white",
            iconBg: "bg-blue-50",
          },
          {
            name: "Active Users",
            count: statistics.users,
            icon: <TbUser className="w-5 h-5" />,
            color: "text-emerald-600",
            bgColor: "bg-white",
            iconBg: "bg-emerald-50",
          },
          {
            name: "AI Assistants",
            count: statistics.assistants,
            icon: <TbRobot className="w-5 h-5" />,
            color: "text-purple-600",
            bgColor: "bg-white",
            iconBg: "bg-purple-50",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`${stat.iconBg} p-2 rounded-lg`}>
                <div className={stat.color}>{stat.icon}</div>
              </div>
              <TbTrendingUp className="text-gray-400 w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.count.toLocaleString()}
            </div>
            <div className={`text-sm text-gray-600`}>{stat.name}</div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">User Growth</h3>
            <p className="text-xs text-gray-500">Track user registration trends</p>
          </div>
          <ReactECharts option={chartOptions} style={{ height: "350px" }} />
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Financial Performance</h3>
            <p className="text-xs text-gray-500">Monitor profit and loss metrics</p>
          </div>
          <ReactECharts option={plChartOptions} style={{ height: "350px" }} />
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: "Reports", icon: "📊", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
            { name: "Users", icon: "👥", color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
            { name: "Settings", icon: "⚙️", color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
            { name: "Logs", icon: "📋", color: "bg-orange-50 text-orange-700 hover:bg-orange-100" },
          ].map((action, index) => (
            <button
              key={index}
              className={`${action.color} p-3 rounded-lg transition-colors duration-200 flex flex-col items-center gap-1.5`}
            >
              <span className="text-lg">{action.icon}</span>
              <span className="text-xs font-medium">{action.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};