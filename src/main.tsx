import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { Login } from "./Pages/Login";
import { Signup } from "./Pages/Signup";
import "./index.css";
import { ForgetPassword } from "./Pages/ForgetPassword";
import { Dashboard } from "./Pages/Dashboard";
import { ActivateAccount } from "./Pages/ActivateAccount";
import { PanelLayout } from "./Components/PanelLayout";
import { Leads } from "./Pages/Leads";
import Assistant from "./Pages/Assistant";
import GetNumbers from "./Pages/GetNumbers";
import { Profile } from "./Pages/Profile";
import { LoginChecker } from "./Components/LoginChecker";
import { Files } from "./Pages/Files";
import CreateAssitant from "./Pages/CreateAssistant";
import { AdminDashboard } from "./Pages/AdminPages/AdminDashboard";
import { AdminPanelLayout } from "./Pages/AdminPages/AdminPanelLayout";
// import { AdminFiles } from "./Pages/AdminPages/AdminFiles";
// import { AdminLeads } from "./Pages/AdminPages/AdminLeads";
// import AdminGetNumbers from "./Pages/AdminPages/AdminGetNumbers";
import { AdminProfile } from "./Pages/AdminPages/AdminProfile";
// import { Documents } from "./Pages/Documents";

// import AdminUpdateAssistant from "./Pages/AdminPages/AdminUpdateAssistant";
import AcceptInvitation from "./Pages/AcceptInvitation";
import AdminTermconditions from "./Pages/AdminPages/AdminTermconditions";
import UsageReport from "./Pages/UsageReport";
// import Payment from "./Pages/Payment";
import SuccessPage from "./Pages/SuccessPage";
import CanceledPage from "./Pages/CanceledPage";
// import AdminSiteManagement from "./Pages/AdminPages/AdminSiteManagement";
import BillingReport from "./Pages/BillingReport";

import { AdminShowAccounts } from "./Pages/AdminPages/AdminShowAccounts";
// import AssistantsPage from "./Components/AdminAccountsDetail/AssistantsPage";
// import CallLogsPage from "./Components/AdminAccountsDetail/CallLogsPage";
// import PhoneNumbersPage from "./Components/AdminAccountsDetail/PhoneNumbersPage";
import ProfitLossReport from "./Pages/AdminPages/ProfitLossReport";
// import { AdminShowUsers } from "./Pages/AdminPages/AdminShowUsers";
// import UsersPage from "./Components/AdminAccountsDetail/UsersPage";
// import AdminCallReports from "./Pages/AdminPages/AdminCallReports";
import { ViewLeads } from "./Pages/ViewLeads";
import { GHLLeads } from "./Pages/GHLLeads";
// import ReportDashboard from "./Pages/Reportdashboard";
// import MakePayment from "./Pages/MakePayment";
// import PaymentMethod from "./Pages/PaymentMethod";

// import { ViewDocuments } from "./Components/ViewDocuments";
import { AdminDnc } from "./Pages/AdminPages/AdminDnc";
// import { DNCLeads } from "./Pages/DNCLeads";
// import AccountPLreportPage from "./Components/AdminAccountsDetail/AccountPLreportPage";
import AdminDefaultSettings from "./Pages/AdminPages/AdminDefaultSettings";
// import AdminGeneralSettings from "./Pages/AdminPages/AdminGeneralSettings";

// import { AdminDncLists } from "./Pages/AdminPages/AdminDncLists";
// import AccountDNCLeads from "./Components/AdminAccountsDetail/AccountDncLeads";
import BusinessSchedule from "./Pages/BusinessSchedule";
// import AdminPurchaseNumbers from "./Pages/AdminPages/AdminPurchaseNumber";
// import OnboardCall from "./Pages/AdminPages/OnboardCall";
// import NotFoundPage from "./Components/NotFound";
// import Appointment from "./Pages/Appointement";
// import Appointments from "./Pages/AdminPages/AppointmentsTable";
// import AppointmentSuccess from "./Pages/AdminPages/AppointmentSuccess";
import CannotAccessPage from "./Components/CantAccess";
// import CancelSubscription from "./Pages/CancelSubscription";
// import { AdminPhoneNumbers } from "./Pages/AdminPages/AdminPhoneNumbers";
import ErrorBoundary from "./Components/ErrorBoundary";
import "./index.css"
import { ViewDocuments } from "./Components/ViewDocuments";
import { Documents } from "./Pages/Documents";
import ReportDashboard from "./Pages/Reportdashboard";
import PaymentMethod from "./Pages/PaymentMethod";
import Payment from "./Pages/Payment";
import MakePayment from "./Pages/MakePayment";
import CancelSubscription from "./Pages/CancelSubscription";
import AdminCallReports from "./Pages/AdminPages/AdminCallReports";
import AdminGeneralSettings from "./Pages/AdminPages/AdminGeneralSettings";
import { AdminPhoneNumbers } from "./Pages/AdminPages/AdminPhoneNumbers";
import { ZohoLeads } from "./Pages/ZohoLeads";
import { HubSpotLeads } from "./Pages/HubSpotLeads";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" />,
  },
  {
    path: 'can-not-access',
    element: <ErrorBoundary><CannotAccessPage /></ErrorBoundary>
  },
  // {
  //   path: "*",
  //   element: <ErrorBoundary><NotFoundPage /></ErrorBoundary>
  // },
  // {
  //   path: "/appointment-schedulde",
  //   element: <ErrorBoundary><AppointmentSuccess /></ErrorBoundary>,
  // },
  // {
  //   path: "/Appointment",
  //   element: <ErrorBoundary><Appointment /></ErrorBoundary>,
  // },
  {
    path: "/accept_invitation",
    element: <ErrorBoundary><AcceptInvitation /></ErrorBoundary>,
  },
  {
    path: "/login",
    element: (
      <LoginChecker allowedUser="not-logged-in">
        <ErrorBoundary><Login /></ErrorBoundary>
      </LoginChecker>
    ),
  },
  {
    path: "/signup",
    element: (
      <LoginChecker allowedUser="not-logged-in">
        <ErrorBoundary><Signup /></ErrorBoundary>
      </LoginChecker>
    ),
  },
  {
    path: "/forget-password",
    element: (
      <LoginChecker allowedUser="not-logged-in">
        <ErrorBoundary><ForgetPassword /></ErrorBoundary>
      </LoginChecker>
    ),
  },
  {
    path: "/activate-account",
    element: <ErrorBoundary><ActivateAccount /></ErrorBoundary>,
  },
  {
    path: "/admin",
    element: (
      <LoginChecker allowedUser="logged-in">
        <ErrorBoundary><AdminPanelLayout /></ErrorBoundary>
      </LoginChecker>
    ),
    children: [
      {
        path: "dashboard",
        element: <ErrorBoundary><AdminDashboard /></ErrorBoundary>,
      },
      // {
      //   path: "appointments",
      //   element: <ErrorBoundary><Appointments /></ErrorBoundary>,
      // },
      // {
      //   path: "files",
      //   element: <ErrorBoundary><AdminFiles /></ErrorBoundary>,
      // },
      // {
      //   path: "leads",
      //   element: <ErrorBoundary><AdminLeads /></ErrorBoundary>,
      // },
      // {
      //   path: "users",
      //   element: <ErrorBoundary><AdminShowUsers /></ErrorBoundary>,
      // },
      {
        path: "accounts",
        element: <ErrorBoundary><AdminShowAccounts /></ErrorBoundary>,
      },
      // {
      //   path: "Getnumbers",
      //   element: <ErrorBoundary><AdminGetNumbers /></ErrorBoundary>,
      // },
      {
        path: "call_reports",
        element: <ErrorBoundary><AdminCallReports /></ErrorBoundary>,
      },
      {
        path: "phonenumbers",
        element: <ErrorBoundary><AdminPhoneNumbers /></ErrorBoundary>,
      },
      // {
      //   path: "admin-purchased-number",
      //   element: <ErrorBoundary><AdminPurchaseNumbers /></ErrorBoundary>,
      // },
      {
        path: "termconditions",
        element: <ErrorBoundary><AdminTermconditions /></ErrorBoundary>,
      },
      // {
      //   path: "onboarding_email",
      //   element: <ErrorBoundary><OnboardCall /></ErrorBoundary>,
      // },
      {
        path: "dnc",
        element: <ErrorBoundary><AdminDnc /></ErrorBoundary>,
      },
      // {
      //   path: "dnc-list",
      //   element: <ErrorBoundary><AdminDncLists /></ErrorBoundary>,
      // },
      {
        path: "general_setting",
        element: <ErrorBoundary><AdminGeneralSettings /></ErrorBoundary>,
      },
      {
        path: "default-settings",
        element: <ErrorBoundary><AdminDefaultSettings /></ErrorBoundary>,
      },
      // {
      //   path: "assistant/updateassistant",
      //   element: <ErrorBoundary><AdminUpdateAssistant /></ErrorBoundary>,
      // },
      // {
      //   path: "company/:companyId/assistants",
      //   element: <ErrorBoundary><AssistantsPage /></ErrorBoundary>,
      // },
      // {
      //   path: "company/:companyId/pl-report",
      //   element: <ErrorBoundary><AccountPLreportPage /></ErrorBoundary>,
      // },
      // {
      //   path: "company/:companyId/call-logs",
      //   element: <ErrorBoundary><CallLogsPage /></ErrorBoundary>,
      // },
      // {
      //   path: "company/:companyId/phone-numbers",
      //   element: <ErrorBoundary><PhoneNumbersPage /></ErrorBoundary>,
      // },
      // {
      //   path: "company/:companyId/users",
      //   element: <ErrorBoundary><UsersPage /></ErrorBoundary>,
      // },
      // {
      //   path: "dnc/:companyId/leads",
      //   element: <ErrorBoundary><AccountDNCLeads /></ErrorBoundary>,
      // },
      {
        path: "profile",
        element: <ErrorBoundary><AdminProfile /></ErrorBoundary>,
      },
      // {
      //   path: "site-management",
      //   element: <ErrorBoundary><AdminSiteManagement /></ErrorBoundary>,
      // },
      {
        path: "profit-loss-report",
        element: <ErrorBoundary><ProfitLossReport /></ErrorBoundary>,
      },
    ],
  },
  {
    path: "/",
    element: (
      <LoginChecker allowedUser="logged-in">
        <ErrorBoundary><PanelLayout /></ErrorBoundary>
      </LoginChecker>
    ),
    children: [
      {
        path: "dashboard",
        element: <ErrorBoundary><Dashboard /></ErrorBoundary>,
      },
      {
        path: "files",
        element: <ErrorBoundary><Files /></ErrorBoundary>,
      },
      {
        path: "view-leads",
        element: <ErrorBoundary><ViewLeads /></ErrorBoundary>,
      },
      {
        path: "leads",
        element: <ErrorBoundary><Leads /></ErrorBoundary>,
      },
      
      {
        path: "ghl-leads",
        element: <ErrorBoundary><GHLLeads /></ErrorBoundary>,
      },
      {
        path: "zoho-leads",
        element: <ErrorBoundary><ZohoLeads /></ErrorBoundary>,
      },
      {
        path: "hubspot-leads",
        element: <ErrorBoundary><HubSpotLeads /></ErrorBoundary>,
      },
      // {
      //   path: "dnc-leads",
      //   element: <ErrorBoundary><DNCLeads /></ErrorBoundary>,
      // },
      {
        path: "Getnumbers",
        element: <ErrorBoundary><GetNumbers /></ErrorBoundary>,
      },
      {
        path: "documents",
        element: <ErrorBoundary><ViewDocuments /></ErrorBoundary>,
      },
      {
        path: "documents/upload",
        element: <ErrorBoundary><Documents /></ErrorBoundary>,
      },
      {
        path: "assistant/createassistant",
        element: <ErrorBoundary><CreateAssitant /></ErrorBoundary>,
      },
      {
        path: "assistant",
        element: <ErrorBoundary><Assistant /></ErrorBoundary>,
      },
      {
        path: "report-dashboard",
        element: <ErrorBoundary><ReportDashboard /></ErrorBoundary>,
      },
      {
        path: "usage-report",
        element: <ErrorBoundary><UsageReport /></ErrorBoundary>,
      },
      {
        path: "bl-report",
        element: <ErrorBoundary><BillingReport /></ErrorBoundary>,
      },
      {
        path: "business-schedule",
        element: <ErrorBoundary><BusinessSchedule /></ErrorBoundary>,
      },
      {
        path: "cancel-subscription",
        element: <ErrorBoundary><CancelSubscription /></ErrorBoundary>,
      },
      {
        path: "profile",
        element: <ErrorBoundary><Profile /></ErrorBoundary>,
      },
      {
        path: "payment",
        element: <ErrorBoundary><Payment /></ErrorBoundary>,
      },
      {
        path: "payment-method",
        element: <ErrorBoundary><PaymentMethod /></ErrorBoundary>,
      },
      {
        path: "make-payment",
        element: <ErrorBoundary><MakePayment /></ErrorBoundary>,
      },
      {
        path: "/success",
        element: <ErrorBoundary><SuccessPage /></ErrorBoundary>,
      },
      {
        path: "/canceled",
        element: <ErrorBoundary><CanceledPage /></ErrorBoundary>,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);