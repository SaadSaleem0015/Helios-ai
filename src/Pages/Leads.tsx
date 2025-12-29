import { useEffect, useMemo, useState } from "react";
import { Card } from "../Components/Card";
import { backendRequest } from "../Helpers/backendRequest";
import { Loading } from "../Components/Loading";
import { TbTrash, TbEye } from "react-icons/tb";
import { notifyResponse } from "../Helpers/notyf";
import { Input } from "../Components/Input";
import { filterAndPaginate } from "../Helpers/filterAndPaginate";
import { PageNumbers } from "../Components/PageNumbers";
import { useSearchParams } from "react-router-dom";
import LeadModal from "../Components/LeadModal";
import { FcCalendar, FcPhone } from "react-icons/fc";
import { AddLeadModal } from "../Components/AddLeadModal";
import 'react-datepicker/dist/react-datepicker.css';
import { CiFilter } from "react-icons/ci";
import DatePicker from "react-datepicker";
import { HiAdjustmentsHorizontal, HiArrowUturnLeft } from "react-icons/hi2";
import ConfirmationModal from "../Components/ConfirmationModal";
import { FormateTime } from "../Helpers/formateTime";

interface Lead extends Record<string, unknown> {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  salesforce_id: string;
  add_date: string;
  mobile: string;
  other_data?: string[];
  file_id: number;
  state: string
  timezone: string | null
}

interface Assistant {
  id: string;
  name: string;
  vapi_assistant_id: string;
}

export function Leads() {
  const [searchParams] = useSearchParams();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(null);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editStateModalVisible, setEditStateModalVisible] = useState(false);
  const [newStateValue, setNewStateValue] = useState('');

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(undefined);
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(undefined);
  const [salesforceId, setSalesforceId] = useState('');
  const[tempSalesforceId,setTempSalesforceId] = useState('')
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [leadIdsToDelete, setLeadIdsToDelete] = useState<number[]>([]);
  const [leadToAddDnc, setLeadToAddDnc] = useState<number | null>(null);
  const [dncConfirmationModalVisible, setDncConfirmationModalVisible] = useState<boolean>(false);

  const { filteredItems: filteredLeads, pagesCount, pageNumbers } = useMemo(() => {
    const fromDate = startDate ? new Date(startDate) : undefined;
    const toDate = endDate ? new Date(endDate) : undefined;
    
    return filterAndPaginate(leads, search, currentPage, 10, 7, fromDate, toDate ,salesforceId); 
  }, [leads, search, currentPage, startDate, endDate,salesforceId]); 

  useEffect(() => {
    fetchAssistants();
    fetchLeads(); 
  }, []);

  const urlFile = searchParams.get("url")
  
  const fetchLeads = async () => {
    const fileId = searchParams.get("file_id");
    setLoading(true);
    const response = await backendRequest<Lead[], []>(
      "GET",
      fileId ? `/leads?file_id=${fileId}` : "/leads"
    );
    setLeads(response);
    setLoading(false);
  };

  const fetchAssistants = async () => {
    try {
      const response = await backendRequest<Assistant[]>('GET', '/get-user-assistants');
      setAssistants(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching assistants:', error);
    }
  };

  const handleFilterApply = () => {
    setSalesforceId(tempSalesforceId)
    setEndDate(tempEndDate)
    setStartDate(tempStartDate)
    setFilterModalVisible(false);
    setCurrentPage(1);
  };

  const remove = async (leadIds: number[]) => {
    const response = await backendRequest("DELETE", "/leads", { ids: leadIds });
    notifyResponse(response);
    if (response.success)
      setLeads(oldLeads => oldLeads.filter(lead => !leadIds.includes(lead.id)));
  };

  const handleConfirmAddLeadToDNC = async () =>{
    const leadId = leadToAddDnc
    try {
      const res = await backendRequest("POST", `/add-lead-todnc/${leadId}`)
      notifyResponse(res)
      setDncConfirmationModalVisible(false) 
      setLeadToAddDnc(null)
    } catch (error) {
      console.log(error);
    }
  }

  const handleCall = async () => {
    setLoading(true)
    if (selectedLead) {
      try {
        const response = await backendRequest("POST", `/assistant-call/${selectedAssistant}/${selectedLead.id}`);
        notifyResponse(response);
        setModalVisible(false);
      } catch (error) {
        console.error("Failed to Call:", error);
      } finally {
        setLoading(false)
      }
    }
  };

  const handleModal = (lead: Lead) => {
    setSelectedLead(lead);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLead(null);
  };

  const handleCallModal = (lead: Lead) => {
    setSelectedLead(lead);
    setModalVisible(true);
  };

  const handleCloseAssitantModal = () => {
    setModalVisible(false);
    setSelectedAssistant(null);
  };

  const handleAddLeadModalOpen = () => {
    setIsAddLeadModalOpen(true);
  };

  const handleAddLeadModalClose = () => {
    setIsAddLeadModalOpen(false);
  };

  const handleDeleteConfirmation = (leadIds: number[]) => {
    setLeadIdsToDelete(leadIds);
    setConfirmationModalVisible(true);
  };

  const handleAddLeadToDNC = (leadId: number) => {
    setLeadToAddDnc(leadId)
    setDncConfirmationModalVisible(true)
  }

  const handleConfirmDelete = async () => {
    await remove(leadIdsToDelete);
    setConfirmationModalVisible(false);
  };
  
  const handleAddLead = async (lead: { first_name: string; last_name: string; email: string; mobile: string; startDate: string; salesforce_id: string }) => {
    const fileId = searchParams.get("file_id");
    const leadData = {
      ...lead,
      add_date: lead.startDate,
      file_id: fileId ? Number(fileId) : null
    };

    const response = await backendRequest("POST", "/add_manually_lead", leadData);
    notifyResponse(response);
    if (response.success) {
      setLeads([...leads, leadData]);
    }
    fetchLeads()
  };

  const handleResetFilters = () => {
    setTempEndDate(undefined)
    setTempSalesforceId('')
    setTempStartDate(undefined)
    setEndDate(undefined)
    setSalesforceId('')
    setStartDate(undefined)
  }

  const handleUpdateState = async () => {
    if (!editingLead) return;
    
    try {
      setLoading(true);
      const state = newStateValue
      const response = await backendRequest("PUT", `/update-lead-state/${editingLead.id}`,{state});
      
      notifyResponse(response);
      if (response.success) {
        setLeads(leads.map(lead => 
          lead.id === editingLead.id ? {
            ...lead, 
            state: newStateValue,
            timezone: "corrected" 
          } : lead
        ));
        setEditStateModalVisible(false);
      }
    } catch (error) {
      console.error("Error updating state:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <Loading />
        </div>
      )}
      <Card>
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6 items-center w-full">
          <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto mb-4 sm:mb-0 sm:mr-2 gap-2">
            <Input
              value={search}
              onChange={e => {
                setSearch(e.currentTarget.value);
                setCurrentPage(1);
              }}
              placeholder="Search..."
              className="w-full sm:w-auto h-full text-sm lg:text-lg px-4 py-2 sm:py-3 rounded-md border border-gray-300"
            />
            {/* <button
              onClick={() => setFilterModalVisible(true)}
              className="flex items-center gap-3 w-full sm:w-auto bg-primary hover:bg-hoverdPrimary text-white font-semibold text-sm lg:text-lg px-6 py-2 sm:py-3 rounded-md shadow-lg transition duration-300 ease-in-out sm:ml-3"
            >
              <CiFilter className="text-xl lg:text-2xl" />
              <span>Filter Search</span>
            </button> */}
          </div>
          {!urlFile && (
            <div className="flex flex-col sm:flex-row sm:justify-start items-center w-full sm:w-auto gap-2">
              <button
                onClick={handleAddLeadModalOpen}
                className="w-full sm:w-auto bg-primary hover:bg-hoverdPrimary text-white font-semibold text-sm lg:text-lg px-6 py-2 sm:py-3 rounded-lg shadow-md transition-all duration-300 ease-in-out sm:ml-2"
              >
                Add
              </button>
              <AddLeadModal
                isOpen={isAddLeadModalOpen}
                onClose={handleAddLeadModalClose}
                onSubmit={handleAddLead}
              />
            </div>
          )}
        </div>

        <div className="mb-6">
  {/* Table */}
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Lead Information
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact Details
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              DNC
            </th> */}
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredLeads.length > 0 ? (
            filteredLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                {/* Lead Information */}
                <td className="px-6 py-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {lead.first_name?.[0]}{lead.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {lead.first_name} {lead.last_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Added {FormateTime(lead.add_date)}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Contact Details */}
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-900">{lead.email}</div>
                    <div className="text-sm text-gray-600">{lead.mobile}</div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  {lead.timezone === null ? (
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-900">{lead.state || "N/A"}</div>
                      <button
                        onClick={() => {
                          setEditingLead(lead);
                          setNewStateValue(lead.state);
                          setEditStateModalVisible(true);
                        }}
                        className="inline-flex items-center px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium hover:bg-red-100 transition-colors"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Fix State
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-900">{lead.state}</div>
                  )}
                </td>

                {/* DNC Button */}
                {/* <td className="px-6 py-4">
                  <button
                    onClick={() => handleAddLeadToDNC(lead.id)}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Add to DNC
                  </button>
                </td> */}

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleCallModal(lead)}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Call Lead"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleModal(lead)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteConfirmation([lead.id])}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Lead"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-6 py-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 3.747a8 8 0 00-15 0" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
                  <p className="text-gray-500">Upload a file to import leads</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>

  {/* Edit State Modal */}
  {editStateModalVisible && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Update Lead State</h2>
              <p className="text-sm text-gray-600">This lead has an incorrect timezone</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter correct state
            </label>
            <input
              value={newStateValue}
              onChange={(e) => setNewStateValue(e.target.value)}
              placeholder="e.g., California, New York"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-2">
              Updating the state will fix the timezone issue
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setEditStateModalVisible(false)}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateState}
              className="flex-1 px-4 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Update State
            </button>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* AI Assistant Modal */}
  {modalVisible && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Call Lead</h2>
              <p className="text-sm text-gray-600">Select an AI assistant to call</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Assistant
            </label>
            <select
              value={selectedAssistant || ''}
              onChange={(e) => setSelectedAssistant(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={loading}
            >
              <option value="" disabled>Select an assistant...</option>
              {assistants.map((assistant) => (
                <option key={assistant.id} value={assistant.vapi_assistant_id}>
                  {assistant.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCloseAssitantModal}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCall}
              disabled={!selectedAssistant || loading}
              className={`flex-1 px-4 py-2.5 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                !selectedAssistant || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Calling...
                </>
              ) : (
                'Start Call'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Filter Modal */}
  {filterModalVisible && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Filter Leads</h2>
                <p className="text-sm text-gray-600">Filter leads by date range</p>
              </div>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Reset All
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <DatePicker
                  selected={tempStartDate}
                  onChange={(date) => setTempStartDate(date as Date)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholderText="Select start date"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <DatePicker
                  selected={tempEndDate}
                  onChange={(date) => setTempEndDate(date as Date)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholderText="Select end date"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={() => setFilterModalVisible(false)}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleFilterApply}
              className="flex-1 px-4 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  )}
</div>
        {confirmationModalVisible && (
          <ConfirmationModal
            show={confirmationModalVisible}
            onClose={() => setConfirmationModalVisible(false)}
            onConfirm={handleConfirmDelete}
            message="Are you sure you want to delete this lead? This action cannot be undone."
          />
        )}
        {dncConfirmationModalVisible && (
          <ConfirmationModal
            show={dncConfirmationModalVisible}
            onClose={() => setDncConfirmationModalVisible(false)}
            onConfirm={handleConfirmAddLeadToDNC}
            message="Are you sure you want to add this lead to DNC? This action cannot be undone."
          />
        )}

        <PageNumbers
          pageNumbers={pageNumbers}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pagesCount={pagesCount}
        />

        <LeadModal
          lead={selectedLead}
          isOpen={showModal}
          onClose={handleCloseModal}
        />
      </Card>
    </div>
  );
}