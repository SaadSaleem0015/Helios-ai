import React, { useEffect, useMemo, useState } from "react";
import { FormateTime } from "../../Helpers/formateTime";
import { backendRequest } from "../../Helpers/backendRequest";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { PageNumbers } from "../../Components/PageNumbers";
import { filterAndPaginate } from "../../Helpers/filterAndPaginate";
import { 
  FiSearch, 
  FiFilter, 
  FiDownload, 
  FiRefreshCw, 
  FiCalendar,
  FiUser,
  FiPhone,
  FiClock,
  FiX,
  FiList,
  FiGrid
} from "react-icons/fi";

interface CallLog {
  id: number;
  customer_number: string;
  call_started_at: string;
  customer_name: string;
  call_ended_at: string;
  cost: number;
  status: string;
  end_reason: string;
  transcript?: string;
  recording_url?: string;
  call_id: string;
}

const AdminCallReports: React.FC = () => {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const {
    filteredItems: filteredPhoneNumbers,
    pagesCount,
    pageNumbers,
  } = useMemo(
    () => filterAndPaginate(callLogs || [], search, currentPage),
    [callLogs, search, currentPage]
  );

  const fetchCallLogs = async () => {
    setLoading(true);
    try {
      const logs = await backendRequest<CallLog[], []>("GET", "/all_call_logs");
      setCallLogs(Array.isArray(logs) ? logs : []);
    } catch (error) {
      console.error("Failed to fetch call logs:", error);
      setCallLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallLogs();
  }, []);

  const exportToExcel = () => {
    const data = callLogs.map((log) => ({
      "Call ID": log.call_id,
      "Customer Number": log.customer_number,
      "Customer Name": log.customer_name,
      "Call Started At": FormateTime(log.call_started_at),
      "Call Ended At": FormateTime(log.call_ended_at),
      "Status": log.status,
      "Cost": log.cost,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Call Logs");
    XLSX.writeFile(wb, `CallLogs_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleFilterApply = async () => {
    setLoading(true);
    try {
      const filterData: any = {};
      
      if (selectedCompany && selectedCompany.trim() !== "") {
        filterData.company_id = selectedCompany;
      }
      
      if (startDate) {
        filterData.start_date = startDate.toISOString();
      }
      
      if (endDate) {
        filterData.end_date = endDate.toISOString();
      }

      if (Object.keys(filterData).length === 0) {
        await fetchCallLogs();
        setFilterModalVisible(false);
        return;
      }

      const filteredLogs = await backendRequest<CallLog[], [any]>(
        "POST",
        "/filter-company-call-logs",
        filterData
      );
      
      setCallLogs(Array.isArray(filteredLogs) ? filteredLogs : []);
      setFilterModalVisible(false);
    } catch (error) {
      console.error("Failed to fetch filtered logs:", error);
      setCallLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = async () => {
    setSelectedCompany("");
    setStartDate(null);
    setEndDate(null);
    setFilterModalVisible(false);
    await fetchCallLogs();
  };

  const fetchCompanies = async () => {
    try {
      const companyList = await backendRequest<any[], []>("GET", "/users");
      setCompanies(companyList);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const getDateRangeDisplay = () => {
    if (!startDate && !endDate) return "All Time";
    if (startDate && endDate) {
      return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    }
    return startDate ? `From ${startDate.toLocaleDateString()}` : `Until ${endDate?.toLocaleDateString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">All Call Logs</h1>
              <p className="text-gray-600 text-sm mt-1">
                Monitor and analyze all call activities across companies
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiDownload className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => setFilterModalVisible(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <FiFilter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Total Calls</div>
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <FiPhone className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-gray-900">{callLogs.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Unique Callers</div>
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <FiUser className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {new Set(callLogs.map(log => log.customer_number)).size}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Date Range</div>
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <FiCalendar className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="text-sm font-medium text-gray-900 truncate">{getDateRangeDisplay()}</div>
          </div>
        </div>

        {/* Search and Active Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Call Logs</h2>
              <p className="text-gray-600 text-sm mt-1">View and search through all call records</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative w-full sm:w-64">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name or number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    viewMode === 'table' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FiList className="w-4 h-4" />
                  <span className="text-sm">Table</span>
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    viewMode === 'cards' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FiGrid className="w-4 h-4" />
                  <span className="text-sm">Cards</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedCompany || startDate || endDate) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              {selectedCompany && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  Company: {companies.find(c => c.id === selectedCompany)?.name}
                  <button
                    onClick={() => setSelectedCompany("")}
                    className="ml-2 text-primary hover:text-primary/70"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              )}
              {(startDate || endDate) && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <FiCalendar className="w-3 h-3 mr-1" />
                  {getDateRangeDisplay()}
                  <button
                    onClick={() => { setStartDate(null); setEndDate(null); }}
                    className="ml-2 text-blue-800 hover:text-blue-600"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Cards View */}
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredPhoneNumbers.length > 0 ? (
                  filteredPhoneNumbers.map((log) => (
                    <div
                      key={log.id}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
                    >
                      {/* Card Header */}
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <FiUser className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {log.customer_name || "Unknown Caller"}
                              </h3>
                              <p className="text-sm text-gray-500">{log.customer_number}</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center text-sm">
                            <FiClock className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-700">
                              <span className="font-medium">Started:</span> {FormateTime(log.call_started_at)}
                            </span>
                          </div>
                          {log.call_ended_at && (
                            <div className="flex items-center text-sm">
                              <FiClock className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-gray-700">
                                <span className="font-medium">Ended:</span> {FormateTime(log.call_ended_at)}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center text-sm">
                            <FiPhone className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-700">
                              <span className="font-medium">Call ID:</span> {log.call_id ? log.call_id.slice(0, 8) : "--"}...
                            </span>
                          </div>
                          {log.end_reason && (
                            <div className="pt-3 border-t border-gray-100">
                              <p className="text-xs text-gray-500">
                                <span className="font-medium">End Reason:</span> {log.end_reason}
                              </p>
                            </div>
                          )}
                          {log.cost > 0 && (
                            <div className="pt-3 border-t border-gray-100">
                              <p className="text-xs text-gray-500">
                                <span className="font-medium">Cost:</span> ${log.cost.toFixed(2)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3">
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiPhone className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No call logs found
                      </h3>
                      <p className="text-gray-500">
                        {search ? "Try a different search term" : "No call logs recorded yet"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Plateform User
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Caller Details
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time & Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cost
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPhoneNumbers.length > 0 ? (
                        filteredPhoneNumbers.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                             <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <FiUser className="w-5 h-5 text-gray-600" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900">
                                    {log.plateform_user_name || "Unknown User"}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {log.plateform_user_email}
                                  </div>
                                 
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <FiUser className="w-5 h-5 text-gray-600" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900">
                                    {log.customer_name || "Unknown Caller"}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {log.customer_number}
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">
                                   Call ID: {log.call_id ? log.call_id.slice(0, 8) : "--"}...
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <div className="flex items-center text-sm text-gray-900">
                                  <FiClock className="w-3.5 h-3.5 text-gray-400 mr-2" />
                                  {FormateTime(log.call_started_at)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Ended: {log.call_ended_at ? FormateTime(log.call_ended_at) : "N/A"}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                                  {log.status}
                                </span>
                                {log.end_reason && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {log.end_reason}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                ${log.cost ? log.cost.toFixed(2) : "0"}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-12">
                            <div className="text-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiPhone className="w-8 h-8 text-gray-400" />
                              </div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No call logs found
                              </h3>
                              <p className="text-gray-500">
                                {search ? "Try a different search term" : "No call logs recorded yet"}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination */}
            {pagesCount > 1 && (
              <div className="mt-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <PageNumbers
                    pageNumbers={pageNumbers}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    pagesCount={pagesCount}
                  />
                </div>
              </div>
            )}

            {/* Summary Footer */}
            {filteredPhoneNumbers.length > 0 && (
              <div className="mt-4 text-sm text-gray-600">
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, filteredPhoneNumbers.length)} of {filteredPhoneNumbers.length} calls
              </div>
            )}
          </>
        )}
      </div>

      {/* Filter Modal */}
      {filterModalVisible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FiFilter className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Filter Call Logs</h2>
                    <p className="text-gray-600 text-sm">Apply filters to narrow down results</p>
                  </div>
                </div>
                <button
                  onClick={() => setFilterModalVisible(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Company Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">All Companies</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.company_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <FiCalendar className="w-4 h-4" />
                    <span>{getDateRangeDisplay()}</span>
                  </div>
                  <DatePicker
                    selected={startDate}
                    onChange={(update) => {
                      if (Array.isArray(update)) {
                        setStartDate(update[0]);
                        setEndDate(update[1]);
                      } else {
                        setStartDate(update);
                      }
                    }}
                    startDate={startDate}
                    endDate={endDate}
                    selectsRange
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholderText="Select date range"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={handleResetFilters}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  Reset All
                </button>
                <button
                  onClick={handleFilterApply}
                  className="flex-1 px-4 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCallReports;