import { NavLink, Link, useLocation } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import {
  TbDashboard,
  TbRobot,
  TbBuilding,
  TbReportMoney,
  TbCalendar,
  TbChevronDown,
  TbChevronRight,
  TbMenu2,
  TbX,
} from "react-icons/tb";
import { FaFileAlt, FaChartLine } from "react-icons/fa";
import { 
  MdCall, 
  MdAttachMoney,
  MdOutlinePayment,
  MdCreditCard,
  MdPayments,
  MdCancel
} from "react-icons/md";
import { LuFileBadge } from "react-icons/lu";
import { HiOutlineDocumentText } from "react-icons/hi";

// Interface for menu items
interface MenuItem {
  title: string;
  path: string;
  icon: ReactNode;
  subItems?: { title: string; path: string; icon: ReactNode }[];
}

const SidebarItem = ({
  to,
  children,
  icon,
  isCollapsed,
}: {
  to: string;
  children: ReactNode;
  icon: ReactNode;
  isCollapsed?: boolean;
}) => {
  const location = useLocation();
  const isActive = location.pathname === to || 
    (location.pathname === "/leads" && to === "/files");

  return (
    <NavLink
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
        ${isActive 
          ? "bg-primary/10 text-primary border-l-4 border-primary" 
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }
        ${isCollapsed ? "justify-center px-2.5" : ""}
      `}
      title={isCollapsed ? String(children) : undefined}
      onClick={() => {
        // Close mobile sidebar when item is clicked on mobile
        if (window.innerWidth < 1024) {
          document.body.classList.remove('mobile-sidebar-open');
        }
      }}
    >
      <span className={`${isActive ? "text-primary" : "text-gray-500 group-hover:text-gray-700"} 
        ${isCollapsed ? "text-lg" : "text-base"}`}>
        {icon}
      </span>
      {!isCollapsed && (
        <span className="font-medium text-sm whitespace-nowrap overflow-hidden">
          {children}
        </span>
      )}
    </NavLink>
  );
};

const SidebarSection = ({
  title,
  icon,
  children,
  isExpanded,
  onToggle,
  isCollapsed,
  pathPrefix,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  isCollapsed?: boolean;
  pathPrefix?: string;
}) => {
  const location = useLocation();
  const isActive = pathPrefix && location.pathname.startsWith(pathPrefix);

  if (isCollapsed) {
    return (
      <div className="space-y-1 relative">
        <button
          onClick={onToggle}
          className={`flex items-center justify-center w-full p-2.5 rounded-lg transition-colors
            ${isActive ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
          title={title}
        >
          {icon}
          {isExpanded && (
            <div className="absolute left-full ml-2 bg-gray-900 text-white text-sm py-1 px-2 rounded shadow-lg whitespace-nowrap z-50">
              {title}
            </div>
          )}
        </button>
        {isExpanded && (
          <div className="absolute left-full top-0 ml-2 bg-white shadow-xl rounded-lg py-2 min-w-48 z-40">
            {children}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={onToggle}
        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-colors
          ${isActive ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
      >
        <div className="flex items-center gap-3">
          <span className={`text-base ${isActive ? "text-primary" : "text-gray-500"}`}>
            {icon}
          </span>
          <span className="font-medium text-sm">{title}</span>
        </div>
        {isExpanded ? (
          <TbChevronDown className="text-gray-400 text-sm" />
        ) : (
          <TbChevronRight className="text-gray-400 text-sm" />
        )}
      </button>
      <div
        className={`pl-9 space-y-1 overflow-hidden transition-all duration-300
          ${isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        {children}
      </div>
    </div>
  );
};

export function Sidebar({ 
  sidebarCollapsed, 
  setSidebarCollapsed,
  mobileOpen = false,
  setMobileOpen = () => {}
}: { 
  sidebarCollapsed: boolean; 
  setSidebarCollapsed: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}) {
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const location = useLocation();

  // Menu structure
  const menuItems: { [key: string]: MenuItem } = {
    dashboard: {
      title: "Dashboard",
      path: "/dashboard",
      icon: <TbDashboard />,
    },
    core: {
      title: "Business",
      path: "/business",
      icon: <TbBuilding />,
      subItems: [
        { title: "AI Assistants", path: "/assistant", icon: <TbRobot /> },
        { title: "Phone Numbers", path: "/getnumbers", icon: <MdCall /> },
        { title: "Knowledge Base", path: "/documents", icon: <FaFileAlt /> },
        { title: "Schedule", path: "/business-schedule", icon: <TbCalendar /> },
      ],
    },
    leads: {
      title: "Leads",
      path: "/leads",
      icon: <LuFileBadge />,
      subItems: [
        { title: "View Leads", path: "/view-leads", icon: <LuFileBadge /> },
        { title: "GHL Leads", path: "/ghl-leads", icon: <LuFileBadge /> },
      ],
    },
    analytics: {
      title: "Analytics",
      path: "/analytics",
      icon: <FaChartLine />,
      subItems: [
        { title: "Reports", path: "/report-dashboard", icon: <TbReportMoney /> },
        { title: "Usage", path: "/usage-report", icon: <MdAttachMoney /> },
        { title: "Billing Report", path: "/bl-report", icon: <HiOutlineDocumentText /> },
      ],
    },
    billing: {
      title: "Billing",
      path: "/billing",
      icon: <MdOutlinePayment />,
      subItems: [
        { title: "Payment Methods", path: "/payment", icon: <MdCreditCard /> },
        { title: "Make Payment", path: "/make-payment", icon: <MdPayments /> },
        // { title: "Cancel Subscription", path: "/cancel-subscription", icon: <MdCancel /> },
      ],
    },
  };

  // Initialize expanded menus based on current path
  useEffect(() => {
    const newExpanded = new Set<string>();
    
    Object.entries(menuItems).forEach(([key, item]) => {
      if (item.subItems) {
        const isActive = item.subItems.some(subItem => 
          location.pathname.startsWith(subItem.path)
        );
        if (isActive) {
          newExpanded.add(key);
        }
      }
    });
    
    setExpandedMenus(newExpanded);
  }, [location.pathname]);

  // Handle body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add('mobile-sidebar-open');
    } else {
      document.body.classList.remove('mobile-sidebar-open');
    }
    
    return () => {
      document.body.classList.remove('mobile-sidebar-open');
    };
  }, [mobileOpen]);

  // Close mobile sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector('aside');
      const target = event.target as HTMLElement;
      
      // Check if click is on the toggle button or its children
      const toggleButton = target.closest('[data-mobile-sidebar-toggle]');
      
      if (mobileOpen && 
          sidebar && 
          !sidebar.contains(target) && 
          !toggleButton &&
          window.innerWidth < 1024) {
        setMobileOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileOpen, setMobileOpen]);

  // Close mobile sidebar when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileOpen) {
        setMobileOpen(false);
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileOpen, setMobileOpen]);

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menu)) {
        newSet.delete(menu);
      } else {
        newSet.add(menu);
      }
      return newSet;
    });
  };

  const getBillingSubItems = () => {
    return [
      { title: "Payment Methods", path: "/payment", icon: <MdCreditCard /> },
      { title: "Make Payment", path: "/make-payment", icon: <MdPayments /> },
      // { title: "Cancel Subscription", path: "/cancel-subscription", icon: <MdCancel /> }
    ];
  };

  const renderMenuContent = () => (
    <>
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100">
        {!sidebarCollapsed ? (
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              className="h-8 w-auto"
              alt="Helios AI"
            />
            <span className="text-primary text-lg font-bold">Helios AI</span>
          </Link>
        ) : (
          <Link to="/" className="flex items-center justify-center w-full">
            <img
              src="/logo.png"
              className="h-8 w-auto"
              alt="Helios AI"
            />
          </Link>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors
            ${sidebarCollapsed ? "hidden" : ""}`}
        >
          <TbMenu2 className="text-lg" />
        </button>
      </div>

      {/* Navigation */}
      <div className="p-3 space-y-1">
        {/* Dashboard */}
        <SidebarItem 
          to={menuItems.dashboard.path} 
          icon={menuItems.dashboard.icon}
          isCollapsed={sidebarCollapsed}
        >
          {menuItems.dashboard.title}
        </SidebarItem>

        {/* Business Section */}
        <div 
          onMouseEnter={() => !sidebarCollapsed && setHoveredMenu("core")}
          onMouseLeave={() => setHoveredMenu(null)}
          className="relative"
        >
          <SidebarSection
            title={menuItems.core.title}
            icon={menuItems.core.icon}
            isExpanded={sidebarCollapsed ? hoveredMenu === "core" : expandedMenus.has("core")}
            onToggle={() => toggleMenu("core")}
            isCollapsed={sidebarCollapsed}
            pathPrefix="/business"
          >
            {!sidebarCollapsed || hoveredMenu === "core" ? (
              menuItems.core.subItems?.map((item) => (
                <SidebarItem
                  key={item.path}
                  to={item.path}
                  icon={item.icon}
                  isCollapsed={sidebarCollapsed && hoveredMenu !== "core"}
                >
                  {item.title}
                </SidebarItem>
              ))
            ) : null}
          </SidebarSection>
        </div>

        {/* Leads Section */}
        <div 
          onMouseEnter={() => !sidebarCollapsed && setHoveredMenu("leads")}
          onMouseLeave={() => setHoveredMenu(null)}
          className="relative"
        >
          <SidebarSection
            title={menuItems.leads.title}
            icon={menuItems.leads.icon}
            isExpanded={sidebarCollapsed ? hoveredMenu === "leads" : expandedMenus.has("leads")}
            onToggle={() => toggleMenu("leads")}
            isCollapsed={sidebarCollapsed}
            pathPrefix="/leads"
          >
            {!sidebarCollapsed || hoveredMenu === "leads" ? (
              menuItems.leads.subItems?.map((item) => (
                <SidebarItem
                  key={item.path}
                  to={item.path}
                  icon={item.icon}
                  isCollapsed={sidebarCollapsed && hoveredMenu !== "leads"}
                >
                  {item.title}
                </SidebarItem>
              ))
            ) : null}
          </SidebarSection>
        </div>

        {/* Analytics Section */}
        <div 
          onMouseEnter={() => !sidebarCollapsed && setHoveredMenu("analytics")}
          onMouseLeave={() => setHoveredMenu(null)}
          className="relative"
        >
          <SidebarSection
            title={menuItems.analytics.title}
            icon={menuItems.analytics.icon}
            isExpanded={sidebarCollapsed ? hoveredMenu === "analytics" : expandedMenus.has("analytics")}
            onToggle={() => toggleMenu("analytics")}
            isCollapsed={sidebarCollapsed}
            pathPrefix="/analytics"
          >
            {!sidebarCollapsed || hoveredMenu === "analytics" ? (
              menuItems.analytics.subItems?.map((item) => (
                <SidebarItem
                  key={item.path}
                  to={item.path}
                  icon={item.icon}
                  isCollapsed={sidebarCollapsed && hoveredMenu !== "analytics"}
                >
                  {item.title}
                </SidebarItem>
              ))
            ) : null}
          </SidebarSection>
        </div>

        {/* Billing Section */}
        <div 
          onMouseEnter={() => !sidebarCollapsed && setHoveredMenu("billing")}
          onMouseLeave={() => setHoveredMenu(null)}
          className="relative"
        >
          <SidebarSection
            title={menuItems.billing.title}
            icon={menuItems.billing.icon}
            isExpanded={sidebarCollapsed ? hoveredMenu === "billing" : expandedMenus.has("billing")}
            onToggle={() => toggleMenu("billing")}
            isCollapsed={sidebarCollapsed}
            pathPrefix="/billing"
          >
            {!sidebarCollapsed || hoveredMenu === "billing" ? (
              getBillingSubItems().map((item) => (
                <SidebarItem
                  key={item.path}
                  to={item.path}
                  icon={item.icon}
                  isCollapsed={sidebarCollapsed && hoveredMenu !== "billing"}
                >
                  {item.title}
                </SidebarItem>
              ))
            ) : null}
          </SidebarSection>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative h-full bg-white border-r border-gray-200 shadow-sm transition-all duration-300 z-40
          ${sidebarCollapsed ? "w-16" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "#CBD5E1 transparent",
        }}
      >
        {/* Mobile Close Button */}
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 z-50 lg:hidden"
          >
            <TbX className="text-lg" />
          </button>
        )}

        {renderMenuContent()}

        {/* Collapse Toggle (Bottom) */}
        <div className="absolute bottom-4 left-0 right-0 px-3">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`flex items-center justify-center gap-2 w-full p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 
              text-gray-600 hover:text-gray-900 transition-colors
              ${sidebarCollapsed ? "" : "justify-between"}`}
          >
            {!sidebarCollapsed && (
              <span className="text-sm font-medium">Collapse</span>
            )}
            <TbMenu2 className={`transform transition-transform ${sidebarCollapsed ? "" : "rotate-90"}`} />
          </button>
        </div>
      </aside>
    </>
  );
}

// Mobile toggle button component
export function SidebarToggle({ 
  onClick, 
  mobileOpen 
}: { 
  onClick: () => void;
  mobileOpen: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors lg:hidden"
      aria-label={mobileOpen ? "Close menu" : "Open menu"}
    >
      {mobileOpen ? (
        <TbX className="text-xl" />
      ) : (
        <TbMenu2 className="text-xl" />
      )}
    </button>
  );
}