import React, { useEffect, useState } from "react";
import Select, { MultiValue } from "react-select";
import {
  backendRequest,
  // backendStreamingRequest,
} from "../../Helpers/backendRequest";
import {
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { FaRobot, FaBrain, FaFileAlt, FaGlobe, FaComment, FaCog } from 'react-icons/fa';
import { InfoTooltip } from "../InfoTooltip";

interface AssistantData {
  name: string;
  provider: string;
  first_message: string;
  model: string;
  systemPrompt: string;
  knowledgeBase: string[];
  temperature: number;
  maxTokens: number;
  leadsfile: number[];
  languages?: string[];
}

interface ModelProps {
  assistantData: AssistantData;
  setAssistantData: React.Dispatch<React.SetStateAction<AssistantData>>;
  handleChange: (
    key: keyof AssistantData,
    value: string | number | string[] | number[]
  ) => void;
}

interface Document {
  id: number;
  vapi_file_id: string;
  file_name: string;
}
interface File {
  id: number;
  name: string;
}

const Model: React.FC<ModelProps> = ({
  assistantData,
  handleChange,
  // setAssistantData,
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [leadsFile, setLeadsFile] = useState<File[]>([]);
  // const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [showEnhancedModel, setShowEnhancedModel] = useState<boolean>(false);
  // const [loading, setLoading] = useState<boolean>(false)
  // const [assignLanguages, setAssignLanguages] = useState<{ value: string; label: string }[]>([]);

  const fetchDocuments = async () => {
    try {
      const response = await backendRequest<Document[], []>(
        "GET",
        "/vapi_docs"
      );
      setDocuments(response);
    } catch (error) {
      console.error("Fetch documents error:", error);
    }
  };
  const fetchLeadsFile = async () => {
    try {
      const response = await backendRequest<File[], []>("GET", "/files");
      setLeadsFile(response);
    } catch (error) {
      console.error("Fetch documents error:", error);
    }
  };

  // useEffect(() => {
  //   const fetchAssignLanguage = async () => {
  //     try {
  //       const response = await backendRequest<{ language: { value: string; label: string }[] }>("GET", "/assign_language");
  //       if (response && 'language' in response) {
  //       setAssignLanguages(response.language);
  //       }
  //     } catch (error) {
  //       console.error("Fetch documents error:", error);
  //     }
  //   };

  //   fetchAssignLanguage();
  // }, []);

  useEffect(() => {
    fetchDocuments();
    fetchLeadsFile();
  }, []);

  const documentOptions = documents.map((doc) => ({
    value: doc.vapi_file_id,
    label: doc.file_name,
  }));
  const leadfileOptions = leadsFile.map((lead) => ({
    value: lead.id,
    label: lead.name,
  }));

  // const assignOptions = (assignLanguages || []).map((lang) => ({
  //   value: lang.value,
  //   label: lang.label
  // }));
  const handleDocumentSelection = (
    selectedOptions: MultiValue<{ value: string; label: string }>
  ) => {
    const selectedIds = selectedOptions.map((option) => option.value);
    handleChange("knowledgeBase", selectedIds);
  };
  const handleleadsFileSelection = (
    selectedOptions: MultiValue<{ value: number; label: string }>
  ) => {
    const selectedIds = selectedOptions.map((option) => option.value);
    handleChange("leadsfile", selectedIds);
  };

  // const handleChangeLanguage = (selectedOptions: MultiValue<{ value: string; label: string }>) => {
  //   const selectedOption = selectedOptions.map((option) => option.value);
  //   handleChange("languages", selectedOption);
  // };

  // const addVariable = (
  //   field: string,
  //   input: "first_message" | "systemPrompt"
  // ) => {
  //   const firstMessage = document.getElementById(
  //     input === "first_message" ? "first_message" : "systemPrompt"
  //   ) as HTMLInputElement;
  //   const newValue =
  //     firstMessage?.value?.substring(0, firstMessage.selectionStart!) +
  //     `{{${field}}}` +
  //     firstMessage?.value?.substring(firstMessage.selectionEnd!);
  //   setAssistantData({
  //     ...assistantData,
  //     [input]: newValue,
  //   });
  // };

  // const handleEnhancedPrompt = async () => {
  //   const prompt = assistantData.systemPrompt || "";
  //   // console.log("loading", loading);
  //   setShowEnhancedModel(true);
  //   setLoading(true)
  //   try {
  //     const stream = backendStreamingRequest("POST", "/enhanced_prompt", {
  //       prompt,
  //     });
  //     let enhancedText = "";
  //     for await (const chunk of stream) {
  //       if (chunk) {
  //         setLoading(false)

  //         enhancedText += chunk;
  //         setEnhancedPrompt(enhancedText);
  //       }
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // const variableButtons = [
  //   { field: "first_name", label: "First Name" },
  //   { field: "last_name", label: "Last Name" },
  //   { field: "email", label: "Email" },
  //   { field: "add_date", label: "Add Date" },
  //   { field: "mobile_no", label: "Mobile No" },
  //   { field: "custom_field1", label: "Custom Field 01" },
  //   { field: "custom_field2", label: "Custom Field 02" },
  // ];

  return (
    <div className="min-h-full bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
              <FaBrain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">AI Model Configuration</h1>
              <p className="text-gray-600 text-sm">
                Configure the core AI model settings and behavior for your assistant
              </p>
            </div>
          </div>

          {/* Simple Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <FaRobot className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-700">Assistant</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <FaFileAlt className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-700">Knowledge</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <FaGlobe className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-700">Languages</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <FaComment className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-700">Messages</p>
            </div>
          </div>
        </div>

        {/* Main Configuration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaCog className="w-4 h-4 text-primary mr-2" />
            Basic Configuration
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Assistant Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
              Assistant Name
            </label>
            <input
              type="text"
              id="name"
                value={assistantData.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter assistant name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            />
          </div>

            {/* Knowledge Base */}

<div className="space-y-3">
  <div className="flex items-center gap-2">
    <label className="block text-sm font-medium text-gray-700">
      Knowledge Base Files
    </label>
    <InfoTooltip
      content={
        <div className="text-sm space-y-2">
          <p><strong>Instructions:</strong> After selecting files, update your system prompt:</p>
          <div className="bg-gray-800 p-2 rounded font-mono text-xs">
            <span className="text-green-400">"Reference uploaded documents when answering questions about</span>
            <br/>
            <span className="text-green-400">[your topics here] for accurate information."</span>
          </div>
        </div>
      }
    />
    <span className="text-xs text-gray-500 ml-auto">
      {assistantData.knowledgeBase?.length || 0} selected
    </span>
  </div>
  
  <Select
    isMulti
    value={documentOptions.filter((option) =>
      (assistantData.knowledgeBase || []).includes(option.value)
    )}
    options={documentOptions}
    onChange={handleDocumentSelection}
    placeholder="Select knowledge files..."
    className="react-select-container"
    classNamePrefix="react-select"
    styles={{
      control: (base) => ({
        ...base,
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        minHeight: '40px',
        '&:hover': { borderColor: '#9ca3af' },
        '&:focus-within': { 
          borderColor: '#fab200', 
          boxShadow: '0 0 0 3px rgba(250, 178, 0, 0.1)' 
        }
      })
    }}
  />
  
  {/* Simple helper line */}
  <p className="text-xs text-gray-600 pt-1 border-t border-gray-100">
    <span className="text-primary font-medium">⚠️ Important:</span> Update your system prompt to instruct 
    the assistant when to use these documents.
  </p>
</div>
        </div>

          {/* System Prompt Section */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                System Prompt
              </label>
              {/* <button
                onClick={handleEnhancedPrompt}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-hoveredPrimary transition-colors duration-200 text-sm"
              >
                <FaMagic className="w-3 h-3" />
                Enhance
              </button> */}
            </div>
            <textarea
              id="systemPrompt"
              value={assistantData.systemPrompt || ""}
              onChange={(e) => handleChange("systemPrompt", e.target.value)}
              placeholder="Define how your AI should behave and respond..."
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            />
            
            {/* Variable Buttons */}
            {/* <div className="flex flex-wrap gap-2">
              {variableButtons.map((button) => (
              <button
                  key={button.field}
                  onClick={() => addVariable(button.field, "systemPrompt")}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors duration-200"
              >
                  {button.label}
              </button>
              ))}
            </div> */}
          </div>

          {/* First Message Section */}
          <div className="space-y-3 mb-6">
            <label className="block text-sm font-medium text-gray-700">
              First Message
            </label>
            <textarea
              id="first_message"
              value={assistantData.first_message || ""}
              onChange={(e) => handleChange("first_message", e.target.value)}
              placeholder="Enter the first message your assistant will say..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
            />
            
            {/* Variable Buttons */}
            {/* <div className="flex flex-wrap gap-2">
              {variableButtons.map((button) => (
              <button
                  key={button.field}
                  onClick={() => addVariable(button.field, "first_message")}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors duration-200"
              >
                  {button.label}
              </button>
              ))}
            </div> */}
          </div>

          {/* Model Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Temperature
              </label>
              <input
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={assistantData.temperature || 0}
                onChange={(e) => handleChange("temperature", parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Max Tokens
              </label>
              <input
                type="number"
                min="1"
                value={assistantData.maxTokens || 1000}
                onChange={(e) => handleChange("maxTokens", parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Provider
              </label>
              <input
                type="text"
                value={assistantData.provider || ""}
                onChange={(e) => handleChange("provider", e.target.value)}
                placeholder="e.g., OpenAI"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Additional Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Languages */}
            {/* <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Languages
              </label>
              <Select
                isMulti
                value={assignOptions.filter((option) =>
                  (assistantData.languages || []).includes(option.value)
                )}
                options={assignOptions}
                onChange={handleChangeLanguage}
                placeholder="Select languages..."
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    minHeight: '40px',
                    '&:hover': { borderColor: '#9ca3af' },
                    '&:focus-within': { borderColor: '#3b82f6', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' }
                  })
                }}
              />
            </div> */}

            {/* Leads File */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Leads File
              </label>
              <Select
                isMulti
                value={leadfileOptions.filter((option) =>
                  (assistantData.leadsfile || []).includes(option.value)
                )}
                options={leadfileOptions}
                onChange={handleleadsFileSelection}
                placeholder="Select leads file..."
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    minHeight: '40px',
                    '&:hover': { borderColor: '#9ca3af' },
                    '&:focus-within': { borderColor: '#3b82f6', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' }
                  })
                }}
              />
          </div>
        </div>
      </div>

        {/* Enhanced Prompt Modal */}
      {showEnhancedModel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Enhanced Prompt</h3>
            <button
              onClick={() => setShowEnhancedModel(false)}
                  className="text-gray-400 hover:text-gray-600"
            >
                  <XMarkIcon className="w-5 h-5" />
            </button>
              </div>

              <div className="p-4">
            {/* {loading ? (
                  <div className="flex items-center justify-center py-8">
              <ChatLoading />
                  </div>
            ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Enhanced System Prompt
                      </label>
              <textarea
                value={enhancedPrompt}
                        onChange={(e) => setEnhancedPrompt(e.target.value)}
                rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
              />
                    </div>

                    <div className="flex justify-end space-x-3">
              <button
                        onClick={() => setShowEnhancedModel(false)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                        Cancel
              </button>
              <button
                onClick={() => {
                          handleChange("systemPrompt", enhancedPrompt);
                          setShowEnhancedModel(false);
                }}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-hoveredPrimary transition-colors duration-200"
              >
                        Use Enhanced Prompt
              </button>
            </div>
              </div>
            )} */}
              </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Model;