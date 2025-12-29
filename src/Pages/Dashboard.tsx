import { useEffect, useState } from "react";
import { TbUser, TbFiles, TbDatabase, TbRobot, TbTrendingUp, TbActivity, TbChartBar, TbPhone, TbCalendar, TbSettings } from "react-icons/tb";
import { Link } from "react-router-dom";
import { Loading } from "../Components/Loading";
import { backendRequest } from "../Helpers/backendRequest";

interface Statistics {
  leads: number;
  files: number;
  assistants: number;
  knowledge_base: number;
}

export function Dashboard() {
  const [statistics, setStatistics] = useState<Statistics>({
    leads: 0,
    files: 0,
    assistants: 0,
    knowledge_base: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);

  async function fetchStatistics() {
      setLoading(true);
      const response: Statistics = await backendRequest("GET", "/statistics");
      setStatistics(response);
      setLoading(false);
  }

  useEffect(() => {
    fetchStatistics();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your account.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            to="/report-dashboard" 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <TbChartBar className="w-4 h-4" />
            View Reports
          </Link>
        </div>
      </div>

      {/* Statistics Cards - Modern Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-white to-primary/5 rounded-2xl p-6 border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <TbUser className="w-6 h-6 text-primary" />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-500">Active Leads</div>
              <div className="text-3xl font-bold text-gray-900">{statistics.leads}</div>
            </div>
          </div>
          <Link 
            to="/leads" 
            className="flex items-center justify-between text-sm font-medium text-primary hover:text-primary-dark mt-4 pt-4 border-t border-gray-100 group-hover:border-primary/20"
          >
            <span>Manage Leads</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </Link>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <TbFiles className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-500">Leads Files</div>
              <div className="text-3xl font-bold text-gray-900">{statistics.files}</div>
            </div>
          </div>
          <Link 
            to="/view-leads" 
            className="flex items-center justify-between text-sm font-medium text-blue-600 hover:text-blue-700 mt-4 pt-4 border-t border-gray-100 group-hover:border-blue-200"
          >
            <span>Manage Files</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </Link>
        </div>

        <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-6 border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
              <TbRobot className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-500">AI Assistants</div>
              <div className="text-3xl font-bold text-gray-900">{statistics.assistants}</div>
            </div>
          </div>
          <Link 
            to="/assistant" 
            className="flex items-center justify-between text-sm font-medium text-emerald-600 hover:text-emerald-700 mt-4 pt-4 border-t border-gray-100 group-hover:border-emerald-200"
          >
            <span>Manage Assistants</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </Link>
        </div>

        <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <TbDatabase className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-500">Knowledge Base</div>
              <div className="text-3xl font-bold text-gray-900">{statistics.knowledge_base}</div>
            </div>
          </div>
          <Link 
            to="/documents" 
            className="flex items-center justify-between text-sm font-medium text-purple-600 hover:text-purple-700 mt-4 pt-4 border-t border-gray-100 group-hover:border-purple-200"
          >
            <span>View Knowledge Base</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </Link>
        </div>
      </div>

      {/* Quick Actions & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <div className="flex gap-2">
              <Link 
                to="/assistant/createassistant" 
                className="px-3 py-1 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                + Assistant
              </Link>
              <Link 
                to="/files" 
                className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                + Upload
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/assistant/createassistant"
              className="p-4 rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-sm transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
                  <TbRobot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Create Assistant</p>
                  <p className="text-xs text-gray-500">Set up AI calling agent</p>
                </div>
              </div>
              <div className="text-xs text-gray-400 group-hover:text-primary transition-colors">
                Configure voice, scripts, and behavior →
              </div>
            </Link>

            <Link
              to="/files"
              className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200">
                  <TbFiles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Upload Leads</p>
                  <p className="text-xs text-gray-500">Import contact lists</p>
                </div>
              </div>
              <div className="text-xs text-gray-400 group-hover:text-blue-600 transition-colors">
                CSV, Excel, or manual entry →
              </div>
            </Link>

            <Link
              to="/business-schedule"
              className="p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-sm transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200">
                  <TbCalendar className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Business Hours</p>
                  <p className="text-xs text-gray-500">Set calling schedule</p>
                </div>
              </div>
              <div className="text-xs text-gray-400 group-hover:text-emerald-600 transition-colors">
                Configure time zones and availability →
              </div>
            </Link>

            <Link
              to="/Getnumbers"
              className="p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200">
                  <TbPhone className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Get Numbers</p>
                  <p className="text-xs text-gray-500">Acquire phone lines</p>
                </div>
              </div>
              <div className="text-xs text-gray-400 group-hover:text-purple-600 transition-colors">
                Local, toll-free, or international →
              </div>
            </Link>
          </div>
        </div>

        {/* System Status Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
            <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              Operational
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <TbTrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Voice Services</p>
                  <p className="text-xs text-gray-500">AI Calling</p>
                </div>
              </div>
              <span className="text-xs font-medium text-green-600">● Online</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <TbDatabase className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Database</p>
                  <p className="text-xs text-gray-500">Storage & Analytics</p>
                </div>
              </div>
              <span className="text-xs font-medium text-green-600">● Online</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <TbRobot className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">AI Engine</p>
                  <p className="text-xs text-gray-500">Processing</p>
                </div>
              </div>
              <span className="text-xs font-medium text-green-600">● Online</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link 
              to="/profile" 
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              <TbSettings className="w-4 h-4" />
              Account Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}