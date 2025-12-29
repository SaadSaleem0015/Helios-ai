import { useState, useEffect } from "react";
import { backendRequest } from "../../Helpers/backendRequest";

interface Checklist {
  active_plan: boolean;
  positive_balance: boolean;
  payment_method_exists: boolean;
  scheduled_call: boolean;
  has_admin_approved: boolean;
  submit_for_approval: boolean;
  has_lead: boolean;
  has_assistant: boolean;
  has_purchased_number: boolean;
}

interface Task {
  label: string;
  completed: boolean;
  link: string;
}

export const ChecklistComponent = ({
  userId,
  isModalOpen,
  closeModal,
}: {
  userId: number | null;
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId || !isModalOpen) return;

    async function fetchChecklist() {
      setLoading(true);
      try {
        const response = await backendRequest<Checklist>(
          "GET",
          `/user-checklist/${userId}`
        );
        setChecklist(response);
        const fetchedTasks: Task[] = [
          {
            label: "Active primary payment method",
            completed: response.payment_method_exists,
            link: "/payment",
          },
          {
            label: "Positive balance in VV account",
            completed: response.positive_balance,
            link: "/make-payment",
          },
          // {
          //   label: "Active plan",
          //   completed: response.active_plan,
          //   link: "/billing-plan",
          // },
          {
            label: "Call schedule",
            completed: response.scheduled_call,
            link: "/scheduleCall",
          },
          {
            label: "Purchase Number",
            completed: response.has_purchased_number,
            link: "/getnumbers",
          },
          {
            label: "Create Assistant",
            completed: response.has_assistant,
            link: "/assistant",
          },
          {
            label: "Upload Leads",
            completed: response.has_lead,
            link: "/files",
          },
        ];
        setTasks(fetchedTasks);
      } catch (error) {
        console.error("Error fetching checklist:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchChecklist();
  }, [userId, isModalOpen]);

  const completionPercentage = checklist
    ? checklist.has_admin_approved
      ? 100
      : (tasks.filter((task) => task.completed).length / tasks.length) * 100
    : 0;

  if (!isModalOpen || !userId) return null;

  return (
    <div className="fixed inset-0 p-6 bg-black/10 flex items-center justify-center z-50">
      <div className="bg-white px-4 py-6 rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-lg font-bold">Checklist</h2>
          <button
            onClick={closeModal}
            className="text-gray-600 hover:text-gray-800 text-xl"
          >
            ✕
          </button>
        </div>
        <div className="p-4">
          {loading ? (
            <p className="text-center text-gray-500">Loading checklist...</p>
          ) : (
            <>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm">
                    {Math.round(completionPercentage)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>
              <ul className="space-y-3">
                {tasks.map((task, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-3 border-b border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center">
                      <span
                        className={`w-5 h-5 flex items-center justify-center rounded-full text-white font-bold text-base ${
                          task.completed ? "bg-primary" : "bg-gray-300"
                        }`}
                      >
                        {task.completed ? "✓" : ""}
                      </span>
                      <span className="ml-3 text-base">{task.label}</span>
                    </div>
                    <p
                      className={`text-base font-medium ${
                        task.completed
                          ? "text-primary"
                          : " text-gray-400 "
                      }`}
                    >
                      {task.completed ? "Completed" : "Incomplete"}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
