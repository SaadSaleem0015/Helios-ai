import {useEffect, useState} from 'react'
import { AdminSidebar } from './AdminSidebar';
import { useNavigate } from "react-router-dom";
import { AdminPanelContent } from './AdminPanelContent';
export const AdminPanelLayout = () => {
    const navigate = useNavigate();

    useEffect(()=>{
        if(localStorage.getItem('role') != 'admin'){
            navigate('/dashboard')
        }
    })
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    return (
        <div className="flex h-[100vh]" >
            <AdminSidebar
                sidebarCollapsed={sidebarCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen} />
            <AdminPanelContent
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen} />
        </div>
    );
}
