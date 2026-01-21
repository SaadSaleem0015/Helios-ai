import { useEffect, useRef, useState } from "react";
import { Card } from "../../Components/Card";
import { useSearchParams, useNavigate } from "react-router-dom";
import { backendRequest } from "../../Helpers/backendRequest";
import { FiDollarSign } from "react-icons/fi";
import { notifyResponse } from "../../Helpers/notyf";
import { ChecklistComponent } from "./ChecklistComponent";
import { FaEye } from "react-icons/fa";
import ConfirmationModal from "../../Components/ConfirmationModal";
import { Loading } from "../../Components/Loading";
import InCompleteProfiles  from "../../Components/Incompleteprofile";
interface IncompleteProfile {
  id: number;
  name: string;
  email: string;
  email_confirmed: boolean;
  created_at: string;
}

interface user {
  id: number;
  name: string;
  submit_for_approval: boolean;
  balance: number;
  criteria_approved: boolean;
  is_active: boolean;
  email_confirmed: boolean;
  min_left: number;
  hidden: boolean;
  requestTrial: boolean;
  inComplete_profiles?: IncompleteProfile[];
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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-100 border  text-sm rounded-lg px-4 py-2.5 flex justify-between items-center w-64"
      >
        {selected || "Select an option"}
        <svg
          className={`ml-2 w-5 h-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
            }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg w-64">
          {options.map((option, index) => (
            <div
              key={index}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
              className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-100 ${selected === option ? "bg-blue-50 font-bold" : ""
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
  const [filterStatus, setFilterStatus] = useState("All Accounts");
  const [users, setUsers] = useState<user[]>([]);
  const [loading, setLoading] = useState(true);
  const [grantMinutesLoading, setGrantMinutesLoading] = useState(false);
  const [progressModel, setProgressModel] = useState(false);
  const [progressAccountId, setProgressAccountId] = useState<number | null>(
    null
  );
  const [userId, setUserId] = useState<number | null>(null);
  const [assignedMinutes, setAssignedMinutes] = useState<number>(0);
  const [actionType, setActionType] = useState<"live" | "suspend" | null>(null);
  const [suspendModalVisible, setSuspendModalVisible] = useState(false);
//   const [hideModalVisible, setHideModalVisible] = useState(false);

  const [grantMinutesModel, setGrantMinutesModel] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);


  const [selectedUser, setSelectedUser] = useState<user | null>(null);
  const [incompleteProfiles, setIncompleteProfiles] = useState<IncompleteProfile[]>([]);
  const [showIncompleteProfiles, setShowIncompleteProfiles] = useState(false);
  const navigate = useNavigate();

const getUserData = async () => {
  setLoading(true);
  try {
    const response = await backendRequest<user[], []>("GET", `/users`);
    console.log("response", response)
    const confirmedUsers = response.filter(
      (user) => user.email_confirmed === true
    );
    console.log("confirmedusrss", confirmedUsers)
    setUsers(confirmedUsers)
    console.log("users", users)
    confirmedUsers.forEach(user => {
      if (user.inComplete_profiles) {
        // console.log(user.inComplete_profiles);
        setIncompleteProfiles(user.inComplete_profiles);  
      } else {
        // console.log("No incomplete profiles for user ID:", user.id);
      }
    });

  } catch {
    console.log("error");
  } finally {
    setLoading(false);
  }
};

  const handleApprove = async (id: number) => {
    setLoading(true);
    try {
      const response = await backendRequest("POST", `/approve-account/${id}`);
      getUserData();
      notifyResponse(response);
    } catch {
      console.log("error");
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
        localStorage.setItem("adminLogin", response.adminLogin)
        navigate("/dashboard");
      } else {
        notifyResponse(response);
      }
    } catch {
      console.log("error");
    }
  };

  const filteredAccounts = users.filter((user) => {
    const matchesSearch = user.name
      .toLowerCase()
      .includes(search.toLowerCase());

    let matchesFilter = true;

    if (filterStatus === "Pending") {

      matchesFilter = user.submit_for_approval === true;
    } else if (filterStatus === "In Progress") {
      matchesFilter =
        user.submit_for_approval === false &&
        user.criteria_approved === false &&
        user.is_active === true;
    } else if (filterStatus === "Low Balance") {
      matchesFilter = user.balance < 200 && user.is_active === true;
    } else if (filterStatus === "Suspended") {
      matchesFilter = user.is_active === false;
    } else if (filterStatus === "All Accounts") {
      matchesFilter = user.is_active === true;
    }

 

    // if (suspended) {
    //   matchesFilter = matchesFilter || user.is_active === false;
    // }



    return matchesSearch && matchesFilter;
  });
  console.log("filteredAccounts", filteredAccounts)
  const handleAccountAction = async () => {
    if (!selectedAccount || !actionType) return;

    try {
      const response = await backendRequest(
        "PUT",
        `/user/${selectedAccount}/${actionType}`
      );
      notifyResponse(response);
      setSuspendModalVisible(false);
      getUserData();
    } catch (error) {
      console.error(`Error during user ${actionType}:`, error);
    }
  };

  const handleProgress = (userId: number) => {
    setProgressAccountId(userId);
    setProgressModel(true);
  };
  const openModal = (id: number, action: "live" | "suspend") => {
    console.log("Opening modal for account:", id, "with action:", action);
    setSelectedAccount(id);
    setActionType(action);
    setSuspendModalVisible(true);
  };

//   const handleHidden = async (id: number) => {
//     setSelectedAccount(id);
//     setHideModalVisible(true);
//   };
//   const handleHiddenAction = async () => {
//     if (!selectedAccount) return;

//     try {
//       const response = await backendRequest(
//         "PUT",
//         `/user/${selectedAccount}/toggle-hidden`
//       );
//       notifyResponse(response);
//       getUserData();
//       setHideModalVisible(false);
//     } catch (error) {
//       console.error("Error while toggling hidden status:", error);
//     }
//   };

  const handleGrantMinutes = async () => {
    setGrantMinutesModel(true);
    console.log(userId);
    if (!userId || !assignedMinutes) return;
    setGrantMinutesLoading(true);
    try {
      const response = await backendRequest(
        "PUT",
        `/user-grant-minutes/${userId}`,
        { minutes: assignedMinutes }
      );
      notifyResponse(response);
      setGrantMinutesModel(false);
      setUserId(null);
      setAssignedMinutes(0);
      getUserData();
      setGrantMinutesLoading(false);
    } catch (error) {
      console.error(`Error during user ${actionType}:`, error);
      setGrantMinutesLoading(false);
    }
  };


  return (
    <>
      {!selectedUser && !showIncompleteProfiles &&
        <Card>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-4">Accounts</h1>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex flex-col md:flex-row items-center space-x-4 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search accounts by name "
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                id="search"
                aria-label="Search accounts"
                className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 w-full md:w-64  mb-2 sm:mb-0"
              />
              <Dropdown
                options={[
                  "All Accounts",
                  "In Progress",
                  "Pending",
                  "Low Balance",

                  "In Complete Profiles", 
                ]}
                selected={filterStatus}
                onSelect={(value) => {
                  setFilterStatus(value);
                  setShowIncompleteProfiles(value === "In Complete Profiles");
                }}
              />
            </div>
            {/* <div className="flex items-center space-x-4 w-full md:w-auto">
              <label htmlFor="hidden" className="text-sm">
                Hidden
              </label>
              <input
                type="checkbox"
                id="hidden"
                onChange={(e) => setHidden(e.target.checked)}
                checked={hidden}
                className="rounded border-primary/30 text-primary"
              />
              <label htmlFor="suspended" className="text-sm">
                Suspended
              </label>
              <input
                type="checkbox"
                id="suspended"
                onChange={(e) => setSuspended(e.target.checked)}
                checked={suspended}
                className="rounded border-primary/30 text-primary"
              />
            </div> */}
          </div>

          {loading ? (
            <Loading />
          ) : filteredAccounts.length === 0 ? (
            <p className="text-center text-gray-500">
              No accounts match your criteria.
            </p>
          ) : (
            <div className="overflow-x-auto mb-8">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-bold text-gray-900  tracking-wider">
                      user Name
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-bold text-gray-900  tracking-wider">
                      Balance
                    </th>
                    {/* <th scope="col" className="px-4 py-3 text-left text-sm font-bold text-gray-900  tracking-wider">
                      Remaining Minutes
                    </th> */}
                    {/* <th scope="col" className="px-4 py-3 text-left text-sm font-bold text-gray-900  tracking-wider">
                      Grant Minutes
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-bold text-gray-900  tracking-wider">
                      Progress
                    </th> */}

                    <th scope="col" className="px-4 py-3"></th>
                    <th scope="col" className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAccounts.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                      <td
                        className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline cursor-pointer"
                        onClick={() => setSelectedUser(account)}
                      >
                        {account.name}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                        <FiDollarSign className="mr-1" />
                        {account.balance.toFixed(2)}
                      </td>
                      {/* <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {account.min_left.toFixed(2)}
                      </td> */}
                      {/* <td
                        className="px-4 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline cursor-pointer"
                        onClick={() => {
                          setGrantMinutesModel(true);
                          setUserId(account.id);
                        }}
                      >
                        Grant
                      </td> */}
                      {/* <td
                        onClick={() => handleProgress(account.id)}
                        className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hover:text-blue-600 cursor-pointer text-center"
                      >
                        <FaEye className="inline-block" />
                      </td> */}

                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleLoginUser(account.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary/90 hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          Login User
                        </button>
                      </td>
                      {filterStatus === "Pending" && (
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleApprove(account.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors relative"
                          >
                            Approve {account.requestTrial && <span className="absolute -top-4 -right-5 text-red-500">Trial</span>}
                          </button>
                        </td>
                      )}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(account.id, account.is_active ? "suspend" : "live");
                          }}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${account.is_active
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                            }`}
                        >
                          {account.is_active ? "Live" : "Suspended"}
                        </span>
                      </td>
                      {/* <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleHidden(account.id)}
                          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white ${account.hidden
                              ? "bg-gray-600 hover:bg-gray-700"
                              : "bg-primary/90 hover:bg-primary"
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 ${account.hidden
                              ? "focus:ring-gray-500"
                              : "focus:ring-blue-500"
                            } transition-colors`}
                        >
                          {account.hidden ? "Unhide" : "Hide"}
                        </button>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {progressModel && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2">
                <div className="flex justify-between items-center border-b p-4">
                  <h2 className="text-lg font-bold">Progress Checklist</h2>
                  <button
                    onClick={() => setProgressModel(false)}
                    className="text-gray-600 hover:text-gray-800 text-xl"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-4">
                  <ChecklistComponent
                    userId={progressAccountId}
                    isModalOpen={progressModel}
                    closeModal={() => setProgressModel(false)}
                  />
                </div>
              </div>
            </div>
          )}
          {suspendModalVisible && (
            <ConfirmationModal
              show={suspendModalVisible}
              onClose={() => setSuspendModalVisible(false)}
              onConfirm={handleAccountAction}
              message={`Are you sure you want to ${actionType === "live" ? "live" : "suspend"
                } this account ?`}
            />
          )}
          {/* {hideModalVisible && (
            <ConfirmationModal
              show={hideModalVisible}
              onClose={() => setHideModalVisible(false)}
              onConfirm={handleHiddenAction}
              message={`Are you sure to perform this action ?`}
            />
          )} */}

          {grantMinutesModel && (

            <div className="fixed inset-0 flex items-center justify-center bg-gray-800/50  z-50 px-8  ">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-lg font-bold mb-4">Grant Minutes</h2>
                {/* <p className="mb-4">lol</p> */}
                <input
                  type="number"
                  step="0.01"
                  name="transfer_rate"
                  value={assignedMinutes}
                  onChange={(e) => setAssignedMinutes(+e.target.value)}
                  className="w-full px-4 py-2 border rounded-md  md:min-w-[20rem] mb-4"
                />
                <div className="flex justify-end space-x-4">
                  <button
                    className="bg-gray-300 text-sm sm:text-base text-gray-800 py-2 px-4 rounded hover:bg-gray-400"
                    onClick={() => {
                      setGrantMinutesModel(false);
                      setUserId(null);
                      setAssignedMinutes(0);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    disabled={grantMinutesLoading}
                    className={` bg-primary text-sm sm:text-base text-white py-1.5 sm:py-2 px-3 sm:px-4 rounded hover:bg-hoverdPrimary ${grantMinutesLoading && "cursor-not-allowed"
                      }`}
                    onClick={handleGrantMinutes}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </Card>
      }
      {showIncompleteProfiles && (
        <InCompleteProfiles 
          profiles={incompleteProfiles} 
          onClose={() => setShowIncompleteProfiles(false)}
          setIncompleteProfiles = {setIncompleteProfiles}
        />
      )}
      {/* {selecteduser && (
        <userProfile
          user={selecteduser}
          onClose={() => setSelecteduser(null)}
        />
      )} */}

    </>
  );
};
