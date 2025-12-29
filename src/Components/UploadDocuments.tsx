import React, { ChangeEvent, useState } from "react";
import { backendRequest } from "../Helpers/backendRequest";
import { TbUpload } from "react-icons/tb";
import { FcCheckmark } from "react-icons/fc";
import { AiOutlineCloseCircle, AiOutlineInfoCircle, AiOutlineWarning } from "react-icons/ai";
import { MdOutlineTipsAndUpdates, MdOutlineDescription } from "react-icons/md";
import { FiExternalLink } from "react-icons/fi";
import { RiFileTextLine } from "react-icons/ri";
import { BsFiletypePdf, BsFiletypeDoc, BsFiletypeDocx } from "react-icons/bs";
import { notifyResponse } from "../Helpers/notyf";
import { useNavigate } from "react-router-dom";

export interface UploadFileProps {
    onSuccess?: (response: object) => void;
    onStart?: () => void;
}

export const UploadDocuments: React.FC<UploadFileProps> = ({ onSuccess, onStart }) => {
    const [fileName, setFileName] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [fileUploaded, setFileUploaded] = useState<boolean>(false);
    const [showInstructions, setShowInstructions] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [sizeWarning, setSizeWarning] = useState<string>("");
    const navigate = useNavigate();

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSizeWarning(""); // Clear previous warnings
        
        if (e.currentTarget.files && e.currentTarget.files.length > 0) {
            const selectedFile = e.currentTarget.files[0];
            const fileSizeMB = selectedFile.size / 1048576; // Convert to MB
            
            // Check file size (5MB max)
            if (fileSizeMB > 5) {
                notifyResponse({ 
                    success: false, 
                    detail: "File size must be less than 5MB. Please upload a smaller file." 
                });
                return;
            }
            
            // Show warning for files over 1MB
            if (fileSizeMB > 1) {
                setSizeWarning(`⚠️ File size is ${fileSizeMB.toFixed(1)}MB. For best results, try to keep knowledge base file sizes less than 1MB.`);
            }
            
            setFile(selectedFile);
            setFileUploaded(true);
            
            // Auto-fill name from filename if empty
            if (!fileName) {
                const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
                setFileName(nameWithoutExt);
            }
        } else {
            setFile(null);
            setFileUploaded(false);
            setSizeWarning("");
        }
    };

    const resetFileSelection = () => {
        setFile(null);
        setFileUploaded(false);
        setFileName("");
        setSizeWarning("");
    };

    const getFileIcon = () => {
        if (!file) return <RiFileTextLine className="text-4xl" />;
        
        const extension = file.name.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf': return <BsFiletypePdf className="text-4xl text-red-500" />;
            case 'doc': return <BsFiletypeDoc className="text-4xl text-blue-500" />;
            case 'docx': return <BsFiletypeDocx className="text-4xl text-blue-600" />;
            default: return <RiFileTextLine className="text-4xl text-gray-500" />;
        }
    };

    const upload = async () => {
        if (!file || !fileName.trim()) {
            notifyResponse({ 
                success: false, 
                detail: "Please provide both a file and a knowledge base name" 
            });
            return;
        }

        const fileSizeMB = file.size / 1048576;
        if (fileSizeMB > 5) {
            notifyResponse({ 
                success: false, 
                detail: "File size must be less than 5MB. Please compress your file." 
            });
            return;
        }

        setIsUploading(true);
        if (onStart) onStart();

        const data = new FormData();
        data.append("file", file);
        data.append("name", fileName.trim());

        try {
            const response = await backendRequest("POST", "/documents", data, {}, true);
            notifyResponse(response);
            if (response.success && onSuccess) {
                onSuccess(response);
                navigate("/documents");
                resetFileSelection();
            }
        } catch (error) {
            console.error("Upload error:", error);
            notifyResponse({ 
                success: false, 
                detail: "Upload failed. Please try again." 
            });
        } finally {
            setIsUploading(false);
        }
    };

    const InstructionsModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <MdOutlineTipsAndUpdates className="text-2xl text-primary" />
                            <h2 className="text-xl font-semibold text-gray-900">Knowledge Base Guidelines</h2>
                        </div>
                        <button
                            onClick={() => setShowInstructions(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <AiOutlineCloseCircle className="text-2xl" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* File Size Warning */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AiOutlineWarning className="text-xl text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-yellow-800 mb-1">File Size Recommendations</h3>
                                <ul className="text-yellow-700 text-sm space-y-1">
                                    <li>• <strong>Maximum limit:</strong> 5MB per file</li>
                                    <li>• <strong>Recommended:</strong> Less than 1MB for optimal performance</li>
                                    <li>• Larger files may take longer to process and affect response times</li>
                                    <li>• Split large documents into multiple focused knowledge bases</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Purpose Section */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <h3 className="flex items-center gap-2 font-semibold text-blue-800 mb-2">
                            <MdOutlineDescription className="text-lg" />
                            Purpose of Knowledge Base
                        </h3>
                        <p className="text-blue-700">
                            Upload documents that contain information you want your AI assistant to reference during conversations. 
                            The assistant will use this knowledge to provide accurate, context-aware responses.
                        </p>
                    </div>

                    {/* Requirements */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">📋 Requirements</h3>
                        <ul className="space-y-2 text-gray-700">
                            <li className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                <span><strong>File Size:</strong> Maximum 5MB per document (Recommended: under 1MB)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                <span><strong>Format:</strong> Plain text documents work best (PDF, DOC, DOCX, TXT)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                <span><strong>Content:</strong> Clear, structured information with proper headings</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                <span><strong>Quality:</strong> Avoid scanned documents or images of text</span>
                            </li>
                        </ul>
                    </div>

                    {/* Best Practices */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">🎯 Best Practices</h3>
                        <ul className="space-y-2 text-gray-700">
                            <li className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                <span>Use clear section headings and bullet points</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                <span>Keep information concise and well-organized</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                <span>Update knowledge bases regularly for accuracy</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                <span>For large documents, split into multiple focused files under 1MB each</span>
                            </li>
                        </ul>
                    </div>

                    {/* Example */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">📄 Example: Medical Treatment Guidelines</h3>
                        <div className="space-y-3 text-gray-700">
                            <p><strong>Document Content (Recommended: 200-500KB):</strong></p>
                            <div className="bg-white border border-gray-200 rounded p-4 font-mono text-sm">
                                <div className="text-primary font-semibold"># TREATMENT PROTOCOLS</div>
                                <div className="ml-4 mt-2">
                                    <div className="font-semibold">• Common Cold Treatment:</div>
                                    <div className="ml-4">- Rest and hydration are primary recommendations</div>
                                    <div className="ml-4">- Over-the-counter medication: Acetaminophen for fever</div>
                                    <div className="ml-4">- Duration: Symptoms typically resolve in 7-10 days</div>
                                </div>
                                <div className="text-xs text-gray-500 mt-3">
                                    Document size: ~45KB (Recommended size range)
                                </div>
                            </div>
                            <p><strong>System Prompt Enhancement:</strong></p>
                            <div className="bg-gray-900 text-gray-100 rounded p-4 font-mono text-sm">
                                <span className="text-green-400">"You are a medical information assistant. </span><br/>
                                <span className="text-green-400">Reference the uploaded treatment guidelines document </span><br/>
                                <span className="text-green-400">when answering questions about medical protocols."</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Tips */}
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <h3 className="flex items-center gap-2 font-semibold text-primary mb-2">
                            <FiExternalLink />
                            Quick Tips for Better Results
                        </h3>
                        <ul className="text-gray-700 space-y-1">
                            <li>• <strong>Keep files under 1MB</strong> for faster processing and better performance</li>
                            <li>• Name your knowledge base descriptively (e.g., "Product-FAQ-2024")</li>
                            <li>• Test with sample questions after uploading</li>
                            <li>• Combine with a well-crafted system prompt for best results</li>
                            <li>• Monitor assistant responses and update knowledge as needed</li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
                    <button
                        onClick={() => setShowInstructions(false)}
                        className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors"
                    >
                        Got It, Let's Upload
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Knowledge Base</h1>
                    <p className="text-gray-600">Add documents that your AI assistant can reference during conversations</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Quick Guidelines Banner */}
                    <div className="bg-primary/5 border-b border-primary/10 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <AiOutlineInfoCircle className="text-xl text-primary" />
                                <div>
                                    <h3 className="font-medium text-gray-900">Important Guidelines</h3>
                                    <p className="text-sm text-gray-600">Max 5MB • Recommended: under 1MB • Plain text recommended</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowInstructions(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                            >
                                <FiExternalLink />
                                Full Instructions
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="p-6 md:p-8">
                        {/* File Upload Area */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Document
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,.txt"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className={`flex flex-col items-center justify-center w-full p-10 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                                        fileUploaded
                                            ? 'border-green-500 bg-green-50/50'
                                            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="mb-4">
                                        {fileUploaded ? (
                                            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                                                <FcCheckmark className="text-3xl" />
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
                                                <TbUpload className="text-3xl text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-center mb-2">
                                        {fileUploaded && file ? (
                                            <>
                                                <div className="flex items-center justify-center gap-2 mb-1">
                                                    {getFileIcon()}
                                                    <span className="font-medium text-gray-900">{file.name}</span>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {(file.size / 1048576).toFixed(2)} MB
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <p className="font-medium text-gray-900 mb-1">Click to select a file</p>
                                                <p className="text-sm text-gray-500">
                                                    Supports PDF, DOC, DOCX, TXT • Max 5MB
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    {fileUploaded && file && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                resetFileSelection();
                                            }}
                                            className="mt-3 text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                                        >
                                            <AiOutlineCloseCircle />
                                            Remove file
                                        </button>
                                    )}
                                </label>
                            </div>
                            
                            {/* Size Warning Message */}
                            {sizeWarning && (
                                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <AiOutlineWarning className="text-yellow-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-yellow-800">
                                            {sizeWarning}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Knowledge Base Name */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Knowledge Base Name
                                </label>
                                <span className="text-xs text-gray-500">Required</span>
                            </div>
                            <input
                                type="text"
                                value={fileName}
                                onChange={(e) => setFileName(e.target.value)}
                                placeholder="e.g., Product FAQ, Support Guidelines, Company Policies"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                Choose a descriptive name for easy identification
                            </p>
                        </div>

                        {/* Upload Button */}
                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <button
                                onClick={upload}
                                disabled={!file || !fileName.trim() || isUploading}
                                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                                    !file || !fileName.trim() || isUploading
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow'
                                }`}
                            >
                                {isUploading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Uploading...
                                    </div>
                                ) : (
                                    'Upload Knowledge Base'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Tips */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600 font-bold">1</span>
                            </div>
                            <h4 className="font-medium text-gray-900">File Size</h4>
                        </div>
                        <p className="text-sm text-gray-600">
                            <strong>Max:</strong> 5MB • <strong>Recommended:</strong> Under 1MB for better performance
                        </p>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <span className="text-primary font-bold">2</span>
                            </div>
                            <h4 className="font-medium text-gray-900">Format & Content</h4>
                        </div>
                        <p className="text-sm text-gray-600">
                            Plain text documents (PDF, DOC, DOCX) with clear structure work best
                        </p>
                    </div>

                    <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-green-600 font-bold">3</span>
                            </div>
                            <h4 className="font-medium text-gray-900">Usage</h4>
                        </div>
                        <p className="text-sm text-gray-600">
                            Combine with clear system prompts. Test with sample questions after upload
                        </p>
                    </div>
                </div>
            </div>

            {/* Instructions Modal */}
            {showInstructions && <InstructionsModal />}
        </>
    );
};