import { ReactNode, useState, useEffect } from 'react';
import { TbDashboard, TbSettings, TbChevronDown, TbChevronRight, TbX } from 'react-icons/tb';

import { NavLink, Link, useLocation } from 'react-router-dom';
import { FaPhoneSquare } from "react-icons/fa";
import { RiMoneyDollarBoxLine } from 'react-icons/ri';
import { MdAccountBox } from 'react-icons/md';
import { HiOutlineDocumentCheck } from 'react-icons/hi2';

// import { MdOutlineMarkEmailRead } from "react-icons/md";
// import { HiOutlineDocumentCheck } from 'react-icons/hi2';
// import { AiFillSchedule } from "react-icons/ai";

export interface SidebarProps {
  sidebarCollapsed?: boolean;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export interface SidebarItemProps {
  to: string;
  children: ReactNode;
  icon: ReactNode;
  setMobileOpen?: (open: boolean) => void;
}

export function SidebarItem({ to, children, icon, setMobileOpen }: SidebarItemProps) {
  const activeBypassed = to === "/admin/files" && window.location.pathname === "/admin/leads";
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `p-2 flex items-center gap-3  rounded-md ${isActive || activeBypassed ? "text-white bg-primary" : ""}`}
      onClick={() => {
        // Close mobile sidebar when item is clicked on mobile
        if (window.innerWidth < 1024 && setMobileOpen) {
          setMobileOpen(false);
        }
      }}
    >
      {icon}
      {children}
    </NavLink>
  );
}

interface SidebarSectionProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  pathPrefix?: string;
}

function SidebarSection({ title, icon, children, isExpanded, onToggle, pathPrefix }: SidebarSectionProps) {
  const location = useLocation();
  const isActive = pathPrefix && (location.pathname.startsWith(pathPrefix) || 
    location.pathname === "/admin/accounts" || 
    location.pathname === "/admin/phonenumbers");

  return (
    <div className="space-y-1">
      <button
        onClick={onToggle}
        className={`flex items-center w-full p-2 rounded-md  transition-colors
          ${isActive ? "text-white bg-primary" : "hover:bg-gray-100"}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-base">
            {icon}
          </span>
          <span className="font-medium text-sm">{title}</span>
        </div>
        {isExpanded ? (
          <TbChevronDown className="text-sm" />
        ) : (
          <TbChevronRight className="text-sm" />
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
}

export function AdminSidebar({ mobileOpen = false, setMobileOpen = () => {} }: SidebarProps) {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  // Initialize expanded menus based on current path
  useEffect(() => {
    const newExpanded = new Set<string>();
    
    // Check if we're on accounts or phonenumbers page, expand the users menu
    if (location.pathname === "/admin/accounts" || location.pathname === "/admin/phonenumbers") {
      newExpanded.add("users");
    }
    
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
      const sidebar = document.querySelector('aside[data-admin-sidebar]');
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
        data-admin-sidebar
        className={`fixed lg:relative h-full bg-white border-r border-gray-200 shadow-sm transition-all duration-300 z-40 w-64
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: '#CBD5E1 transparent',
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

        <div className="p-3">
          <div className="p-3 flex items-center border-b border-gray-100">
  <Link to="/" className="flex items-center gap-2">
    <img
      src="/logo.png"
      className="h-12 w-auto"
      alt="Helios AI"
    />
    <span className="text-primary text-xl font-bold">Helios AI</span>
  </Link>
</div>
      <div className="flex flex-col gap-4">
        <SidebarItem to="/admin/dashboard" icon={<TbDashboard />} setMobileOpen={setMobileOpen}>
          Dashboard
        </SidebarItem>
        <SidebarSection
          title="Users"
          icon={<MdAccountBox />}
          isExpanded={expandedMenus.has("users")}
          onToggle={() => toggleMenu("users")}
          pathPrefix="/admin/accounts"
        >
          <SidebarItem to="/admin/accounts" icon={<MdAccountBox />} setMobileOpen={setMobileOpen}>
            All Users
          </SidebarItem>
          <SidebarItem to="/admin/phonenumbers" icon={<FaPhoneSquare />} setMobileOpen={setMobileOpen}>
            Phone Numbers
          </SidebarItem>
        </SidebarSection>
        <SidebarItem to="/admin/profit-loss-report" icon={<RiMoneyDollarBoxLine />} setMobileOpen={setMobileOpen}>
          Profit & Loss
        </SidebarItem>
        <SidebarItem to="/admin/call_reports" icon={<RiMoneyDollarBoxLine />} setMobileOpen={setMobileOpen}>
          Call Reports
        </SidebarItem>
        {/* <SidebarItem to="/admin/general_setting" icon={<TbSettings />} setMobileOpen={setMobileOpen}>
          General Settings
        </SidebarItem> */}
        <SidebarItem to="/admin/default-settings" icon={<TbSettings />} setMobileOpen={setMobileOpen}>
          Default Settings
        </SidebarItem> 
          <SidebarItem to="/admin/termconditions" icon={<HiOutlineDocumentCheck />} setMobileOpen={setMobileOpen}>
          Terms & Conditions
        </SidebarItem>

{/* 
        <SidebarItem to="/admin/logs" icon={<FaFileAlt />}>
          System Logs
        </SidebarItem>

        <SidebarItem to="/admin/dnc" icon={<MdDoNotDisturbOnTotalSilence />}>
          DNC Settings
        </SidebarItem>

        <SidebarItem to="/admin/dnc-list" icon={<MdDoNotDisturbOnTotalSilence />}>
          DNC Lists
        </SidebarItem>

        <SidebarItem to="/admin/profit-loss-report" icon={<RiMoneyDollarBoxLine />}>
          Profit & Loss
        </SidebarItem>

        <SidebarItem to="/admin/call_reports" icon={<RiMoneyDollarBoxLine />}>
          Call Reports
        </SidebarItem>

        <SidebarItem to="/admin/termconditions" icon={<HiOutlineDocumentCheck />}>
          Terms & Conditions
        </SidebarItem>

     

        <SidebarItem to="/admin/general_setting" icon={<TbSettings />}>
          General Settings
        </SidebarItem>

        <SidebarItem to="/admin/appointments" icon={<AiFillSchedule />}>
          Appointments
        </SidebarItem>

   
        <SidebarItem to="/admin/phonenumbers" icon={<FaPhoneSquare />}>
          Phone Numbers
        </SidebarItem>

        <SidebarItem to="/admin/default-settings" icon={<TbSettings />}>
          Default Settings
        </SidebarItem> */}
        </div>
      </div>
      </aside>
    </>
  );
}
