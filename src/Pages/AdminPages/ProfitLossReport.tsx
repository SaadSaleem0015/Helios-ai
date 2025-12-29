import { useState, useEffect, useMemo } from "react";
import { backendRequest } from "../../Helpers/backendRequest"; 
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatDuration } from "../../Helpers/formatDuration";
import { PageNumbers } from "../../Components/PageNumbers";
import { filterAndPaginate } from "../../Helpers/filterAndPaginate";
import { FiCalendar, FiRefreshCw, FiSearch, FiFilter } from "react-icons/fi";

interface ReportData {
  company_name: string;
  minutes_used: number;
  calls_made: number;
  transfer_made: number;
  costPerMinute: number; 
  ratePerTransfer: number; 
  email_confirmed: boolean;
  role: string;
}

const ProfitLossReport = () => {
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [timeframe, setTimeframe] = useState("Today");
  const [conversionRate, setConversionRate] = useState(0);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const { filteredItems: filteredCompanies, pagesCount, pageNumbers } = useMemo(() => {
    const fromDate = startDate ? new Date(startDate) : undefined;
    const toDate = endDate ? new Date(endDate) : undefined;

    return filterAndPaginate(reportData, search, currentPage, 10, 7, fromDate, toDate);
  }, [reportData, search, currentPage, startDate, endDate]);

  useEffect(() => {
    const fetchReportData = async (startDate?: Date, endDate?: Date) => {
      setLoading(true);
      try {
        let queryParams = `timeframe=${timeframe}`;
        
        if (startDate && endDate) {
          setTimeframe("custom");
          queryParams += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
        }

        const response = await backendRequest<ReportData[]>(
          "GET",
          `/pnl-report?${queryParams}`
        );

        if (response && Array.isArray(response)) {
          const confirmedUsers = response.filter(
            (user) => user.email_verified === true
          );
          setReportData(confirmedUsers);
          calculateConversionRate(response);
        }
      } catch (error) {
        console.error("Failed to fetch report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData(startDate, endDate);
  }, [timeframe, startDate, endDate]);

  const calculateConversionRate = (data: ReportData[]) => {
    let totalTransfers = 0;
    let totalCalls = 0;

    data.forEach((item) => {
      totalTransfers += item.transfer_made;
      totalCalls += item.calls_made;
    });

    setConversionRate(totalCalls > 0 ? totalTransfers / totalCalls : 0);
  };

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const calculateCost = (minutesUsed: number) => (minutesUsed / 60) * 0.08;
  const calculateRevenue = (transfersMade: number, ratePerTransfer: number) =>
    transfersMade * ratePerTransfer || 0;
  const calculateROAS = (revenue: number, cost: number) =>
    cost > 0 ? revenue / cost : 0;
  const calculateAvgCostPerCall = (cost: number, callsMade: number) =>
    callsMade > 0 ? cost / callsMade : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profit & Loss Report</h1>
              <p className="text-gray-600 text-sm mt-1">
                Track performance metrics across companies
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Company Performance</h2>
              <p className="text-gray-600 text-sm mt-1">Filter and search through company data</p>
            </div>
            
            <div className="relative w-full lg:w-64">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            {/* Timeframe Buttons */}
            <div className="flex flex-wrap gap-2">
              {["Today", "Last 7d", "Last 14d", "Last 30d", "Last 60d"].map((time) => (
                <button
                  key={time}
                  onClick={() => setTimeframe(time)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    timeframe === time
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>

            {/* Date Picker */}
            <div className="flex-1 max-w-xs">
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <FiCalendar className="w-4 h-4" />
                <span>Custom Date Range</span>
              </div>
              <DatePicker
                selected={startDate}
                onChange={handleDateChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholderText="Select date range"
              />
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStartDate(null);
                  setEndDate(null);
                  setTimeframe("Today");
                }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FiRefreshCw className="w-4 h-4" />
                Clear Filters
              </button>
            </div>
          </div>
          
          {/* Conversion Rate */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <FiFilter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">
                Overall Conversion Rate: <span className="font-semibold text-gray-900">{(conversionRate * 100).toFixed(1)}%</span>
              </span>
            </div>
          </div>
        </div>

        {/* Companies Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Calls
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transfers
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ROAS
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost/Call
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredCompanies.length > 0 ? (
                  filteredCompanies.map((data, index) => {
                    const cost = calculateCost(data.minutes_used);
                    const revenue = calculateRevenue(data.transfer_made, 1);
                    const roas = calculateROAS(revenue, cost);
                    const avgCostPerCall = calculateAvgCostPerCall(cost, data.calls_made);

                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {data.company_name || "--"}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              #{(currentPage - 1) * 10 + index + 1}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {formatDuration(data.minutes_used || 0)}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {data.calls_made || 0}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {data.transfer_made || 0}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-red-600">
                            ${cost.toFixed(2)}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-green-600">
                            ${revenue.toFixed(2)}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            roas >= 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {roas.toFixed(2)}x
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            ${avgCostPerCall.toFixed(2)}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FiFilter className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
                        <p className="text-gray-500">
                          {search ? "Try a different search term" : "No data available for the selected period"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagesCount > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <PageNumbers
                pageNumbers={pageNumbers}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                pagesCount={pagesCount}
              />
            </div>
          )}

          {/* Summary Footer */}
          {filteredCompanies.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-200 bg-white">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, filteredCompanies.length)} of {filteredCompanies.length} companies
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfitLossReport;