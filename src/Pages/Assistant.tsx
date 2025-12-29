import { useEffect, useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { backendRequest } from "../Helpers/backendRequest";
import { notifyResponse } from "../Helpers/notyf";
import { TbTrash } from "react-icons/tb";
import ConfirmationModal from "../Components/ConfirmationModal";
import { FaPencilAlt, FaPhone, FaSearch } from "react-icons/fa";
import Vapi from "@vapi-ai/web";
import { PageNumbers } from "../Components/PageNumbers";
import { filterAndPaginateAssis } from "../Helpers/filterAndPaginate";
import { Loading } from "../Components/Loading";
import CallingUI from "../Components/CallingUI";
import CallForm from "../Components/CallForm";

interface Agent extends Record<string, unknown> {
  add_voice_id_manually: boolean;
  first_message: string;
  id: number;
  knowledgeBase: number;
  leadsfile: number;
  maxTokens: number;
  model: string;
  name: string;
  provider: string;
  systemPrompt: string;
  temperature: number;
  transcribe_language: string;
  transcribe_model: string;
  transcribe_provider: string;
  user_id: number;
  voice: string;
  voice_provider: string;
  vapi_assistant_id: string;
  category: string;
  assistant_toggle?: boolean;
}

interface FormData {
  name: string;
}

const Assistant = () => {
  const [agentList, setAgentList] = useState<Agent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [callAgentId, setCallAgentId] = useState<number | null>(null);
  const [vapiAssitantId, setVapiAssitantId] = useState<string>("");
  const [showCallModal, setShowCallModal] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  // const [toggleLoading, setToggleLoading] = useState(false);
  // const [selectedCategory, setSelectedCategory] = useState("");
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('ended');
  const [callerName, setCallerName] = useState<string>("");
  
  // const categories = [
  //   { label: "Warming Lead", value: "warming_lead" },
  //   { label: "Contacting Lead", value: "contacting_lead" },
  // ];

  const [callButton, setCallButton] = useState<{
    assistantId: number | null;
    status: "Talk" | "EndCall" | "Connecting";
  }>({
    assistantId: 0,
    status: "Talk",
  });

  const navigate = useNavigate();

  const {
    filteredItems: filteredAgentList,
    pagesCount,
    pageNumbers,
  } = useMemo(
    () => filterAndPaginateAssis(agentList, search, currentPage),
    [agentList, search, currentPage]
  );
  
  const vapi = useMemo(() => {
    console.log("Vapi Instance is Created...");
    return new Vapi("a754c96f-d575-4aeb-8716-dfd7851041e6");
  }, []);

  const getAssistants = async () => {
    try {
      const response = await backendRequest<Agent[], []>(
        "GET",
        "/get-user-assistants"
      );
      const agents: Agent[] = response;
      setAgentList(agents);
      console.log("All assistant", agents);
    } catch (error) {
      console.error("Failed to fetch assistants:", error);
    }
  };

  const handleCreateAssistant = () => {
    navigate("/assistant/createassistant");
  };

  const handleCallAgent = (vapiAssistantId: string, id: number) => {
    if (localStorage.getItem("trialMessage")) {
      const trailMessageIs = localStorage.getItem("trialMessage");

      if (trailMessageIs === "Your free trial has expired") {
        notifyResponse({
          success: false,
          detail: "Can't make call after trial  expired",
        });
        return;
      }
    }

    setVapiAssitantId(vapiAssistantId);
    setCallAgentId(id);
    setShowCallModal(true);
  };

  const handleFormSubmit = async (
    data: FormData,
    action: "testCall" | "phoneCall"
  ) => {
    setLoading(true);
    setCallerName(data.name);
    
    try {
      if (action === "phoneCall") {
        setShowCallModal(false);
        setCallStatus('connecting');
        
        const response = await backendRequest(
          "POST",
          `/phone-call/${vapiAssitantId}/${data.name}`,
          data
        );
        notifyResponse(response);
        setLoading(false);
      }
      
      if (action === "testCall") {
        setShowCallModal(false);
        setCallStatus('connecting');
        startCall(data);
        setLoading(false);
      }
    } catch {
      console.log("Error in handleFormSubmit:");
      setCallStatus('ended');
    }
  };

  const startCall = (data: FormData) => {
    const assistantOverrides = {
      transcriber: {
        provider: "deepgram" as const,
        model: "nova-2",
        language: "en-AU" as const,
      },
      recordingEnabled: false,
      variableValues: {
        first_name: data.name,
        last_name: "",
        email: "",
        mobile_no: "",
        add_date: "",
        custom_field_01: "",
        custom_field_02: "",
      },
    };

    try {
      vapi.start(vapiAssitantId, assistantOverrides);

      setCallButton({
        assistantId: callAgentId,
        status: "Connecting",
      });

      vapi.on("call-start", () => {
        setCallStatus('connected');
        setCallButton({
          assistantId: callAgentId,
          status: "EndCall",
        });
        console.log("Call has started.");
      });

      vapi.on("call-end", () => {
        setCallStatus('ended');
        setCallButton({
          assistantId: null,
          status: "Talk",
        });
        console.log("Call ended");
      });

      vapi.on("speech-start", () => {
        console.log("Assistant speech has started.");
      });

      vapi.on("speech-end", () => {
        console.log("Assistant speech has ended.");
      });

      vapi.on("error", (e) => {
        console.error("Error occurred:", e);
        setCallStatus('ended');
      });
    } catch (error) {
      console.error("Failed to start call:", error);
      setCallStatus('ended');
    }
  };

  const endCall = () => {
    vapi.stop();
    setCallStatus('ended');
    setCallButton({
      assistantId: 0,
      status: "Talk",
    });
    console.log("Call has been stopped.");
  };

  const handleDeleteAssistant = async () => {
    if (selectedAgentId !== null) {
      try {
        const response = await backendRequest(
          "DELETE",
          `/assistants/${selectedAgentId}`
        );
        if (response.success) {
          notifyResponse(response);
          setAgentList((prevAgents) =>
            prevAgents.filter((agent) => agent.id !== selectedAgentId)
          );
        }
      } catch (error) {
        console.error("Failed to delete assistant:", error);
      } finally {
        setShowModal(false);
      }
    }
  };

  const handleShowDeleteModal = (id: number) => {
    setSelectedAgentId(id);
    setShowModal(true);
  };

  const handleUpdateAssistant = async (id: number) => {
    navigate(`/assistant/createassistant?id=${id}`);
  };

  // const handleAssistantToggle = async (
  //   assistantId: number,
  //   currentState: boolean
  // ) => {
  //   const newToggleState = !currentState;
  //   setToggleLoading(true);
  //   try {
  //     const response = await backendRequest<{ success: boolean; detail?: string }>("POST", "/assistant-toggle", {
  //       id: assistantId,
  //       assistant_toggle: newToggleState,
  //     });

  //     if (response.success) {
  //       notyf.success(response.detail || "Assistant status updated successfully");
  //       getAssistants();

  //       setAgentList((prevAgents) =>
  //         prevAgents.map((agent) =>
  //           agent.id === assistantId
  //             ? { ...agent, assistant_toggle: newToggleState }
  //             : agent
  //         )
  //       );
  //       setToggleLoading(false);
  //     } else {
  //       notyf.error(response.detail || "Failed to update assistant status");
  //     }
  //   } catch (error) {
  //     console.error("Error toggling assistant:", error);
  //   }
  // };
  
  useEffect(() => {
    getAssistants();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="bg-white text-gray-900 p-2 sm:p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4">
        <div>
          <h1 className="text-base sm:text-xl md:text-2xl font-semibold text-primary">
             AI Assistant Hub
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Create and manage your intelligent AI companions
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3 w-full md:w-auto">
          <div className="relative flex items-center w-full md:w-48">
            <FaSearch className="absolute left-3 text-sm text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm rounded-md border border-primary outline-none"
            />
          </div>

         

          <button
            onClick={handleCreateAssistant}
            className="bg-primary hover: bg-green/70 text-xs sm:text-sm text-white font-medium py-1.5 px-3 rounded-md flex items-center gap-1.5"
          >
            <FiPlus className="text-sm" />
            Create Assistant
          </button>
        </div>
      </div>

      <div className="mt-6">
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Agent Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Transcriber
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Voice Provider
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredAgentList.length > 0 ? (
            filteredAgentList.map((agent) => (
              <tr 
                key={agent.id} 
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">#{agent.id}</div>
                </td>
                
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                    {agent.description && (
                      <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                        {agent.description}
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {agent.transcribe_provider}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {agent.voice_provider}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-end space-x-2">
                    {/* Call Button */}
                    {callButton.assistantId !== agent.id ? (
                      <button
                        onClick={() => handleCallAgent(agent.vapi_assistant_id, agent.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors duration-200"
                      >
                        <FaPhone className="w-3 h-3 mr-1.5" />
                        Call Agent
                      </button>
                    ) : callButton.status === "Connecting" ? (
                      <button className="inline-flex items-center px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg opacity-90 cursor-not-allowed">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5"></div>
                        Connecting...
                      </button>
                    ) : callButton.status === "EndCall" ? (
                      <button
                        onClick={() => endCall()}
                        className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 animate-pulse transition-colors duration-200"
                      >
                        <FaPhone className="w-3 h-3 mr-1.5 rotate-135" />
                        End Call
                      </button>
                    ) : null}

                    {/* Edit Button */}
                    <button
                      onClick={() => handleUpdateAssistant(agent.id)}
                      className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors duration-200"
                      title="Edit Assistant"
                    >
                      <FaPencilAlt className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleShowDeleteModal(agent.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Delete Assistant"
                    >
                      <TbTrash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-6 py-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No assistants found</h3>
                  <p className="text-gray-500">Try a different search or create a new assistant</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </div>
    </div>


      {/* Call Form Modal */}
      {showCallModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <CallForm
            onSubmit={handleFormSubmit}
            onClose={() => setShowCallModal(false)}
          />
        </div>
      )}

      {/* Beautiful Calling UI */}
      <CallingUI
        isVisible={callStatus !== 'ended'}
        onEndCall={endCall}
        status={callStatus}
        agentName={callerName ? `${callerName}'s Call` : "AI Assistant"}
      />

      <PageNumbers
        pageNumbers={pageNumbers}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pagesCount={pagesCount}
      />
      
      <ConfirmationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDeleteAssistant}
        message="Are you sure you want to delete this assistant? This action cannot be undone."
      />
    </div>
  );
};

export default Assistant;
