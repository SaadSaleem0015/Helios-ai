import { useEffect, useState } from "react";
import { backendRequest } from "../../Helpers/backendRequest";
import { Card } from "../../Components/Card";
import { Loading } from "../../Components/Loading";
import { notifyResponse } from "../../Helpers/notyf";
import { FaPencilAlt } from "react-icons/fa";
import { TbTrash } from "react-icons/tb";

export interface DncPrompt {
  id: number;
  prompt: string;
}

export function AdminDnc() {
  const [loading, setLoading] = useState(true);
  const [dncPrompts, setDncPrompts] = useState<DncPrompt[]>([]);
  const [newPrompt, setNewPrompt] = useState<string>("");
  const [editingPrompt, setEditingPrompt] = useState<DncPrompt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function fetchDncprompts() {
    setLoading(true);
    try {
      const response = await backendRequest<DncPrompt[], []>(
        "GET",
        "/all-dnc-prompts"
      );
      setDncPrompts(response);
    } catch (error) {
      console.error("Error fetching DNC prompts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function addDncPrompt() {
    if (!newPrompt.trim()) {
      notifyResponse({
        success: false,
        detail: "Prompt cannot be empty.",
      });
      return;
    }

    try {
      const response = await backendRequest<DncPrompt>(
        "POST",
        "/dnc",
        { prompt: newPrompt }
      );
      notifyResponse(response);
      if (response) {
        setNewPrompt("");
        fetchDncprompts();
      }
    } catch (error) {
      console.error("Error adding DNC prompt:", error);
    }
  }

  async function deleteDncPrompt(id: number) {
    try {
      const response = await backendRequest(
        "DELETE",
        `/delete-dnc-prompt/${id}`
      );
      notifyResponse(response);
      fetchDncprompts();
    } catch (error) {
      console.error("Error deleting DNC prompt:", error);
    }
  }

  async function updateDncPrompt() {
    if (!editingPrompt) return;
    
    try {
      const response = await backendRequest(
        "PUT",
        `/update-dnc-prompt/${editingPrompt.id}`,
        { prompt: editingPrompt.prompt }
      );
      notifyResponse(response);
      setEditingPrompt(null);
      setIsModalOpen(false);
      fetchDncprompts();
    } catch (error) {
      console.error("Error updating DNC prompt:", error);
    }
  }

  useEffect(() => {
    fetchDncprompts();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">DNC Phrases</h1>
        <p className="text-sm text-gray-600">
          Manage phrases that automatically mark leads as Do Not Call when detected in conversations
        </p>
      </div>

      {/* Add New Phrase Card */}
      <Card className="border border-gray-200 rounded-xl shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Add New Phrase
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Enter a phrase that contacts might use to opt out of calls
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              placeholder="e.g. Remove me from your list or Don't call me again"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  addDncPrompt();
                }
              }}
            />
            <button
              onClick={addDncPrompt}
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors shadow-sm whitespace-nowrap"
            >
              Add Phrase
            </button>
          </div>
        </div>
      </Card>

      {/* Existing Phrases Card */}
      <Card className="border border-gray-200 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Existing Phrases
            </h2>
            <p className="text-xs text-gray-500">
              {dncPrompts.length > 0
                ? `${dncPrompts.length} phrase${dncPrompts.length !== 1 ? "s" : ""} configured`
                : "No phrases added yet"}
            </p>
          </div>
          {dncPrompts.length > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {dncPrompts.length} Active
            </span>
          )}
        </div>

        {dncPrompts.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <TbTrash className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 mt-2">No DNC phrases yet</p>
              <p className="text-xs text-gray-500 max-w-sm">
                Start by adding common opt-out phrases your contacts might use
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {dncPrompts.map((prompt) => (
              <div
                key={prompt.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 first:pt-0 last:pb-0 hover:bg-gray-50/50 rounded-lg px-2 -mx-2 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 break-words font-medium">
                    {prompt.prompt}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setEditingPrompt(prompt);
                      setIsModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-primary hover:border-primary transition-all"
                    aria-label="Edit phrase"
                    title="Edit phrase"
                  >
                    <FaPencilAlt className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteDncPrompt(prompt.id)}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all"
                    aria-label="Delete phrase"
                    title="Delete phrase"
                  >
                    <TbTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Edit Modal */}
      {isModalOpen && editingPrompt && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Edit Phrase</h2>
              <p className="text-xs text-gray-500">Update the DNC phrase text</p>
            </div>
            <input
              type="text"
              value={editingPrompt.prompt}
              onChange={(e) =>
                setEditingPrompt({ ...editingPrompt, prompt: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors mb-4"
              placeholder="Enter DNC phrase"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  updateDncPrompt();
                }
              }}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingPrompt(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateDncPrompt}
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
