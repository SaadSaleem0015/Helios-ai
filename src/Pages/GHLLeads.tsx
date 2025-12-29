import { useMemo, useState } from "react";
import { Card } from "../Components/Card";
import { backendRequest } from "../Helpers/backendRequest";
import { Loading } from "../Components/Loading";
import { notifyResponse } from "../Helpers/notyf";
import { Input } from "../Components/Input";
import { filterAndPaginate } from "../Helpers/filterAndPaginate";
import { PageNumbers } from "../Components/PageNumbers";
import ConfirmationModal from "../Components/ConfirmationModal";
import { FormateTime } from "../Helpers/formateTime";

interface GHLLead extends Record<string, unknown> {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  add_date: string;
  deleted: boolean;
  [key: string]: unknown;
}

export function GHLLeads() {
  const [leads, setLeads] = useState<GHLLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ghlKey, setGhlKey] = useState("");
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [actionType, setActionType] = useState<"deactivate" | "delete" | null>(null);

  // Filter out deleted leads
  const activeLeads = useMemo(() => {
    return leads.filter(lead => !lead.deleted);
  }, [leads]);

  const { filteredItems: filteredLeads, pagesCount, pageNumbers } = useMemo(() => {
    return filterAndPaginate(activeLeads, search, currentPage, 10, 7);
  }, [activeLeads, search, currentPage]);

  const fetchGHLLeads = async () => {
    if (!ghlKey.trim()) {
      notifyResponse({ success: false, detail: "Please enter a GHL key" });
      return;
    }

    setLoading(true);
    try {
      const response = await backendRequest<GHLLead[], []>(
        "GET",
        `/ghl-leads?key=${encodeURIComponent(ghlKey)}`
      );
      if (Array.isArray(response)) {
        setLeads(response);
      } else {
        console.error("Fetched data is not an array:", response);
        setLeads([]);
      }
    } catch (error) {
      console.error("Error fetching GHL leads:", error);
      notifyResponse({ success: false, detail: "Failed to fetch GHL leads" });
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (leadId: number) => {
    setSelectedLeads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(leadId)) {
        newSet.delete(leadId);
      } else {
        newSet.add(leadId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map(lead => lead.id)));
    }
  };

  const handleDeactivate = () => {
    if (selectedLeads.size === 0) return;
    setActionType("deactivate");
    setConfirmationModalVisible(true);
  };

  const handleDelete = () => {
    if (selectedLeads.size === 0) return;
    setActionType("delete");
    setConfirmationModalVisible(true);
  };

  const handleConfirmAction = async () => {
    if (selectedLeads.size === 0 || !actionType) return;

    const leadIds = Array.from(selectedLeads);
    setLoading(true);

    try {
      if (actionType === "deactivate") {
        const response = await backendRequest("POST", "/ghl-leads/deactivate", { ids: leadIds });
        notifyResponse(response);
        if (response.success) {
          setLeads(prevLeads =>
            prevLeads.map(lead =>
              leadIds.includes(lead.id) ? { ...lead, deleted: true } : lead
            )
          );
          setSelectedLeads(new Set());
        }
      } else if (actionType === "delete") {
        const response = await backendRequest("DELETE", "/ghl-leads", { ids: leadIds });
        notifyResponse(response);
        if (response.success) {
          setLeads(prevLeads => prevLeads.filter(lead => !leadIds.includes(lead.id)));
          setSelectedLeads(new Set());
        }
      }
    } catch (error) {
      console.error(`Error ${actionType}ing leads:`, error);
      notifyResponse({ success: false, detail: `Failed to ${actionType} leads` });
    } finally {
      setLoading(false);
      setConfirmationModalVisible(false);
      setActionType(null);
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
        {/* GHL Key Input Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GHL API Key
            </label>
            <div className="flex gap-2">
              <Input
                type="password"
                value={ghlKey}
                onChange={(e) => setGhlKey(e.currentTarget.value)}
                placeholder="Enter your GHL API key"
                className="flex-1 h-full text-sm lg:text-lg px-4 py-2 sm:py-3 rounded-md border border-gray-300"
              />
              <button
                onClick={fetchGHLLeads}
                disabled={loading || !ghlKey.trim()}
                className="bg-primary hover:bg-hoverdPrimary text-white font-semibold text-sm lg:text-lg px-6 py-2 sm:py-3 rounded-md shadow-md transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Fetch Leads
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-600">
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Your GHL API key will be securely stored and encrypted. It will only be used to fetch leads from your GHL account.
            </p>
          </div>
        </div>

        {/* Action Buttons (shown when leads are selected) */}
        {selectedLeads.size > 0 && (
          <div className="mb-4 flex gap-3">
            <button
              onClick={handleDeactivate}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold text-sm lg:text-lg px-6 py-2 sm:py-3 rounded-md shadow-md transition-all duration-300 ease-in-out"
            >
              Deactivate ({selectedLeads.size})
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold text-sm lg:text-lg px-6 py-2 sm:py-3 rounded-md shadow-md transition-all duration-300 ease-in-out"
            >
              Delete ({selectedLeads.size})
            </button>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setCurrentPage(1);
            }}
            placeholder="Search leads..."
            className="w-full sm:w-auto h-full text-sm lg:text-lg px-4 py-2 sm:py-3 rounded-md border border-gray-300"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead Information
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedLeads.has(lead.id)}
                          onChange={() => handleToggleSelect(lead.id)}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {lead.first_name?.[0] || ""}{lead.last_name?.[0] || ""}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {lead.first_name} {lead.last_name}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900">{lead.email || "N/A"}</div>
                          <div className="text-sm text-gray-600">{lead.mobile || "N/A"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {lead.add_date ? FormateTime(lead.add_date) : "N/A"}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 3.747a8 8 0 00-15 0" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
                        <p className="text-gray-500">
                          {ghlKey ? "Enter a GHL key and click Fetch Leads to get started" : "Enter a GHL key and click Fetch Leads to get started"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confirmation Modal */}
        {confirmationModalVisible && (
          <ConfirmationModal
            show={confirmationModalVisible}
            onClose={() => {
              setConfirmationModalVisible(false);
              setActionType(null);
            }}
            onConfirm={handleConfirmAction}
            message={`Are you sure you want to ${actionType} ${selectedLeads.size} lead(s)? This action ${actionType === "delete" ? "cannot" : "can"} be undone.`}
          />
        )}

        <PageNumbers
          pageNumbers={pageNumbers}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pagesCount={pagesCount}
        />
      </Card>
    </div>
  );
}

