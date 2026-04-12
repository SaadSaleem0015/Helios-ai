import { useEffect, useMemo, useState } from "react";
import { backendRequest } from "../Helpers/backendRequest";
import { notifyResponse, notyf } from "../Helpers/notyf";
import ConfirmationModal from "./ConfirmationModal";
import {
  TbChevronDown,
  TbChevronUp,
  TbExternalLink,
  TbArrowRight,
  TbCheck,
} from "react-icons/tb";

interface SheetsStatusResponse {
  is_google_connected: boolean;
  google_email?: string | null;
  is_sheet_configured: boolean;
  sheet_id?: string | null;
  sheet_tab_name?: string | null;
  is_mapping_configured: boolean;
  mapped_fields?: string[] | null;
  has_webhook_secret: boolean;
}

interface SheetsConfigResponse {
  sheet_id: string;
  sheet_tab_name: string;
  available_tabs?: string[];
  message?: string;
  detail?: string;
  success?: boolean;
}

interface SheetsConfigValidateResponse {
  valid: boolean;
  available_tabs?: string[];
  message?: string;
  detail?: string;
}

type SheetsLogStatus = "pending" | "success" | "failed" | "retrying" | "no_config";




type MappingKey =
  | "first_name_col"
  | "last_name_col"
  | "phone_number_col"
  | "address_col"
  | "city_col"
  | "job_description_col"
  | "call_ended_reason_col"
  | "call_datetime_col";

type MappingState = Record<MappingKey, string>;

const initialMappingState: MappingState = {
  first_name_col: "",
  last_name_col: "",
  phone_number_col: "",
  address_col: "",
  city_col: "",
  job_description_col: "",
  call_ended_reason_col: "",
  call_datetime_col: "",
};



function getStatusBadgeClasses(status: SheetsLogStatus | "connected" | "not_connected") {
  switch (status) {
    case "success":
    case "connected":
      return "bg-green-50 text-green-700 border border-green-200";
    case "failed":
      return "bg-red-50 text-red-700 border border-red-200";
    case "pending":
      return "bg-yellow-50 text-yellow-800 border border-yellow-200";
    case "retrying":
      return "bg-blue-50 text-blue-700 border border-blue-200";
    case "no_config":
      return "bg-gray-100 text-gray-700 border border-gray-200";
    case "not_connected":
    default:
      return "bg-gray-100 text-gray-600 border border-gray-200";
  }
}


const mappingFieldMeta: { key: MappingKey; label: string; description: string }[] = [
  { key: "first_name_col", label: "First Name", description: "Lead's first name" },
  { key: "last_name_col", label: "Last Name", description: "Lead's last name" },
  { key: "phone_number_col", label: "Phone Number", description: "Phone number as spoken" },
  { key: "address_col", label: "Address", description: "Street address" },
  { key: "city_col", label: "City", description: "City name" },
  { key: "job_description_col", label: "Job Description", description: "Occupation or role" },
  { key: "call_ended_reason_col", label: "Call End Reason", description: "Why the call ended" },
  { key: "call_datetime_col", label: "Call Date & Time", description: "When the call occurred" },
];

export function GoogleSheetsIntegration() {
  const [status, setStatus] = useState<SheetsStatusResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const [activeStep, setActiveStep] = useState<1 | 2 | 3 >(1);

  // Step 1
  const [authLoading, setAuthLoading] = useState(false);
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const [disconnectLoading, setDisconnectLoading] = useState(false);

  // Step 2
  const [sheetId, setSheetId] = useState("");
  const [sheetTabName, setSheetTabName] = useState("");
  const [availableTabs, setAvailableTabs] = useState<string[]>([]);
  const [configLoading, setConfigLoading] = useState(false);
  const [testConfigLoading, setTestConfigLoading] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [configEditing, setConfigEditing] = useState(false);

  // Step 3
  const [mapping, setMapping] = useState<MappingState>(initialMappingState);
  const [mappingLoading, setMappingLoading] = useState(false);
  const [clearMappingLoading, setClearMappingLoading] = useState(false);
  const [mappingError, setMappingError] = useState<string | null>(null);
  const [mappingEditing, setMappingEditing] = useState(false);

  // Step 4

  // Logs


  const hasDuplicateColumns = useMemo(() => {
    const valueToKeys: Record<string, string[]> = {};
    (Object.keys(mapping) as MappingKey[]).forEach((key) => {
      const raw = mapping[key].trim().toUpperCase();
      if (!raw) return;
      if (!valueToKeys[raw]) valueToKeys[raw] = [];
      valueToKeys[raw].push(key);
    });
    return Object.values(valueToKeys).some((keys) => keys.length > 1);
  }, [mapping]);

  const duplicateColumnsSet = useMemo(() => {
    const dupes = new Set<string>();
    const valueToKeys: Record<string, string[]> = {};
    (Object.keys(mapping) as MappingKey[]).forEach((key) => {
      const raw = mapping[key].trim().toUpperCase();
      if (!raw) return;
      if (!valueToKeys[raw]) valueToKeys[raw] = [];
      valueToKeys[raw].push(key);
    });
    Object.entries(valueToKeys).forEach(([col, keys]) => {
      if (keys.length > 1) dupes.add(col);
    });
    return dupes;
  }, [mapping]);


  const canAccessStep2 = !!status?.is_google_connected;
  const canAccessStep3 = canAccessStep2 && !!status?.is_sheet_configured;

  const refreshStatus = async () => {
    try {
      setStatusLoading(true);
      const res = await backendRequest<SheetsStatusResponse | { detail?: string }>(
        "GET",
        "/sheets/status"
      );
      if ("is_google_connected" in res) {
        setStatus(res);
        if (res.is_sheet_configured && res.sheet_id) setSheetId(res.sheet_id);
        if (res.is_sheet_configured && res.sheet_tab_name) setSheetTabName(res.sheet_tab_name);
      } else {
        setStatus(null);
      }
    } catch (error) {
      console.error("Error fetching sheets status:", error);
    } finally {
      setStatusLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await backendRequest<SheetsConfigResponse | { detail?: string }>(
        "GET",
        "/sheets/config"
      );
      if ("sheet_id" in res) {
        setSheetId(res.sheet_id || "");
        setSheetTabName(res.sheet_tab_name || "");
        setAvailableTabs(res.available_tabs || []);
      }
    } catch (error) {
      console.error("Error fetching sheet config:", error);
    }
  };

  const fetchMapping = async () => {
    try {
      const res = await backendRequest<Partial<MappingState> | { detail?: string }>(
        "GET",
        "/sheets/mapping"
      );
      if (res && !("detail" in res)) {
        setMapping((prev) => ({
          ...prev,
          ...Object.fromEntries(
            (Object.keys(initialMappingState) as MappingKey[]).map((key) => [
              key,
              (res as any)[key] || "",
            ])
          ),
        }));
      }
    } catch (error) {
      console.error("Error fetching mapping:", error);
    }
  };


  useEffect(() => {
    refreshStatus();
    fetchConfig();
    fetchMapping();

    const params = new URLSearchParams(window.location.search);
    const sheetConnected = params.get("sheet_connected");
    const sheetError = params.get("sheet_error");

    if (sheetConnected === "true") {
      notyf.success("Google Sheets connected successfully.");
      refreshStatus();
    }
    if (sheetError === "access_denied") {
      notyf.error("Google access was denied. Please try again.");
    }
    if (sheetError === "token_exchange_failed") {
      notyf.error("Google authorization failed. Please try again.");
    }

    if (sheetConnected || sheetError) {
      window.history.replaceState({}, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const handleConnectGoogle = async () => {
    try {
      setAuthLoading(true);
      const res = await backendRequest<
        | { auth_url: string }
        | { success: false | undefined; detail: string | object }
      >("GET", "/sheets/auth-url");

      if ("auth_url" in res) {
        window.location.href = res.auth_url;
      } else {
        notifyResponse(res);
      }
    } catch (error) {
      console.error("Error initiating Google auth:", error);
      notifyResponse({ success: false, detail: "Failed to start Google authorization" });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      setDisconnectLoading(true);
      const res = await backendRequest<{ success?: boolean; detail?: string }>(
        "DELETE",
        "/sheets/disconnect"
      );
      notifyResponse(res);
      if (res.success) {
        setStatus(null);
        setSheetId("");
        setSheetTabName("");
        setAvailableTabs([]);
        setMapping(initialMappingState);
        await refreshStatus();
      }
    } catch (error) {
      console.error("Error disconnecting Google:", error);
      notifyResponse({ success: false, detail: "Failed to disconnect Google account" });
    } finally {
      setDisconnectLoading(false);
      setDisconnectModalOpen(false);
    }
  };

  const handleTestConfig = async () => {
    if (!sheetId.trim() || !sheetTabName.trim()) {
      setConfigError("Please enter both Spreadsheet ID and Tab Name.");
      return;
    }
    setConfigError(null);
    try {
      setTestConfigLoading(true);
      const body = { sheet_id: sheetId.trim(), sheet_tab_name: sheetTabName.trim() };
      const res = await backendRequest<SheetsConfigValidateResponse | { detail?: string }>(
        "POST",
        "/sheets/config/validate",
        body
      );

      if ("valid" in res && res.valid) {
        setAvailableTabs(res.available_tabs || []);
        notifyResponse({
          success: true,
          detail: res.message || "Sheet and tab are accessible.",
        });
      } else {
        const detail =
          (res as SheetsConfigValidateResponse).message ||
          (res as any)?.detail;
        const msg =
          typeof detail === "string"
            ? detail
            : "Failed to validate sheet configuration.";
        setConfigError(msg);
        notifyResponse({ success: false, detail: msg });
      }
    } catch (error) {
      console.error("Error validating sheet config:", error);
      setConfigError("Failed to validate sheet configuration.");
      notifyResponse({ success: false, detail: "Failed to validate sheet configuration" });
    } finally {
      setTestConfigLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!sheetId.trim() || !sheetTabName.trim()) {
      setConfigError("Please enter both Spreadsheet ID and Tab Name.");
      return;
    }
    setConfigError(null);
    try {
      setConfigLoading(true);
      const body = { sheet_id: sheetId.trim(), sheet_tab_name: sheetTabName.trim() };
      const res = await backendRequest<
        SheetsConfigResponse | { success?: boolean; detail?: string }
      >("POST", "/sheets/config", body);

      if ("sheet_id" in res) {
        setSheetId(res.sheet_id || "");
        setSheetTabName(res.sheet_tab_name || "");
        setAvailableTabs(res.available_tabs || []);
        notifyResponse({
          success: true,
          detail:
            res.message || "Sheet configuration saved and verified successfully.",
        });
        setConfigEditing(false);
        await refreshStatus();
      } else {
        notifyResponse(res as any);
      }
    } catch (error) {
      console.error("Error saving sheet config:", error);
      notifyResponse({ success: false, detail: "Failed to save sheet configuration" });
    } finally {
      setConfigLoading(false);
    }
  };

  const handleMappingChange = (key: MappingKey, value: string) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 5);
    setMapping((prev) => ({ ...prev, [key]: cleaned }));
  };

  const handleSaveMapping = async () => {
    setMappingError(null);
    try {
      setMappingLoading(true);
      const body: Record<string, string | null> = {};
      (Object.keys(mapping) as MappingKey[]).forEach((key) => {
        const val = mapping[key].trim().toUpperCase();
        body[key] = val || null;
      });
      const res = await backendRequest<
        { mapping?: Partial<MappingState>; message?: string } | { success?: boolean; detail?: string }
      >("POST", "/sheets/mapping", body);

      if ("mapping" in res) {
        notifyResponse({
          success: true,
          detail: res.message || "Column mapping saved successfully.",
        });
        setMappingEditing(false);
        await refreshStatus();
      } else {
        const errorRes = res as { success?: boolean; detail?: string };
        if (!errorRes.success && errorRes.detail) {
          setMappingError(errorRes.detail);
        }
        notifyResponse(errorRes);
        if (errorRes.success) {
          setMappingEditing(false);
          await refreshStatus();
        }
      }
    } catch (error: any) {
      const serverDetail: unknown =
        (error as any)?.response?.data?.detail ??
        (error as any)?.detail;
      setMappingError(typeof serverDetail === "string" ? serverDetail : "Failed to save column mapping.");
      notifyResponse({ success: false, detail: "Failed to save column mapping" });
    } finally {
      setMappingLoading(false);
    }
  };

  const handleClearMapping = async () => {
    try {
      setClearMappingLoading(true);
      const res = await backendRequest<{ success?: boolean; detail?: string }>(
        "DELETE",
        "/sheets/mapping"
      );
      notifyResponse(res);
      if (res.success) {
        setMapping(initialMappingState);
        await refreshStatus();
      }
    } catch (error) {
      console.error("Error clearing mapping:", error);
      notifyResponse({ success: false, detail: "Failed to clear mapping" });
    } finally {
      setClearMappingLoading(false);
      setMappingError(null);
    }
  };




  const mappingSummary = useMemo(() => {
    const entries = mappingFieldMeta
      .map((meta) => {
        const val = mapping[meta.key].trim().toUpperCase();
        if (!val) return null;
        return `${meta.label} \u2192 ${val}`;
      })
      .filter(Boolean) as string[];

    if (entries.length === 0) return "No columns mapped yet.";
    if (entries.length <= 2) return entries.join(", ");
    const [first, second, ...rest] = entries;
    return `${first}, ${second} (+${rest.length} more)`;
  }, [mapping]);



  const handleStepHeaderClick = (step: 1 | 2 | 3) => {
    if (step === 2 && !canAccessStep2) return;
    if (step === 3 && !canAccessStep3) return;
    setActiveStep(step === activeStep ? step : step);
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Google Sheets Integration
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Sync your call results into a Google Sheet in four quick steps.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
          <TbExternalLink className="w-4 h-4" />
          <span>Settings · Integrations</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold text-[11px] uppercase tracking-wide">
              4-step setup
            </span>
            {status && (
              <span
                className={
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium " +
                  getStatusBadgeClasses(
                    status.is_google_connected ? "connected" : "not_connected"
                  )
                }
              >
                {status.is_google_connected
                  ? `Connected${status.google_email ? ` as ${status.google_email}` : ""}`
                  : "Not connected"}
              </span>
            )}
          </div>
        
        </div>

        <div className="divide-y divide-gray-100">
          {/* Step 1 */}
          <div>
            <button
              type="button"
              className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              onClick={() => handleStepHeaderClick(1)}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-full border border-gray-300 bg-white text-xs font-semibold text-gray-700">
                  1
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-semibold text-gray-900">
                      Connect Google Account
                    </span>
                    {status?.is_google_connected && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-50 text-green-700 border border-green-200">
                        <TbCheck className="w-3 h-3 mr-0.5" />
                        Completed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Authorize Helios to access your Google Sheets.
                  </p>
                </div>
              </div>
              {activeStep === 1 ? (
                <TbChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <TbChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {activeStep === 1 && (
              <div className="px-4 sm:px-6 pb-5">
                {!status?.is_google_connected ? (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      You will be redirected to Google to grant access. We only need permission to
                      read and write to the sheet you choose.
                    </div>
                    <button
                      type="button"
                      onClick={handleConnectGoogle}
                      disabled={authLoading}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      <span className="w-5 h-5 rounded-sm bg-white flex items-center justify-center overflow-hidden border border-gray-200">
                        <svg viewBox="0 0 48 48" className="w-4 h-4">
                          <path
                            fill="#EA4335"
                            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.02 17.74 9.5 24 9.5z"
                          />
                          <path
                            fill="#4285F4"
                            d="M46.5 24c0-1.47-.13-2.88-.38-4.25H24v8.5h12.7c-.55 2.83-2.2 5.23-4.7 6.84l7.38 5.73C43.9 36.53 46.5 30.73 46.5 24z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M10.54 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.27-3.12.76-4.56l-7.98-6.19A23.893 23.893 0 0 0 0 24c0 3.82.92 7.42 2.56 10.63l7.98-6.04z"
                          />
                          <path
                            fill="#34A853"
                            d="M24 48c6.48 0 11.93-2.13 15.9-5.79l-7.38-5.73C30.52 37.41 27.5 38.5 24 38.5c-6.26 0-11.57-3.52-14.46-8.59L2.56 34.63C6.51 42.47 14.62 48 24 48z"
                          />
                          <path fill="none" d="M0 0h48v48H0z" />
                        </svg>
                      </span>
                      <span>{authLoading ? "Redirecting..." : "Connect with Google"}</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                          <TbCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            Connected to Google
                          </div>
                          <div className="text-xs text-gray-600">
                            {status.google_email
                              ? `Signed in as ${status.google_email}`
                              : "Google account connected"}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDisconnectModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <TbArrowRight className="w-4 h-4 rotate-180" />
                        <span>Disconnect</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Disconnecting will remove your Google connection and sheet configuration. Your
                      column mapping will be preserved.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 2 */}
          <div className={canAccessStep2 ? "" : "opacity-60"}>
            <button
              type="button"
              className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50 disabled:cursor-not-allowed"
              onClick={() => handleStepHeaderClick(2)}
              disabled={!canAccessStep2}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-full border border-gray-300 bg-white text-xs font-semibold text-gray-700">
                  2
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-semibold text-gray-900">
                      Configure Sheet
                    </span>
                    {status?.is_sheet_configured && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-50 text-green-700 border border-green-200">
                        <TbCheck className="w-3 h-3 mr-0.5" />
                        Completed
                      </span>
                    )}
                    {!canAccessStep2 && (
                      <span className="ml-1 text-[11px] text-gray-500">(Locked until Step 1)</span>
                    )}
                  </div>
                  {status?.is_sheet_configured && !configEditing ? (
                    <p className="text-xs text-gray-600 mt-0.5">
                      Writing to <span className="font-medium">{status.sheet_tab_name}</span>{" "}
                      &middot; Sheet ID:{" "}
                      <span className="font-mono text-[11px]">
                        {status.sheet_id?.slice(0, 10)}...
                      </span>
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Set the spreadsheet ID and tab where call data will be written.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {status?.is_sheet_configured && !configEditing && canAccessStep2 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfigEditing(true);
                      setActiveStep(2);
                    }}
                    className="hidden sm:inline-flex items-center px-2.5 py-1 text-xs font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Edit
                  </button>
                )}
                {activeStep === 2 ? (
                  <TbChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <TbChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </button>

            {activeStep === 2 && (
              <div className="px-4 sm:px-6 pb-5">
                {configError && (
                  <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {configError}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Spreadsheet ID
                    </label>
                    <input
                      type="text"
                      value={sheetId}
                      onChange={(e) => setSheetId(e.target.value)}
                      placeholder="1BxiMVs..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    />
                    <p className="mt-1 text-[11px] text-gray-500">
                      Found in your sheet URL:{" "}
                      <span className="font-mono text-[10px]">
                        docs.google.com/spreadsheets/d/[ID HERE]/edit
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tab Name
                    </label>
                    <input
                      type="text"
                      value={sheetTabName}
                      onChange={(e) => setSheetTabName(e.target.value)}
                      placeholder="Sheet1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    />
                    <p className="mt-1 text-[11px] text-gray-500">
                      Exact tab name. Case-sensitive.
                    </p>
                  </div>
                </div>
                {availableTabs.length > 0 && (
                  <div className="mt-3 rounded-md bg-gray-50 border border-gray-200 px-3 py-2">
                    <p className="text-[11px] font-medium text-gray-700 mb-1">
                      Tabs found in this spreadsheet:
                    </p>
                    <p className="text-[11px] text-gray-600 break-words">
                      {availableTabs.join(", ")}
                    </p>
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-3 justify-end">
                  <button
                    type="button"
                    onClick={handleTestConfig}
                    disabled={testConfigLoading || configLoading}
                    className="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testConfigLoading ? "Testing..." : "Test Connection"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveConfig}
                    disabled={configLoading || testConfigLoading}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-hoverdPrimary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {configLoading ? "Saving..." : "Save & Verify"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Step 3 */}
          <div className={canAccessStep3 ? "" : "opacity-60"}>
            <button
              type="button"
              className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50 disabled:cursor-not-allowed"
              onClick={() => handleStepHeaderClick(3)}
              disabled={!canAccessStep3}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-full border border-gray-300 bg-white text-xs font-semibold text-gray-700">
                  3
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-semibold text-gray-900">
                      Map Columns
                    </span>
                    {status?.is_mapping_configured && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-50 text-green-700 border border-green-200">
                        <TbCheck className="w-3 h-3 mr-0.5" />
                        Completed
                      </span>
                    )}
                    {!canAccessStep3 && (
                      <span className="ml-1 text-[11px] text-gray-500">(Locked until Step 2)</span>
                    )}
                  </div>
                  {status?.is_mapping_configured && !mappingEditing ? (
                    <p className="text-xs text-gray-600 mt-0.5">{mappingSummary}</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Map call fields to sheet columns. All fields are optional.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {status?.is_mapping_configured && !mappingEditing && canAccessStep3 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMappingEditing(true);
                      setActiveStep(3);
                    }}
                    className="hidden sm:inline-flex items-center px-2.5 py-1 text-xs font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Edit
                  </button>
                )}
                {activeStep === 3 ? (
                  <TbChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <TbChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </button>

            {activeStep === 3 && (
              <div className="px-4 sm:px-6 pb-5">
                {mappingError && (
                  <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {mappingError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mappingFieldMeta.map((field) => {
                    const value = mapping[field.key];
                    const upper = value.trim().toUpperCase();
                    const isDuplicate = upper && duplicateColumnsSet.has(upper);
                    return (
                      <div
                        key={field.key}
                        className={`flex items-start justify-between gap-3 rounded-lg border px-3 py-2.5 ${
                          isDuplicate
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-800">
                            {field.label}
                          </div>
                          <div className="text-xs text-gray-600">{field.description}</div>
                          {isDuplicate && (
                            <div className="mt-1 text-[11px] text-red-700 font-medium">
                              Column {upper} already used
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end">
                          <input
                            type="text"
                            maxLength={5}
                            value={value}
                            onChange={(e) => handleMappingChange(field.key, e.target.value)}
                            className={`w-16 text-center px-2 py-1.5 text-sm rounded-md border ${
                              isDuplicate
                                ? "border-red-400 bg-white"
                                : "border-gray-300 bg-white"
                            } focus:ring-2 focus:ring-primary focus:border-primary outline-none`}
                            placeholder="A"
                          />
                          <span className="mt-0.5 text-[10px] text-gray-400 uppercase">
                            Col
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex flex-wrap gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setMapping(initialMappingState)}
                    disabled={mappingLoading || clearMappingLoading}
                    className="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reset Inputs
                  </button>
                  <button
                    type="button"
                    onClick={handleClearMapping}
                    disabled={mappingLoading || clearMappingLoading}
                    className="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-red-300 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {clearMappingLoading ? "Clearing..." : "Clear All"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveMapping}
                    disabled={mappingLoading || clearMappingLoading || hasDuplicateColumns}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-hoverdPrimary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {hasDuplicateColumns
                      ? "Fix duplicates to save"
                      : mappingLoading
                      ? "Saving..."
                      : "Save Mapping"}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Sync Logs */}
  
      {/* Disconnect Modal */}
      <ConfirmationModal
        show={disconnectModalOpen}
        onClose={() => (!disconnectLoading ? setDisconnectModalOpen(false) : undefined)}
        onConfirm={handleDisconnectGoogle}
        message="This will remove your Google connection and sheet configuration. Your column mapping will be preserved."
      />



   
    </div>
  );
}

