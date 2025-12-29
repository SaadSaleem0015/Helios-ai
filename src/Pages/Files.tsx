import { useEffect, useState } from "react";
import { backendRequest } from "../Helpers/backendRequest";
import { notifyResponse } from "../Helpers/notyf";
import { Loading } from "../Components/Loading";
import { TbUpload, TbFileDownload, TbDatabase, TbFileText } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { UploadFile } from "../Components/UploadFile";

export interface File {
  id: number;
  name: string;
  user_id: number;
  url: string;
  is_syncing: boolean;
  sync_enable: boolean;
  sync_frequency: number;
}

export function Files() {
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [recentFiles, setRecentFiles] = useState<File[]>([]);
  const navigate = useNavigate();

  async function fetchFiles() {
    setLoading(true);
    try {
      const response = await backendRequest<File[], []>("GET", "/files");
      if (Array.isArray(response)) {
        setFiles(response);
        // Get recent files (last 3)
        setRecentFiles(response.slice(0, 3));
      } else {
        console.error("Fetched data is not an array:", response);
        setFiles([]);
        setRecentFiles([]);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      setFiles([]);
      setRecentFiles([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFiles();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload Leads</h1>
          <p className="text-sm text-gray-600 mt-1">Upload CSV files to import leads into your account</p>
        </div>
        
        <div className="flex items-center gap-3">
          <a 
            href="/Leadfile_example.csv" 
            download="Leadfile_example.csv"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TbFileDownload className="w-4 h-4" />
            <span>Download Template</span>
          </a>
          <button
            onClick={() => navigate("/view-leads")}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            <TbDatabase className="w-4 h-4" />
            <span>View Files</span>
          </button>
        </div>
      </div>



      {/* Main Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Upload CSV File</h2>
              <p className="text-sm text-gray-600">Upload your CSV file containing leads. Ensure it follows the template format.</p>
            </div>
            
            <div className="space-y-4">
            <UploadFile onSuccess={fetchFiles} />

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h3 className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                  <TbFileText className="w-4 h-4" />
                  Requirements
                </h3>
                <ul className="text-sm text-gray-600 space-y-1 pl-6 list-disc">
                  <li>File must be in CSV format</li>
                  <li>Maximum file size: 10MB</li>
                  <li>Use the provided template for correct formatting</li>
                  <li>Supported columns: Name, Phone, Email, Company</li>
                </ul>
              </div>

              {/* Upload Component */}
            </div>
          </div>
        </div>

        {/* Recent Files & Instructions */}
        <div className="space-y-6">
          {/* Recent Files */}
          {recentFiles.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TbDatabase className="w-4 h-4" />
                Recent Files
              </h3>
              <div className="space-y-3">
                {recentFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TbFileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {file.sync_enable ? "Auto-sync enabled" : "Manual upload"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {files.length > 3 && (
                <button
                  onClick={() => navigate("/view-leads")}
                  className="w-full mt-4 text-center text-sm text-primary hover:text-primary-dark font-medium"
                >
                  View all files →
                </button>
              )}
            </div>
          )}

          {/* Quick Guide */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Guide</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-primary">1</span>
                </div>
                <p className="text-sm text-gray-600">Download and fill the CSV template</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-primary">2</span>
                </div>
                <p className="text-sm text-gray-600">Upload the file using the upload area</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-primary">3</span>
                </div>
                <p className="text-sm text-gray-600">View and manage leads from the View Files page</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}