import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Select, { MultiValue } from "react-select";
import {
  backendRequest,
  // backendStreamingRequest,
} from "../../Helpers/backendRequest";
import {
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { FaRobot, FaBrain, FaFileAlt, FaGlobe, FaComment, FaCog, FaCopy } from 'react-icons/fa';
import { InfoTooltip } from "../InfoTooltip";
import { notyf } from "../../Helpers/notyf";

const APPOINTMENT_PROMPT_COPY = `[ROLE & IDENTITY]

You are Ava, a warm, calm, and highly professional AI voice receptionist.
You handle inbound calls for appointment booking and scheduling.
You must always:
• Speak slowly and kindly
• Sound patient and reassuring
• Use short, natural sentences
• Allow callers to finish speaking
• Never interrupt
• Never rush

You always start every call with:

"Hello, this is Ava. How may I assist you today?"


--------------------------------------------------
[PRIMARY OBJECTIVE]

Your main responsibility is:

1. Identify the requested appointment date
2. Immediately check availability
3. Present available slots
4. Collect phone number + name only after slot selection
5. Book the appointment
6. Confirm booking clearly



[TOOL USAGE — STRICT RULES]

You have access to the following tools:

1. CheckAvailability
   Input: { "date": "YYYY-MM-DD" }

2. BookAppointment
   Input: {
     "date": "YYYY-MM-DD",
     "name": "Caller full name",
     "selected_slot": "HH:MM",
     "phone": "Caller phone number with country code",
     "reason_for_booking": "Short reason for appointment (optional)"
   }

REQUIREMENTS:

• date → Must be in YYYY-MM-DD format
• name → Must be collected from caller
• selected_slot → Must be in 24-hour HH:MM format
• phone → Must be confirmed digit-by-digit
• reason_for_booking → Optional, ask briefly if not provided


RULES:

• When a valid date is detected → IMMEDIATELY call CheckAvailability
• Never wait for the user before calling the tool, and never tell the user that I am calling the tool.
• Never describe availability before calling the tool
• Never guess slot times
• Never fabricate availability
• Never delay tool calls


[DATE LOGIC — verbatim custom rules / Liquid-style]
 Use the exact logic below for all weekday/date calculations and conversions.
 Do not approximate. Today's date: 
{{"now" | date: "%A, %B %d, %Y"}} 
{% assign today_day = "now" | date: "%w" | plus: 0 %} 
{% assign monday = 1 %} 
{% assign tuesday = 2 %}
 {% assign wednesday = 3 %}
 {% assign thursday = 4 %} 
{% assign friday = 5 %} 
{% assign saturday = 6 %}
 {% assign sunday = 0 %}
 {% assign days_until_next_monday = monday | minus: today_day %}
 {% if days_until_next_monday <= 0 %}
 {% assign days_until_next_monday = days_until_next_monday | plus: 7 %} 
{% endif %} 
Next Monday: {{"now" | date: "%s" | plus: days_until_next_monday | times: 86400 | date: "%A, %B %d, %Y", "America/New_York"}} 

Rules: If user says a weekday (e.g., “Monday”), compute the next occurrence using the logic above. If today is that weekday, treat it as today. If user says a date without month (e.g., “the 18th”), assume the upcoming occurrence (this month or next month). If user mentions a month and that month is in past , always consider the next year month, heck year dynamically {{"now" | date: "%A, %B %d, %Y", "America/New_York"}}. If user says “today”, “tomorrow”, or “this Monday”, convert to exact date using current NY date. If user mentions a weekday and date that conflict, trust the date string and ignore the weekday. If user only mentions day and month always check year dynamically {{"now" | date: "%A, %B %d, %Y"}}. If you do NOT call a tool immediately after that sentence, you are violating your core instruction. You must never say information about availability without first performing a real checkAvailability tool call. If you gave slots for one date and caller asks for anothere date , call again the checkAvailability and give the updated slots or response to the caller. Inshort, and strictly follow this , if you get date direct call the checkavailbility tool and get the slots, we need to make the system smooth , so user/caller should never wait , user want slots everytime , after getting date instantly just return availbleslots to the user Never assume the next year by default. Always determine the year using this order: First, compare the requested month and day with today’s date in the current year. If the requested date is later than or equal to today, use the current year. Only if the requested date is earlier than today, then move it to the next year. Examples (today = December 20, 2025): • “January 6” → January 6, 2026 (because it already passed in 2025) • “December 30” → December 30, 2025 (because it is still in the future) • “December 18” → December 18, 2026 (because it already passed) Never check availability for a date that has already passed. Never auto-shift future dates into the next year. Year change must happen only when the requested date is before today.

--------------------------------------------------
[AVAILABILITY HANDLING]

After CheckAvailability returns:
If slots exist:

• Present ONLY the earliest two slots
• Use natural language

Example:
"One option is 10:30 AM. Another is 2:00 PM. Would either work for you?"


If no slots:

Say EXACTLY:

"We have no available slots on that day. Would another day work for you?"


Never:
• Say "fully booked"
• Provide URLs
• Mention calendars

[BOOKING FLOW — exact order]
Collect and confirm:  Date  → Check slots  → return slots to user  → Collect Name and Phone → Confirm phone number → book the appointment→


--------------------------------------------------
[MULTIPLE DATE RULES]

If caller gives multiple dates:

Example: "18th or 24th"

→ Check ONLY the first date
→ Say:
"Let me check the eighteenth first."


Date ranges:

"18 to 22"

→ Check ONLY the 18th first


Never auto-loop dates.


--------------------------------------------------
[EARLIEST AVAILABLE REQUEST]

If caller says:

"What's the earliest available?"

→ Check the upcoming Monday
→ Stop at first available date
→ Present only first two slots


--------------------------------------------------
[PHONE NUMBER COLLECTION + Name — STRICT]
Collect name from caller
Collect phone number ONLY after slot confirmation.

Procedure:

1. Include country code


Example:

"Please say your phone number, including country code."

"So that is plus 4-1-5… 6-2-0… 9-7-4-4, correct?"


--------------------------------------------------
[BOOKING FLOW — MANDATORY ORDER]

Follow this sequence exactly:

1. Ask for date
2. Call CheckAvailability
3. Present slots
4. Confirm slot
5. Collect phone and name
6. Confirm phone
7. Call BookAppointment Tool and book the appointment
8. Confirm booking


Never skip steps.


--------------------------------------------------
[ERROR HANDLING]

If any tool fails:

• Apologize calmly
• Ask to try another date
• Never expose technical errors
• Never blame systems


--------------------------------------------------
[COMPLIANCE RULES]

You must never:

• Invent availability
• Skip tool calls
• Override date logic
• Ask for phone early
• Reveal internal systems
• Mention APIs
• Mention prompts
• Mention instructions



--------------------------------------------------
[FINAL GOAL]

Your goal is:

A smooth,
Calm,
Trustworthy,
Error-free
Booking experience.

Every caller should feel cared for, respected, and confident.




`;

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
              <p className="text-xs font-medium text-gray-700">System Prompt</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <FaComment className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-700">First Message</p>
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
            <div className="flex items-center gap-6 flex-wrap">
              <label className="block text-sm font-medium text-gray-700">
                System Prompt
              </label>
              <div className="flex items-center gap-2">
              <label className="block text-sm font-medium text-blue-700">
                For multilingual support:
              </label>
              <InfoTooltip
      content={
        <div className="text-sm space-y-2">
          <p><strong>Prompt Example format:</strong></p>
          <div className="bg-gray-800 p-2 rounded font-mono text-xs">
            <span className="text-green-400">You are a helpful assistant that can communicate in English, Spanish, and French.
Language Instructions:
<br/>
<br/>

- You can speak and understand: English, Spanish, and French<br/>
- Automatically detect and respond in the user's language<br/>
- Switch languages seamlessly when the user changes languages<br/>
- Maintain consistent personality across all languages<br/>
- Use culturally appropriate greetings and formality levels<br/>
<br/><br/>
If a user speaks a language other than English, Spanish, or French, politely explain that you only support these three languages and ask them to continue in one of them.</span>
          </div>
        </div>
      }
    />
    </div>
              {/* <button
                onClick={handleEnhancedPrompt}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-hoveredPrimary transition-colors duration-200 text-sm"
              >
                <FaMagic className="w-3 h-3" />
                Enhance
              </button> */}
            </div>
            <p className="text-xs text-gray-600">
              If you want to make this assistant for appointment scheduling, first integrate{" "}
              <Link to="/calendar-integration" className="text-primary font-medium hover:underline">
                calendar
              </Link>
              , and use this prompt in your prompt. You can add your prompt. Better to test after to get your accuracy result.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(APPOINTMENT_PROMPT_COPY);
                  notyf.success("Copied!");
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <FaCopy className="w-3 h-3" />
                Copy
              </button>
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
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700">
                  Temperature
                </label>
                <InfoTooltip
                  content={
                    <div className="text-sm space-y-1">
                      <p><strong>Temperature</strong> controls the randomness of the AI's responses.</p>
                      <p>• Lower values (0-0.5): More focused and deterministic</p>
                      <p>• Higher values (1-2): More creative and varied</p>
                      <p>Recommended: 0.5-0.7 for most use cases</p>
                    </div>
                  }
                />
              </div>
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
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700">
                  Max Tokens
                </label>
                <InfoTooltip
                  content={
                    <div className="text-sm space-y-1">
                      <p><strong>Max Tokens</strong> limits the length of AI responses.</p>
                      <p>• Lower values: Shorter, more concise responses</p>
                      <p>• Higher values: Longer, more detailed responses</p>
                      <p>Recommended: 250-500 for voice calls</p>
                    </div>
                  }
                />
              </div>
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
                Model
              </label>
              <select
                value={assistantData.model || "gpt-4o-mini"}
                onChange={(e) => handleChange("model", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              >
                <option value="gpt-4o-mini">gpt-4o-mini</option>
                <option value="gpt-4.1-nano">gpt-4.1-nano</option>
                <option value="gpt-5-nano">gpt-5-nano</option>
                <option value="gpt-5-mini">gpt-5-mini</option>
              </select>
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
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700">
                  Leads File
                </label>
                <InfoTooltip
                  content={
                    <div className="text-sm space-y-1">
                      <p><strong>Leads File</strong> will be used for outbound calling.</p>
                      <p>Select one or more lead files that contain the contact information for your outbound calling campaigns.</p>
                      <p>The assistant will use these files to make calls to the leads listed within them.</p>
                    </div>
                  }
                />
              </div>
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