import { useMemo, useState, useEffect } from "react";
import { Card } from "../Components/Card";
import { backendRequest } from "../Helpers/backendRequest";
import { Loading } from "../Components/Loading";
import { notifyResponse } from "../Helpers/notyf";
import { filterAndPaginate } from "../Helpers/filterAndPaginate";
import { PageNumbers } from "../Components/PageNumbers";
import ConfirmationModal from "../Components/ConfirmationModal";
import { ZohoIntegrationHeader } from "../Components/ZohoIntegration/ZohoIntegrationHeader";
import { ZohoIntegrationForm } from "../Components/ZohoIntegration/ZohoIntegrationForm";
import { ZohoInstructionsModal } from "../Components/ZohoIntegration/ZohoInstructionsModal";
import { ZohoSearchBar } from "../Components/ZohoIntegration/ZohoSearchBar";
import { ZohoLeadsTable } from "../Components/ZohoIntegration/ZohoLeadsTable";

interface ZohoLead extends Record<string, unknown> {
  Converted_Date_Time?: string;
  Email?: string;
  Last_Name?: string;
  Phone?: string;
  Record_Status__s?: string;
  [key: string]: unknown;
}

interface ZohoLeadsResponse {
  leads: ZohoLead[];
}

export function ZohoLeads() {
  const [leads, setLeads] = useState<ZohoLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [code, setCode] = useState("");
  const [isZohoConnected, setIsZohoConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [actionType, setActionType] = useState<"deactivate" | "delete" | null>(null);

  const { filteredItems: filteredLeads, pagesCount, pageNumbers } = useMemo(() => {
    return filterAndPaginate(leads, search, currentPage, 10, 7);
  }, [leads, search, currentPage]);

  // Check Zoho connection status on mount
  useEffect(() => {
    checkZohoConnection();
  }, []);

  // Auto-fetch leads if Zoho is connected (only when connection status changes to connected)
  useEffect(() => {
    if (isZohoConnected && !checkingConnection) {
      fetchZohoLeads();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isZohoConnected, checkingConnection]);

  const checkZohoConnection = async () => {
    setCheckingConnection(true);
    try {
      const response = await backendRequest<{ success: boolean; message: string }>(
        "GET",
        `/zoho-available`
      );
      if (response.success) {
        setIsZohoConnected(true);
      } else {
        setIsZohoConnected(false);
      }
    } catch (error) {
      console.error("Error checking Zoho connection:", error);
      setIsZohoConnected(false);
    } finally {
      setCheckingConnection(false);
    }
  };

  const integrateZoho = async () => {
    if (!clientId.trim() || !clientSecret.trim() || !code.trim()) {
      notifyResponse({ success: false, detail: "Please fill in all fields" });
      return;
    }

    setLoading(true);
    try {
      const response = await backendRequest<{ success: boolean; message?: string; detail?: string }>(
        "POST",
        `/add-zoho`,
        {
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
        }
      );
      notifyResponse(response);
      if (response.success) {
        setIsZohoConnected(true);
        setClientId("");
        setClientSecret("");
        setCode("");
        // Update checkingConnection to false so useEffect doesn't interfere
        setCheckingConnection(false);
        // Fetch leads after successful integration (skip the connection check)
        await fetchZohoLeads(true);
      }
    } catch (error) {
      console.error("Error integrating Zoho:", error);
      notifyResponse({ success: false, detail: "Failed to integrate Zoho CRM" });
    } finally {
      setLoading(false);
    }
  };

  const fetchZohoLeads = async (skipCheck: boolean = false) => {
    if (!skipCheck && !isZohoConnected) {
      notifyResponse({ success: false, detail: "Please integrate Zoho CRM first" });
      return;
    }

    setLoading(true);
    try {
      const response = await backendRequest<ZohoLeadsResponse | { success: false; detail: string }>(
        "GET",
        `/fetch-zoho-leads`
      );
      if (response && 'leads' in response && Array.isArray(response.leads)) {
        setLeads(response.leads);
      } else {
        console.error("Fetched data is not in expected format:", response);
        setLeads([]);
      }
    } catch (error) {
      console.error("Error fetching Zoho leads:", error);
      notifyResponse({ success: false, detail: "Failed to fetch Zoho leads" });
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
        {/* Zoho Integration Section */}
        <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          <ZohoIntegrationHeader
            checkingConnection={checkingConnection}
            isZohoConnected={isZohoConnected}
          />

          {/* Integration Form */}
          {!isZohoConnected && (
            <ZohoIntegrationForm
              clientId={clientId}
              clientSecret={clientSecret}
              code={code}
              onClientIdChange={setClientId}
              onClientSecretChange={setClientSecret}
              onCodeChange={setCode}
              onIntegrate={integrateZoho}
              loading={loading}
              onShowInstructions={() => setShowInstructionsModal(true)}
            />
          )}
        </div>

        {/* Action Buttons and Search Bar */}
        {isZohoConnected && (
          <ZohoSearchBar
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
            onFetchLeads={fetchZohoLeads}
            loading={loading}
            selectedLeadsCount={selectedLeads.size}
            onDeactivate={handleDeactivate}
            onDelete={handleDelete}
          />
        )}

        {/* Table */}
        <ZohoLeadsTable
          leads={filteredLeads}
          isZohoConnected={isZohoConnected}
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

        {isZohoConnected && (
          <PageNumbers
            pageNumbers={pageNumbers}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pagesCount={pagesCount}
          />
        )}

        {/* Instructions Modal */}
        <ZohoInstructionsModal
          isOpen={showInstructionsModal}
          onClose={() => setShowInstructionsModal(false)}
        />
      </Card>
    </div>
  );
}
