import React, { useState, useEffect } from "react";
import { backendRequest } from "../Helpers/backendRequest";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { PageNumbers } from "../Components/PageNumbers";
import { FormateTime } from "../Helpers/formateTime";
import { FiCalendar, FiDollarSign, FiTrendingUp, FiTrendingDown, FiFilter, FiRefreshCw } from "react-icons/fi";

interface Payment {
  amount_paid: number;
  created_at: string;
}

interface BillingReportData {
  date: string;
  description: string;
  credit: number;
  debit: number;
  balance: number;
}

interface SpentMoney {
  id: string;
  created_at: string;
  description: string;
  spent_money: number;
}

const ITEMS_PER_PAGE = 10;

const BillingReport: React.FC = () => {
  const [billingData, setBillingData] = useState<BillingReportData[]>([]);
  const [credit, setCredit] = useState<number>(0);
  const [debit, setDebit] = useState<number>(0);
  const [balance, setBalance] = useState<number>(0);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    setStartDate(dates[0]);
    setEndDate(dates[1]);
  };

  const applyQuickFilter = (filterType: string) => {
    const now = new Date();
    let startDate: Date, endDate: Date;

    switch (filterType) {
      case "today": {
        const today = new Date();
        startDate = new Date(today.setHours(0, 0, 0, 0));
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      }
      case "thisWeek": {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      }
      case "thisMonth": {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate = firstDay;
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      }
      case "allTime": {
        startDate = null;
        endDate = null;
        break;
      }
      default: {
        startDate = null;
        endDate = null;
        break;
      }
    }

    setStartDate(startDate);
    setEndDate(endDate);
  };

  const formatDateRange = () => {
    if (!startDate || !endDate) return "All Time";
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const paymentsResponse = await backendRequest<Payment[]>(
        "GET",
        "/payments"
      );
      const spentMoneyResponse = await backendRequest("GET", `/spent-money`);

      const payments: Payment[] = paymentsResponse?.payments || [];
      const spent_money: SpentMoney[] = spentMoneyResponse || [];

      if (!Array.isArray(payments) || !Array.isArray(spent_money)) {
        throw new Error("Unexpected response format");
      }

      const filteredPayments =
        startDate && endDate
          ? payments.filter((payment) => {
              const paymentDate = new Date(payment.created_at);
              return paymentDate >= startDate && paymentDate <= endDate;
            })
          : payments;

      const filteredSpentPayment =
        startDate && endDate
          ? spent_money.filter((spent) => {
              const spentDate = new Date(spent.created_at);
              return spentDate >= startDate && spentDate <= endDate;
            })
          : spent_money;

      let runningBalance = 0;

      const billingEntries: BillingReportData[] = [
        ...filteredPayments.map((payment) => ({
          date: new Date(payment.created_at).toISOString(),
          description: "Payment Received",
          credit: payment.amount_paid,
          debit: 0,
          balance: 0,
        })),
        ...filteredSpentPayment.map((spent) => ({
          date: new Date(spent.created_at).toISOString(),
          description: spent.description,
          credit: 0,
          debit: spent.spent_money,
          balance: 0,
        })),
      ];

      billingEntries.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      for (let i = billingEntries.length - 1; i >= 0; i--) {
        runningBalance += billingEntries[i].credit - billingEntries[i].debit;
        billingEntries[i].balance = runningBalance;
      }

      const formattedEntries = billingEntries.map((entry) => ({
        ...entry,
        date: new Date(entry.date).toISOString(),
      }));

      setBillingData(formattedEntries);

      const totalCredit = filteredPayments.reduce(
        (sum, payment) => sum + payment.amount_paid,
        0
      );
      const totalDebit = filteredSpentPayment.reduce(
        (sum, log) => sum + log.spent_money,
        0
      );

      setCredit(totalCredit);
      setDebit(totalDebit);
      setBalance(runningBalance);
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Failed to fetch billing data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = billingData.slice(indexOfFirstItem, indexOfLastItem);
  const pagesCount = Math.ceil(billingData.length / ITEMS_PER_PAGE);
  const pageNumbers = Array.from({ length: pagesCount }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Billing Report</h1>
              <p className="text-gray-600 text-sm mt-1">
                Track your payments, expenses, and account balance
              </p>
            </div>
            <div className="text-sm text-gray-500">
              <FiCalendar className="inline w-4 h-4 mr-1" />
              {formatDateRange()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Credit</h3>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <FiTrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${credit.toFixed(2)}
            </div>
            <p className="text-sm text-gray-500 mt-2">Total payments received</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Debit</h3>
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <FiTrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${debit.toFixed(2)}
            </div>
            <p className="text-sm text-gray-500 mt-2">Total expenses incurred</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Current Balance</h3>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                balance >= 0 ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <FiDollarSign className={`w-5 h-5 ${
                  balance >= 0 ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
            </div>
            <div className={`text-3xl font-bold ${
              balance >= 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              ${balance.toFixed(2)}
            </div>
            {balance < 10 && balance > 0 && (
              <p className="text-sm text-yellow-600 mt-2">Balance is low</p>
            )}
            {balance < 0 && (
              <p className="text-sm text-red-600 mt-2">Negative balance</p>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
              <p className="text-gray-600 text-sm mt-1">
                View and filter your billing transactions
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => applyQuickFilter("allTime")}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                All Time
              </button>
              <button
                onClick={() => applyQuickFilter("today")}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => applyQuickFilter("thisWeek")}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                This Week
              </button>
              <button
                onClick={() => applyQuickFilter("thisMonth")}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                This Month
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Date Range
              </label>
              <DatePicker
                selected={startDate}
                onChange={handleDateChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholderText="Select date range"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStartDate(null);
                  setEndDate(null);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FiRefreshCw className="w-4 h-4" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-gray-500">Loading transactions...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Credit
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Debit
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.length > 0 ? (
                      currentItems.map((entry, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {FormateTime(entry.date)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {entry.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {entry.credit > 0 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                +${entry.credit.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {entry.debit > 0 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                -${entry.debit.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${
                              entry.balance >= 0 ? 'text-green-700' : 'text-red-700'
                            }`}>
                              ${entry.balance.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <FiDollarSign className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No transactions found
                            </h3>
                            <p className="text-gray-500">
                              {startDate || endDate 
                                ? "Try adjusting your date filters" 
                                : "No billing transactions recorded yet"}
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
                <div className="px-6 py-4 border-t border-gray-200">
                  <PageNumbers
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    pageNumbers={pageNumbers}
                    pagesCount={pagesCount}
                  />
                </div>
              )}

              {/* Summary */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, billingData.length)} of {billingData.length} transactions
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">
                      <span className="font-medium">Credit:</span> ${credit.toFixed(2)}
                    </span>
                    <span className="text-gray-600">
                      <span className="font-medium">Debit:</span> ${debit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingReport;