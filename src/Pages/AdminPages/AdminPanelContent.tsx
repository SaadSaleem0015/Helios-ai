import { useState, useRef, useEffect } from "react";
import { MdManageAccounts, MdOutlineAdminPanelSettings } from "react-icons/md";
import { TbAlignLeft, TbLogout, TbUser, TbX, TbSettings, TbDashboard } from "react-icons/tb";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { backendRequest } from "../../Helpers/backendRequest";

export interface PanelContentProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (x: boolean | ((x: boolean) => boolean)) => void;
  mobileOpen?: boolean;
  setMobileOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AdminPanelContent({
  sidebarCollapsed,
  setSidebarCollapsed,
  mobileOpen = false,
  setMobileOpen = () => {},
}: PanelContentProps) {
  const [droppedDown, setDroppedDown] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setDroppedDown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  const handleUser = async () => {
    try {
      const response = await backendRequest("GET", "/profile");
      setUserName(response.name || "Admin");
      setUserEmail(response.email || "admin@vanillavoice.com");
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  useEffect(() => {
    handleUser();
  }, []);

  return (
    <div className="flex-grow bg-gray-50 overflow-auto">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left Side - Mobile Menu & Admin Info */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setMobileOpen(!mobileOpen);
              }}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              data-mobile-sidebar-toggle
            >
              {mobileOpen ? (
                <TbX className="w-5 h-5 text-gray-600" />
              ) : (
                <TbAlignLeft className="w-5 h-5 text-gray-600" />
              )}
            </button>
            
            {/* Admin Information */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-dark flex items-center justify-center">
                <MdOutlineAdminPanelSettings className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-600">Super Admin</div>
                <div className="text-sm font-medium text-gray-900">{userName}</div>
              </div>
            </div>
          </div>

          {/* Right Side - User Menu */}
          <div className="relative">
            <button
              ref={buttonRef}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setDroppedDown(!droppedDown)}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {userName?.charAt(0)?.toUpperCase() || "A"}
                </span>
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700 truncate max-w-[120px]">
                {userName}
              </span>
            </button>

            {/* Dropdown Menu */}
            <div
              ref={menuRef}
              className={`absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 ${
                droppedDown ? "block" : "hidden"
              }`}
            >
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500 mt-1 truncate">{userEmail}</p>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    <MdOutlineAdminPanelSettings className="w-3 h-3" />
                    Super Admin
                  </span>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setDroppedDown(false)}
                >
                  <TbDashboard className="w-4 h-4 text-gray-500" />
                  Dashboard
                </Link>

                <Link
                  to="/admin/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setDroppedDown(false)}
                >
                  <TbUser className="w-4 h-4 text-gray-500" />
                  Profile Settings
                </Link>

                <Link
                  to="/admin/site-management"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setDroppedDown(false)}
                >
                  <MdManageAccounts className="w-4 h-4 text-gray-500" />
                  Site Management
                </Link>

                <Link
                  to="/admin/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setDroppedDown(false)}
                >
                  <TbSettings className="w-4 h-4 text-gray-500" />
                  System Settings
                </Link>
              </div>

              {/* Logout */}
              <div className="pt-2 border-t border-gray-100">
                <button
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  onClick={logout}
                >
                  <TbLogout className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6">
        <Outlet />
      </div>
    </div>
  );
}