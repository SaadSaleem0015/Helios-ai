import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { backendRequest } from "../../Helpers/backendRequest";
import { notifyResponse } from "../../Helpers/notyf";

const AdminTermconditions: React.FC = () => {
  const [editorContent, setEditorContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await backendRequest("GET", "/get-terms-and-conditions");
        setEditorContent(response.content || ""); 
      } catch (error) {
        console.error("Error fetching terms and conditions:", error);
        notifyResponse({ success: false, message: "Failed to fetch terms and conditions." });
      }
    };

    fetchTerms();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await backendRequest("POST", "/terms-and-conditions", { content: editorContent });
      notifyResponse(response); 
    } catch (error) {
      console.error("Error saving terms and conditions:", error);
      notifyResponse({ success: false, message: "Failed to save terms and conditions." });
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="mx-0 p-0 sm:p-4 md:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-6">Edit Terms and Conditions</h1>
      <div className="bg-white p-1 sm:p-4 md:p-6 rounded-lg border border-gray-200">
        <ReactQuill
          value={editorContent}
          onChange={setEditorContent}
          placeholder="Write your terms and conditions here..."
          theme="snow"
          className="mb-4"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className={`py-2 px-2 md:px-6 rounded-md ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary text-white hover:bg-hoverdPrimary"
            }`}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminTermconditions;
