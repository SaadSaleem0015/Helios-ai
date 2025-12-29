import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { backendRequest } from "../Helpers/backendRequest"
import { BiExport } from "react-icons/bi"
import * as XLSX from "xlsx"
import { PageNumbers } from "../Components/PageNumbers"
import { Loading } from "../Components/Loading"
import { FaEye, FaSearch, FaFilter, FaChevronDown, FaPhone, FaClock, FaUser } from "react-icons/fa"
import { FormateTime } from "../Helpers/formateTime"
import { formatDuration } from "../Helpers/formatDuration"
import { Dialog } from "@headlessui/react"
import LeadModal from "../Components/LeadModal"
import { TbTrash } from "react-icons/tb"
import AudioPlayer from "react-modern-audio-player"
import ConfirmationModal from "../Components/ConfirmationModal"
import { notifyResponse } from "../Helpers/notyf"
import { IoIosCheckboxOutline } from "react-icons/io"
import { formatCallEndedReason } from "../Helpers/formateCallEndReason"
import { FiCheckCircle, FiXCircle, FiArrowRight, FiPhoneOff, FiVolume2 } from "react-icons/fi"

interface Lead {
  id: number
  first_name: string
  last_name: string
  email: string
  salesforce_id: string
  add_date: string
  mobile: string
  other_data?: string[]
  file_id: number
}

interface CallLog extends Record<string, unknown> {
  id?: number
  customer_number?: string
  call_started_at?: string
  customer_name?: string
  call_ended_at?: string
  cost?: number
  call_duration?: number
  call_ended_reason?: string
  status?: string
  transcript?: string
  recording_url?: string
  call_id?: string
  lead_id?: number
  criteria_satisfied?: boolean
  ended_reason?: string
  successEvalution?: string
}

const dispositionOptions = [
  { value: "", label: "All Dispositions", icon: FiCheckCircle },
  { value: "customer-ended-call", label: "Customer Ended", icon: FiXCircle },
  { value: "silence-timed-out", label: "Silence Timeout", icon: FaClock },
  { value: "customer-did-not-answer", label: "No Answer", icon: FiPhoneOff },
  { value: "twilio-failed-to-connect-call", label: "Failed Connect", icon: FiXCircle },
  { value: "assistant-forwarded-call", label: "Call Forwarded", icon: FiArrowRight },
]

const rowsPerPageOptions = [
  { value: 10, label: "10 rows" },
  { value: 25, label: "25 rows" },
  { value: 50, label: "50 rows" },
  { value: 100, label: "100 rows" },
]

const UsageReport: React.FC = () => {
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"transcript" | "audio" | "overview">("overview")
  const [selectedLogDetails, setSelectedLogDetails] = useState<CallLog | null>(null)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState("")
  const [dispositionFilter, setDispositionFilter] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPhoneNumberModal, setShowPhoneNumberModal] = useState<boolean>(false)
  const [phoneNumberDetails, setPhoneNumberDetails] = useState<CallLog[] | null>(null)
  const [isDispositionOpen, setIsDispositionOpen] = useState(false)
  const [isRowsDropdownOpen, setIsRowsDropdownOpen] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const customFilterAndPaginate = (
    items: CallLog[],
    searchTerm: string,
    disposition: string,
    page: number,
    itemsPerPage = 10,
    maxPageNumbers = 7,
  ) => {
    let filteredItems = items.filter((item) => {
      const searchableText = `${item.customer_name || ""} ${item.customer_number || ""}`.toLowerCase()
      return searchableText.includes(searchTerm.toLowerCase())
    })

    if (disposition) {
      filteredItems = filteredItems.filter((item) => item.call_ended_reason === disposition)
    }

    const totalItems = filteredItems.length
    const pagesCount = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedItems = filteredItems.slice(startIndex, endIndex)

    const halfMaxPageNumbers = Math.floor(maxPageNumbers / 2)
    let startPage = Math.max(1, page - halfMaxPageNumbers)
    const endPage = Math.min(pagesCount, startPage + maxPageNumbers - 1)

    if (endPage - startPage + 1 < maxPageNumbers) {
      startPage = Math.max(1, endPage - maxPageNumbers + 1)
    }

    const pageNumbers = []
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    return {
      filteredItems: paginatedItems,
      pagesCount,
      pageNumbers,
    }
  }

  const {
    filteredItems: filteredCallLogs,
    pagesCount,
    pageNumbers,
  } = useMemo(
    () => customFilterAndPaginate(callLogs, search, dispositionFilter, currentPage, itemsPerPage),
    [callLogs, search, dispositionFilter, currentPage, itemsPerPage],
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [search, dispositionFilter, itemsPerPage])

  useEffect(() => {
    const fetchCallLogs = async () => {
      try {
        const logs = await backendRequest<CallLog[], []>("GET", "/user/call-logs-detail")
        if (Array.isArray(logs)) {
          const sortedLogs = logs.sort((a, b) => {
            const dateA = new Date(a.call_started_at)
            const dateB = new Date(b.call_started_at)
            return dateB.getTime() - dateA.getTime()
          })
          setCallLogs(sortedLogs)
        } else {
          console.error("Expected an array but got:", logs)
          setCallLogs([])
        }
      } catch (error) {
        console.error("Failed to fetch call logs:", error)
      }
    }

    fetchCallLogs()
  }, [])

  const handleDeleteLog = async () => {
    if (selectedLogId !== null) {
      try {
        const response = await backendRequest("DELETE", `/call_log/${selectedLogId}`)
        setCallLogs((prevLogs) => prevLogs.filter((log) => log.call_id !== selectedLogId))
        notifyResponse(response)
      } catch (error) {
        console.error("Failed to delete call log:", error)
      } finally {
        setShowDeleteModal(false)
      }
    }
  }

  const handleShowDetailsModal = async (id: string) => {
    setLoading(true)
    setSelectedLogId(id)
    setActiveTab("overview")
    try {
      const callDetails = await backendRequest<CallLog, null>("GET", `/call/${id}`)
      setSelectedLogDetails(callDetails)
      setShowDetailsModal(true)
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch call details:", error)
    }
  }

  const handleShowDeleteModal = (id: string) => {
    setSelectedLogId(id)
    setShowDeleteModal(true)
  }

  const handleCloseLeadModal = () => {
    setShowLeadModal(false)
    setSelectedLead(null)
  }

  const exportToExcel = () => {
    const data = callLogs.map((log) => ({
      "Call ID": log.call_id,
      "Customer Number": log.customer_number,
      "Customer Name": log.customer_name,
      "Call Started At": log.call_started_at && FormateTime(log.call_started_at),
      "Call Ended At": log.call_ended_at && FormateTime(log.call_ended_at),
      Disposition: log.call_ended_reason ? formatCallEndedReason(log.call_ended_reason) : "N/A",
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Call Logs")
    XLSX.writeFile(wb, "CallLogs.xlsx")
  }

  const handlePhoneNumberDetail = async (num: string) => {
    setLoading(true)
    try {
      const details = await backendRequest<CallLog[], []>("GET", `/specific-number-call-logs/${num}`)
      setPhoneNumberDetails(details)
      setShowPhoneNumberModal(true)
    } catch (error) {
      console.error("Error fetching phone number details:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.round(time % 60)
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`
    const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`
    return `${formattedMinutes}:${formattedSeconds}`
  }

  const selectedOption = dispositionOptions.find((option) => option.value === dispositionFilter)
  const selectedRowsOption = rowsPerPageOptions.find((option) => option.value === itemsPerPage)

  const getDispositionColor = (reason: string | undefined) => {
    switch (reason) {
      case "customer-ended-call": return "bg-green-100 text-green-800"
      case "customer-did-not-answer": return "bg-yellow-100 text-yellow-800"
      case "silence-timed-out": return "bg-orange-100 text-orange-800"
      case "twilio-failed-to-connect-call": return "bg-red-100 text-red-800"
      case "assistant-forwarded-call": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Call Logs</h1>
              <p className="text-gray-600 text-sm mt-1">Monitor and analyze your AI assistant calls</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BiExport className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Total Calls</div>
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <FaPhone className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-gray-900">{callLogs.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Completed</div>
            <div className="text-2xl font-semibold text-green-600">
              {callLogs.filter(log => log.status === "Completed").length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Unique Callers</div>
            <div className="text-2xl font-semibold text-blue-600">
              {new Set(callLogs.map(log => log.customer_number)).size}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Criteria Satisfied</div>
            <div className="text-2xl font-semibold text-primary">
              {callLogs.filter(log => log.criteria_satisfied).length}
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Call Logs</h2>
              <p className="text-gray-600 text-sm mt-1">Filter and search through your call history</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or phone number..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Disposition Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Disposition</label>
              <div className="relative">
                <button
                  onClick={() => setIsDispositionOpen(!isDispositionOpen)}
                  className="flex items-center justify-between w-full px-4 py-2.5 text-left border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <div className="flex items-center gap-2">
                    <FaFilter className="w-4 h-4 text-gray-400" />
                    <span>{selectedOption?.label || "All Dispositions"}</span>
                  </div>
                  <FaChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDispositionOpen ? "rotate-180" : ""}`} />
                </button>

                {isDispositionOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsDispositionOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-2">
                      {dispositionOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setDispositionFilter(option.value)
                            setIsDispositionOpen(false)
                          }}
                          className={`flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-gray-50 ${dispositionFilter === option.value ? "bg-primary/5 text-primary" : "text-gray-700"}`}
                        >
                          {option.icon && <option.icon className="w-4 h-4" />}
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Rows per Page */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rows per page</label>
              <div className="relative">
                <button
                  onClick={() => setIsRowsDropdownOpen(!isRowsDropdownOpen)}
                  className="flex items-center justify-between w-full px-4 py-2.5 text-left border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <span>{selectedRowsOption?.label || "10 rows"}</span>
                  <FaChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isRowsDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isRowsDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsRowsDropdownOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-2">
                      {rowsPerPageOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setItemsPerPage(option.value)
                            setIsRowsDropdownOpen(false)
                          }}
                          className={`w-full px-4 py-2 text-left hover:bg-gray-50 ${itemsPerPage === option.value ? "bg-primary/5 text-primary" : "text-gray-700"}`}
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
        </div>

        {/* Call Logs Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Call Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disposition
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCallLogs.length > 0 ? (
                  filteredCallLogs.map((log, index) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <FaUser className="w-5 h-5 text-primary" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {log.customer_name || "Unknown Caller"}
                              </span>
                              {log.criteria_satisfied && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
                                  <IoIosCheckboxOutline className="w-3 h-3 mr-0.5" />
                                  Qualified
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => log.customer_number && handlePhoneNumberDetail(log.customer_number)}
                              className="text-sm text-gray-500 hover:text-primary transition-colors"
                            >
                              {log.customer_number || "No number"}
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <FaClock className="w-3.5 h-3.5 text-gray-400 mr-2" />
                            <span className="font-medium text-gray-900">
                              {log.call_duration ? formatTime(log.call_duration) : "--:--"}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {log.call_started_at ? FormateTime(log.call_started_at) : "--"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getDispositionColor(log.call_ended_reason)}`}>
                          {log.call_ended_reason ? formatCallEndedReason(log.call_ended_reason) : "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => log.call_id && handleShowDetailsModal(log.call_id)}
                            className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="View details"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => log.call_id && handleShowDeleteModal(log.call_id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete call"
                          >
                            <TbTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FaPhone className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No call logs found</h3>
                        <p className="text-gray-500">
                          {search || dispositionFilter ? "Try adjusting your search or filters" : "No calls have been recorded yet"}
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
          <div className="px-6 py-3 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, callLogs.length)} of {callLogs.length} calls
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6">
            <Loading />
          </div>
        </div>
      )}

      {/* Call Details Modal */}
      <Dialog open={showDetailsModal} onClose={() => setShowDetailsModal(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FaPhone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <Dialog.Title className="text-xl font-semibold text-gray-900">
                      Call Details
                    </Dialog.Title>
                    <p className="text-sm text-gray-500">
                      {selectedLogDetails?.customer_name || "Unknown Caller"} • {selectedLogDetails?.customer_number || "No number"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="px-6 flex space-x-6">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${activeTab === "overview" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("transcript")}
                  className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${activeTab === "transcript" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                  Transcript
                </button>
                <button
                  onClick={() => setActiveTab("audio")}
                  className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${activeTab === "audio" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                  Audio Recording
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "overview" && selectedLogDetails && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium mt-1 ${selectedLogDetails.status === "Completed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {selectedLogDetails.status || "Unknown"}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</label>
                        <p className="text-lg font-medium text-gray-900 mt-1">
                          {selectedLogDetails.call_duration ? formatDuration(selectedLogDetails.call_duration) : "--:--"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Call Started</label>
                        <p className="text-gray-900 mt-1">
                          {selectedLogDetails.call_started_at ? FormateTime(selectedLogDetails.call_started_at) : "--"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">End Reason</label>
                        <p className="text-gray-900 mt-1">{selectedLogDetails.ended_reason || "--"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Criteria Satisfied</label>
                        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium mt-1 ${selectedLogDetails.successEvalution === "true" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                          {selectedLogDetails.successEvalution === "true" ? "Yes" : "No"}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Transferred</label>
                        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium mt-1 ${selectedLogDetails.ended_reason === "assistant-forwarded-call" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>
                          {selectedLogDetails.ended_reason === "assistant-forwarded-call" ? "Yes" : "No"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "audio" && selectedLogDetails?.recording_url && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FiVolume2 className="w-5 h-5 text-gray-400" />
                    <h3 className="font-medium text-gray-900">Audio Recording</h3>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <AudioPlayer
                      playList={[{ id: 1, name: "Call Audio", src: selectedLogDetails.recording_url }]}
                      activeUI={{ all: true, progress: "waveform" }}
                    />
                  </div>
                </div>
              )}

              {activeTab === "transcript" && selectedLogDetails?.transcript && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Call Transcript</h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    {selectedLogDetails.transcript.split("\n").map((line, index) => {
                      const isAI = line.startsWith("AI:")
                      const isUser = line.startsWith("User:")
                      const speaker = isAI ? "AI" : isUser ? "User" : null
                      
                      return speaker ? (
                        <div key={index} className={`mb-3 last:mb-0 ${isAI ? "ml-0" : "mr-0"}`}>
                          <div className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
                            <div className={`max-w-[80%] rounded-lg p-3 ${isAI ? "bg-blue-50 text-blue-900" : "bg-gray-100 text-gray-900"}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <div className={`w-2 h-2 rounded-full ${isAI ? "bg-blue-500" : "bg-gray-500"}`} />
                                <span className="text-xs font-medium">{speaker}</span>
                              </div>
                              <p className="text-sm">{line.replace(`${speaker}: `, "")}</p>
                            </div>
                          </div>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full py-2.5 px-4 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Phone Number Details Modal */}
      {showPhoneNumberModal && phoneNumberDetails && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Call History for Number</h2>
                <button
                  onClick={() => setShowPhoneNumberModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {phoneNumberDetails.map((detail, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          {detail.call_started_at ? FormateTime(detail.call_started_at) : "--"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {detail.call_duration ? formatTime(detail.call_duration) : "--:--"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDispositionColor(detail.call_ended_reason)}`}>
                            {detail.call_ended_reason ? formatCallEndedReason(detail.call_ended_reason) : "--"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowPhoneNumberModal(false)}
                className="w-full py-2.5 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteLog}
        message="Are you sure you want to delete this call log? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Lead Modal */}
      <LeadModal lead={selectedLead} isOpen={showLeadModal} onClose={handleCloseLeadModal} />
    </div>
  )
}

export default UsageReport