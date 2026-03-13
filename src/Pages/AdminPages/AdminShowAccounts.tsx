import { useEffect, useRef, useState } from "react";
import { Card } from "../../Components/Card";
import { useSearchParams, useNavigate } from "react-router-dom";
import { backendRequest } from "../../Helpers/backendRequest";
import { FiDollarSign, FiLogIn } from "react-icons/fi";
import { notifyResponse } from "../../Helpers/notyf";
import ConfirmationModal from "../../Components/ConfirmationModal";
import { Loading } from "../../Components/Loading";
import { TbUser, TbMail, TbCoin, TbPower } from "react-icons/tb";

// Update the User interface to match your API response
interface User {
  id: number;
  name: string;
  email: string;
  balance: number;
  is_active: boolean;
  // Remove email_confirmed as it's not in the response
}

const Dropdown = ({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white border border-gray-200 text-sm rounded-xl px-4 py-2.5 flex justify-between items-center w-64 hover:border-gray-300 transition-colors"
      >
        <span className="text-gray-700">{selected || "Select filter"}</span>
        <svg
          className={`ml-2 w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg w-64 py-1">
          {options.map((option, index) => (
            <div
              key={index}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                selected === option 
                  ? "bg-primary-50 text-primary-600 font-medium" 
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const AdminShowAccounts = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Users"); // Default to "All Users"
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggleModalVisible, setToggleModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [toggleAction, setToggleAction] = useState<"activate" | "deactivate" | null>(null);
  
  const navigate = useNavigate();

  const getUserData = async () => {
    setLoading(true);
    try {
      const response = await backendRequest<User[], []>("GET", `/users`);
      console.log("API Response:", response); // Debug log
      
      // Check if response is an array
      if (Array.isArray(response)) {
        // No need to filter by email_confirmed since it's not in the response
        setUsers(response);
      } else {
        console.error("Response is not an array:", response);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserData();
  }, [searchParams]);

  const handleLoginUser = async (id: number) => {
    try {
      const response = await backendRequest("POST", `/login_as_user/${id}`);
      if (response.success) {
        const admin_token = localStorage.getItem("token");
        localStorage.setItem("admin_token", admin_token);
        localStorage.setItem("token", response.token);
        localStorage.setItem("role", response.user_role);
        localStorage.setItem("adminLogin", response.adminLogin);
        navigate("/dashboard");
      } else {
        notifyResponse(response);
      }
    } catch {
      console.log("error");
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedAccount) return;
    
    try {
      const response = await backendRequest("PUT", `/users/${selectedAccount}/toggle-status`);
      notifyResponse(response);
      setToggleModalVisible(false);
      getUserData(); // Refresh the list
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const openToggleModal = (id: number, currentStatus: boolean) => {
    setSelectedAccount(id);
    setToggleAction(currentStatus ? "deactivate" : "activate");
    setToggleModalVisible(true);
  };

  // Filter users based on search and filter status
  const filteredAccounts = users.filter((user) => {
    const matchesSearch = user.name?.toLowerCase().includes(search.toLowerCase()) ||
                         user.email?.toLowerCase().includes(search.toLowerCase());

    let matchesFilter = true;

    if (filterStatus === "All Active") {
      matchesFilter = user.is_active === true;
    } else if (filterStatus === "Low Balance (<$20)") {
      matchesFilter = user.balance < 20 && user.is_active === true;
    } else if (filterStatus === "All Users") {
      matchesFilter = true; // Show all users regardless of status
    }

    return matchesSearch && matchesFilter;
  });


  return (
    <>
      <Card>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-500 mt-1">Manage and monitor user accounts</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent block p-3 w-full md:w-80 transition-all"
              />
              <Dropdown
                options={[
                  "All Users",      // Default filter - shows everyone
                  "All Active",     // Shows only active users
                  "Low Balance (<$20)", // Shows active users with low balance
                ]}
                selected={filterStatus}
                onSelect={(value) => {
                  setFilterStatus(value);
                }}
              />
            </div>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loading />
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
              <TbUser className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No accounts match your criteria</p>
              <p className="text-gray-400 text-sm mt-2">
                {users.length === 0 
                  ? "No users found in the system" 
                  : "Try adjusting your search or filters"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <TbUser className="w-4 h-4" />
                        User
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <TbMail className="w-4 h-4" />
                        Email
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <TbCoin className="w-4 h-4" />
                        Balance
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <TbPower className="w-4 h-4" />
                        Status
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAccounts.map((account, index) => (
                    <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-50 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary-700">
                              {account.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="ml-3">
                            <span className="text-sm font-medium text-gray-900">
                              {account.name || 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{account.email}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-gray-900">
                          <FiDollarSign className="w-4 h-4 text-gray-500 mr-1" />
                          ${account.balance?.toFixed(2) || '0.00'}
                          {account.balance < 20 && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Low
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          account.is_active 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {account.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Login as User Button - Added Back */}
                          <button
                            onClick={() => handleLoginUser(account.id)}
                            className="px-3 py-1.5 bg-primary-50 text-primary-600 text-xs font-medium rounded-lg hover:bg-primary-100 transition-colors border border-primary-200 flex items-center gap-1"
                            title="Login as this user"
                          >
                            <FiLogIn className="w-3.5 h-3.5" />
                            Login
                          </button>
                          
                          {/* Toggle Status Button */}
                          <button
                            onClick={() => openToggleModal(account.id, account.is_active)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                              account.is_active 
                                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                                : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                            }`}
                          >
                            {account.is_active ? (
                              <>Deactivate</>
                            ) : (
                              <>Activate</>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Toggle Status Confirmation Modal */}
      <ConfirmationModal
        show={toggleModalVisible}
        onClose={() => setToggleModalVisible(false)}
        onConfirm={handleToggleStatus}
        title={toggleAction === "deactivate" ? "Deactivate User" : "Activate User"}
        message={`Are you sure you want to ${toggleAction} this user? ${
          toggleAction === "deactivate" 
            ? "They will no longer be able to access the platform." 
            : "They will regain access to the platform."
        }`}
        confirmText={toggleAction === "deactivate" ? "Deactivate" : "Activate"}
        cancelText="Cancel"
        type={toggleAction === "deactivate" ? "danger" : "warning"}
      />
    </>
  );
};