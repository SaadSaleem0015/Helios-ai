import { useMemo, useState, useEffect } from "react";
import { Card } from "../Components/Card";
import { backendRequest } from "../Helpers/backendRequest";
import { Loading } from "../Components/Loading";
import { notifyResponse } from "../Helpers/notyf";
import { filterAndPaginate } from "../Helpers/filterAndPaginate";
import { PageNumbers } from "../Components/PageNumbers";
import ConfirmationModal from "../Components/ConfirmationModal";
import { HubSpotIntegrationHeader } from "../Components/HubSpotIntegration/HubSpotIntegrationHeader";
import { HubSpotIntegrationForm } from "../Components/HubSpotIntegration/HubSpotIntegrationForm";
import { HubSpotInstructionsModal } from "../Components/HubSpotIntegration/HubSpotInstructionsModal";
import { HubSpotSearchBar } from "../Components/HubSpotIntegration/HubSpotSearchBar";
import { HubSpotLeadsTable } from "../Components/HubSpotIntegration/HubSpotLeadsTable";

interface HubSpotLead {
  id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  mobile?: string;
  other_data?: {
    properties?: {
      lastname?: string;
      phone?: string;
      email?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface HubSpotLeadsResponse {
  leads: HubSpotLead[];
  message?: string;
}

interface HubSpotConnectResponse {
  success: boolean;
  authorize_url?: string;
  message?: string;
  detail?: string;
}

export function HubSpotLeads() {
  const [leads, setLeads] = useState<HubSpotLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isHubSpotConnected, setIsHubSpotConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [actionType, setActionType] = useState<"deactivate" | "delete" | null>(null);

  const { filteredItems: filteredLeads, pagesCount, pageNumbers } = useMemo(() => {
    return filterAndPaginate(leads, search, currentPage, 10, 7);
  }, [leads, search, currentPage]);

  // Check HubSpot connection status on mount
  useEffect(() => {
    checkHubSpotConnection();
  }, []);

  // Auto-fetch leads if HubSpot is connected (only when connection status changes to connected)
  useEffect(() => {
    if (isHubSpotConnected && !checkingConnection) {
      fetchHubSpotLeads();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHubSpotConnected, checkingConnection]);

  // Check for OAuth callback success in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    if (success === "hubspot") {
      notifyResponse({ success: true, detail: "HubSpot CRM connected successfully!" });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Check connection status
      checkHubSpotConnection();
    }
  }, []);

  const checkHubSpotConnection = async () => {
    setCheckingConnection(true);
    try {
      const response = await backendRequest<{ success: boolean; message: string }>(
        "GET",
        `/crm/hubspot-available`
      );
      if (response.success) {
        setIsHubSpotConnected(true);
      } else {
        setIsHubSpotConnected(false);
      }
    } catch (error) {
      console.error("Error checking HubSpot connection:", error);
      setIsHubSpotConnected(false);
    } finally {
      setCheckingConnection(false);
    }
  };

  const connectHubSpot = async () => {
    setLoading(true);
    try {
      const response = await backendRequest<HubSpotConnectResponse>(
        "GET",
        `/crm/connect-hubspot`
      );
      
      if (response.success && response.authorize_url) {
        // Redirect user to HubSpot authorization page
        window.location.href = response.authorize_url;
      } else {
        notifyResponse({ success: false, detail: response.detail || response.message || "Failed to connect HubSpot CRM" });
        setLoading(false);
      }
    } catch (error) {
      console.error("Error connecting HubSpot:", error);
      notifyResponse({ success: false, detail: "Failed to connect HubSpot CRM" });
      setLoading(false);
    }
  };

  const fetchHubSpotLeads = async (skipCheck: boolean = false) => {
    if (!skipCheck && !isHubSpotConnected) {
      notifyResponse({ success: false, detail: "Please integrate HubSpot CRM first" });
      return;
    }

    setLoading(true);
    try {
      const response = await backendRequest<HubSpotLeadsResponse | { success: false; detail: string }>(
        "GET",
        `/crm/fetch-hubspot-leads`
      );
      if (response && 'leads' in response && Array.isArray(response.leads)) {
        setLeads(response.leads);
        if (response.message) {
          notifyResponse({ success: true, detail: response.message });
        }
      } else {
        console.error("Fetched data is not in expected format:", response);
        setLeads([]);
      }
    } catch (error) {
      console.error("Error fetching HubSpot leads:", error);
      notifyResponse({ success: false, detail: "Failed to fetch HubSpot leads" });
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (index: number) => {
    setSelectedLeads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map((_, index) => index)));
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

    const leadIndices = Array.from(selectedLeads);
    setLoading(true);

    try {
      if (actionType === "deactivate") {
        // Handle deactivate logic if needed
        notifyResponse({ success: true, detail: "Leads deactivated successfully" });
        setSelectedLeads(new Set());
      } else if (actionType === "delete") {
        // Handle delete logic if needed
        setLeads(prevLeads => prevLeads.filter((_, index) => !leadIndices.includes(index)));
        setSelectedLeads(new Set());
        notifyResponse({ success: true, detail: "Leads deleted successfully" });
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
        {/* HubSpot Integration Section */}
        <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          <HubSpotIntegrationHeader
            checkingConnection={checkingConnection}
            isHubSpotConnected={isHubSpotConnected}
          />

          {/* Integration Form */}
          {!isHubSpotConnected && (
            <HubSpotIntegrationForm
              onConnect={connectHubSpot}
              loading={loading}
              onShowInstructions={() => setShowInstructionsModal(true)}
            />
          )}
        </div>

        {/* Action Buttons and Search Bar */}
        {isHubSpotConnected && (
          <HubSpotSearchBar
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
            onFetchLeads={fetchHubSpotLeads}
            loading={loading}
            selectedLeadsCount={selectedLeads.size}
            onDeactivate={handleDeactivate}
            onDelete={handleDelete}
          />
        )}

        {/* Table */}
        <HubSpotLeadsTable
          leads={filteredLeads}
          isHubSpotConnected={isHubSpotConnected}
          selectedLeads={selectedLeads}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
        />

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

        {isHubSpotConnected && (
          <PageNumbers
            pageNumbers={pageNumbers}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pagesCount={pagesCount}
          />
        )}

        {/* Instructions Modal */}
        <HubSpotInstructionsModal
          isOpen={showInstructionsModal}
          onClose={() => setShowInstructionsModal(false)}
        />
      </Card>
    </div>
  );
}

