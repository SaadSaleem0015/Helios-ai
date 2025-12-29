import { useState, useEffect, useRef } from "react";
import { TbAlignLeft, TbLogout, TbUser, TbX, TbBell, TbSettings, TbCoin } from "react-icons/tb";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { backendRequest } from "../Helpers/backendRequest";
import { notifyResponse } from "../Helpers/notyf";

export interface PanelContentProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (x: boolean | ((x: boolean) => boolean)) => void;
  mobileOpen?: boolean;
  setMobileOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}


export function PanelContent({
  sidebarCollapsed,
  setSidebarCollapsed,
  mobileOpen = false,
  setMobileOpen = () => {},
}: PanelContentProps) {
  const [droppedDown, setDroppedDown] = useState(false);
  const [userName, setUserName] = useState("");
  const [balance, setBalance] = useState<number>(0);

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  function handleDropDown() {
    setDroppedDown((prev) => !prev);
  }

  const handleUser = async () => {
    try {
      const response = await backendRequest("GET", "/profile");
      console.log(response)
      setUserName(response.name);
      setBalance(response.balance);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  useEffect(() => {
    handleUser();
  }, []);

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

  const admin_logged_in = localStorage.getItem("admin_token");
  
  const handleExit = () => {
    localStorage.setItem("role", "admin");
    localStorage.setItem("token", admin_logged_in);
    localStorage.removeItem("admin_token");
    localStorage.removeItem("adminLogin");
    navigate("admin/dashboard");
  };


  return (
    <div className="flex-grow bg-gray-50 overflow-auto">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left Side - Mobile Menu Button */}
          <div className="flex items-center gap-3">
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
            
            {/* Logo/App Name */}
            <Link to="/dashboard" className="hidden sm:flex items-center">
              <span className="text-lg font-bold text-primary">Welcome, <span className="text-black">{userName} </span> </span>
            </Link>
          </div>

          {/* Right Side - Actions & User Menu */}
          <div className="flex items-center gap-3">
            {/* Balance Display */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
              <TbCoin className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900">
                ${balance ? balance?.toFixed(2) : 0}
              </span>
              <Link 
                to="/make-payment" 
                className="ml-2 px-2 py-1 text-xs font-medium bg-primary text-white rounded hover:bg-primary-dark transition-colors"
              >
                Add
              </Link>
            </div>

          

            {/* User Menu */}
            <div className="relative">
              <button
                ref={buttonRef}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={handleDropDown}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {userName?.charAt(0)?.toUpperCase()}
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
                  <p className="text-xs text-gray-500 mt-1">Balance: ${balance ? balance?.toFixed(2) : 0} </p>
                </div>
                

                {/* Menu Items */}
                <div className="py-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setDroppedDown(false)}
                  >
                    <TbUser className="w-4 h-4 text-gray-500" />
                    Profile Settings
                  </Link>

                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setDroppedDown(false)}
                  >
                    <TbSettings className="w-4 h-4 text-gray-500" />
                    Account Settings
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
      </div>

      {/* Admin Management Banner */}
      {admin_logged_in && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-sm text-blue-800">
              Managing: <span className="font-semibold">{userName}</span>
            </p>
            <button
              onClick={handleExit}
              className="px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
            >
              Exit Management
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-4 sm:p-6">
        <Outlet />
      </div>
    </div>
  );
}