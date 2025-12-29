import { useEffect, useState } from "react";
import { Card } from "../../Components/Card";
import { useSearchParams } from "react-router-dom";
import { backendRequest } from "../../Helpers/backendRequest";
import { TbTrash } from "react-icons/tb";
import { notifyResponse, notyf } from "../../Helpers/notyf";
import ConfirmationModal from "../../Components/ConfirmationModal";
import { UserDetailModal } from "../../Components/UserDetailModel";

interface User {
  created_at: string;
  email_confirmed: boolean;
  password: string;
  id: number;
  type: string;
  updated_at: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export const AdminShowUsers = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [userType, setUserType] = useState("All Users");
  const [showVerified, setShowVerified] = useState(false);
  const [userData, setUserData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userDetailModalOpen, setUserDetailModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [actionType, setActionType] = useState<
    "activate" | "deactivate" | null
  >(null);

  const getUserData = async () => {
    setLoading(true);
    try {
      const response = await backendRequest<User[], []>("GET", `/get_all_user`);
      setUserData(response)
      // setUserData(
      //   response.filter((user) => user.email !== localStorage.getItem("email"))
      // );
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

 
  const confirmDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeleteModalVisible(true);
  };
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
  
    try {
      const response = await backendRequest(
        "DELETE",
        `/delete_user/${userToDelete.id}`
      );
      if (response.success) {
        notyf.success("User Deleted Successfully");
        getUserData();
      } else {
        console.error("Failed to delete user:", response.detail);
        notyf.error("Error Deleting User");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      notyf.error("An error occurred while deleting the user.");
    } finally {
      setDeleteModalVisible(false);
      setUserToDelete(null);
    }
  };
  const handleUserAction = async () => {
    if (!selectedUser || !actionType) return;

    try {
      const response = await backendRequest(
        "PUT",
        `/users/${selectedUser.id}/${actionType}`
      );
      notifyResponse(response);
      setModalVisible(false);
      getUserData();
    } catch (error) {
      console.error(`Error during user ${actionType}:`, error);
    }
  };
  const openModal = (user: User, action: "activate" | "deactivate") => {
    setSelectedUser(user);
    setActionType(action);
    setModalVisible(true);
  };

  useEffect(() => {
    getUserData();
  }, [searchParams]);

  const formatDate = (dateStr: string): string => {
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const filteredUsers = userData?.filter((user) => {
    const matchesName = user?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesEmail = user?.email?.toLowerCase().includes(search.toLowerCase());
    const matchesType = userType === "All Users" || user.role === userType;
    const matchesVerification = showVerified ? user.email_confirmed : true;
    const onlyusers = user.role === "user" || user.role === "company_admin"

    return (matchesName || matchesEmail) && matchesType && matchesVerification && onlyusers;
  });


  const showUserDetailModel = (id:number) => {
    setSelectedUserId(id);
    setUserDetailModalOpen(true);
  }
  return (
    <Card>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Users</h1>
      </div>

      <div className="flex  justify-between items-center mb-6">
        <div className="flex flex-col md:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            id="search"
            aria-label="Search users"
            className="bg-gray-100 border text-xs sm:text-sm border-gray-300 text-gray-900  rounded-lg focus:ring-primary focus:border-primary block p-2.5 w-64"
          />
          <select
            value={userType}
            onChange={(e) => setUserType(e.currentTarget.value)}
            id="user-type"
            className="bg-gray-50 border text-xs sm:text-sm border-gray-300 text-gray-900  rounded-lg focus:ring-primary focus:border-primary block p-2.5"
          >
            <option value="All Users">All Users</option>
            <option value="user">Users</option>
            <option value="admin">Admin Users</option>
          </select>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showVerified}
              onChange={(e) => setShowVerified(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`relative w-11 h-6 bg-gray-200 rounded-full ${
                showVerified ? "bg-green-300" : ""
              }`}
            >
              <div
                className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full transition-all ${
                  showVerified ? "translate-x-5" : ""
                }`}
              ></div>
            </div>
            <span className="ml-2 text-xs sm:text-base font-medium">Show Verified Users</span>
          </label>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading users...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : filteredUsers.length === 0 ? (
        <p className="text-center text-gray-500">
          No users match your criteria.
        </p>
      ) : (
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="text-left text-sm md:text-md bg-gray-50 border-b-2">
                <th className="py-3 text-xs sm:text-base px-2 md:px-6">Name</th>
                <th className="py-3 text-xs sm:text-base px-2 md:px-4">Email</th>
                <th className="py-3 text-xs sm:text-base px-2 md:px-4">Role</th>
                <th className="py-3 text-xs sm:text-base px-2 md:px-6">Created At</th>
                <th className="py-3 text-xs sm:text-base px-2 md:px-6">Active</th>
                <th className="py-3 text-xs sm:text-base px-2 md:px-8">Email Verification</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr className="border-b hover:bg-gray-100 cursor-pointer hover:underline" key={user.id} onClick={()=> showUserDetailModel(user.id)}>
                  <td className="p-2 sm:p-4 text-xs sm:text-base align-middle ">{user.name}</td>
                  <td className="p-2 sm:p-4 text-xs sm:text-base align-middle ">{user.email}</td>
                  <td className="p-2 sm:p-4 text-xs sm:text-base align-middle ">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</td>

                  <td className="p-2 sm:p-4 text-xs sm:text-base align-middle ">
                    {formatDate(user.created_at)}
                  </td>
                 
                  <td className="p-2 sm:p-4 text-xs sm:text-base align-middle ">
                    {user.is_active ? (
                      <div
                      
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(user, "deactivate")
                        
                        }}
                        className="p-2 bg-green-200 flex justify-center rounded-lg cursor-pointer"
                      >
                        <span className="text-md">Enabled</span>
                      </div>
                    ) : (
                      <div
                        onClick={() => openModal(user, "activate")}
                        className="p-2 bg-red-200 flex justify-center rounded-lg cursor-pointer"
                      >
                        <span className="text-md">Disabled</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-xs sm:text-sm align-middle">
                    {user.email_confirmed ? (
                      <div className="p-2 bg-green-200 flex justify-center rounded-lg">
                        <span className="text-md">Verified</span>
                      </div>
                    ) : (
                      <div className="p-2 bg-red-200 flex justify-center rounded-lg">
                        <span className="text-md">Not Verified</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-xs sm:text-base text-center">
                  <button
  className="text-red-500 hover:text-red-700"
  onClick={(e) => {
    e.stopPropagation();
    confirmDeleteUser(user);
  }}
>
  <TbTrash className="w-4" />
</button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
{userDetailModalOpen && selectedUserId && (
        <UserDetailModal
          isOpen={userDetailModalOpen}
          onClose={() => setUserDetailModalOpen(false)}
          userId={selectedUserId}
        />
      )}
      <ConfirmationModal
  show={deleteModalVisible}
  onClose={() => setDeleteModalVisible(false)}
  onConfirm={handleDeleteUser}
  message={`Are you sure you want to delete ${userToDelete?.name}?`}
/>

      <ConfirmationModal
        show={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleUserAction}
        message={`Are you sure you want to ${
          actionType === "activate" ? "activate" : "deactivate"
        } ${selectedUser?.name}?`}
      />
    </Card>
  );
};
