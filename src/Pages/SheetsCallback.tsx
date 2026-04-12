import { useEffect } from "react";
import { PageLoading } from "../Components/Loading";
import { notyf } from "../Helpers/notyf";

export default function SheetsCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sheetConnected = params.get("sheet_connected");
    const sheetError = params.get("sheet_error");

    if (sheetConnected === "true") {
      notyf.success("Google Sheets connected successfully.");
    } else if (sheetError === "access_denied") {
      notyf.error("Google access was denied. Please try again.");
    } else if (sheetError === "token_exchange_failed") {
      notyf.error("Google authorization failed. Please try again.");
    }

    const forwardParams = new URLSearchParams();
    if (sheetConnected) forwardParams.set("sheet_connected", sheetConnected);
    if (sheetError) forwardParams.set("sheet_error", sheetError);

    const target =
      "/settings/integrations" +
      (forwardParams.toString() ? `?${forwardParams.toString()}` : "");

    window.location.replace(target);
  }, []);

  return <PageLoading />;
}

