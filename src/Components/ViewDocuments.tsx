import { useEffect, useState } from "react";
import { backendRequest } from "../Helpers/backendRequest";
import { RiDeleteBin6Line, RiFileTextLine } from "react-icons/ri";
import { MdOutlineFileUpload } from "react-icons/md";
import { FiFileText } from "react-icons/fi";
import { BsFiletypePdf, BsFiletypeDoc, BsFiletypeDocx, BsFiletypeTxt } from "react-icons/bs";
import { notifyResponse } from "../Helpers/notyf";
import ConfirmationModal from "./ConfirmationModal";
import { useNavigate } from "react-router-dom";

interface Document {
    id: number;
    file_name: string;
    vapi_file_id: string;
}

export const ViewDocuments = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const navigate = useNavigate();

    const fetchDocuments = async () => {
        try {
            const response = await backendRequest<Document[], []>("GET", "/vapi_docs");
            setDocuments(response || []);
        } catch (error) {
            console.error("Fetch documents error:", error);
        }
    };

    const confirmDeleteDocument = (id: string, fileName: string) => {
        setDocumentToDelete(id);
        setShowModal(true);
    };

    const deleteDocument = async () => {
        if (!documentToDelete) {
            setShowModal(false);
            return notifyResponse({ success: false, detail: "File not found" });
        }
        
        setIsDeleting(true);
        try {
            const response = await backendRequest("DELETE", `/delete_vapi_doc/${documentToDelete}`);
            notifyResponse(response);
            if (response.success) {
                fetchDocuments();
            }
        } catch (error) {
            console.error("Delete error:", error);
        } finally {
            setIsDeleting(false);
            setShowModal(false);
            setDocumentToDelete(null);
        }
    };

    const uploadFile = () => {
        navigate("/documents/upload");
    };

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf': return <BsFiletypePdf className="w-5 h-5 text-red-500" />;
            case 'doc': return <BsFiletypeDoc className="w-5 h-5 text-blue-500" />;
            case 'docx': return <BsFiletypeDocx className="w-5 h-5 text-blue-600" />;
            case 'txt': return <BsFiletypeTxt className="w-5 h-5 text-gray-500" />;
            default: return <FiFileText className="w-5 h-5 text-gray-400" />;
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
                        <p className="text-gray-600 mt-1">Manage documents that your AI assistant can reference</p>
                    </div>
                    
                    <button
                        onClick={uploadFile}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                        <MdOutlineFileUpload className="w-5 h-5" />
                        Upload Document
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-sm text-gray-600">Total Documents</div>
                        <div className="text-2xl font-semibold text-gray-900">{documents.length}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-sm text-gray-600">Knowledge Bases</div>
                        <div className="text-2xl font-semibold text-primary">{documents.length}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-sm text-gray-600">Storage</div>
                        <div className="text-2xl font-semibold text-gray-900">Active</div>
                    </div>
                </div>
            </div>

            {/* Documents List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* List Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900">Documents ({documents.length})</h2>
                        <span className="text-sm text-gray-500">Click to delete</span>
                    </div>
                </div>

                {/* Documents */}
                <div className="divide-y divide-gray-100">
                    {documents.length > 0 ? (
                        documents.map((doc) => (
                            <div 
                                key={doc.id} 
                                className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                                            {getFileIcon(doc.file_name)}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">
                                                {doc.file_name}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                Knowledge Base ID: {doc.vapi_file_id.slice(0, 8)}...
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={() => confirmDeleteDocument(doc.vapi_file_id, doc.file_name)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                        title="Delete document"
                                    >
                                        <RiDeleteBin6Line className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        /* Empty State */
                        <div className="px-6 py-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <RiFileTextLine className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
                            <p className="text-gray-500 mb-6">Upload your first knowledge base document</p>
                            <button
                                onClick={uploadFile}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                            >
                                <MdOutlineFileUpload className="w-5 h-5" />
                                Upload First Document
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={deleteDocument}
                message="Are you sure you want to delete this document? This action cannot be undone."
                confirmText={isDeleting ? "Deleting..." : "Delete"}
                cancelText="Cancel"
                isProcessing={isDeleting}
                type="danger"
            />
        </div>
    );
};