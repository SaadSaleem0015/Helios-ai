import { FormateTime } from "../../Helpers/formateTime";

interface ZohoLead {
  Converted_Date_Time?: string;
  Email?: string;
  Last_Name?: string;
  Phone?: string;
  Record_Status__s?: string;
  [key: string]: unknown;
}

interface ZohoLeadsTableProps {
  leads: ZohoLead[];
  isZohoConnected: boolean;
  selectedLeads: Set<number>;
  onToggleSelect: (index: number) => void;
  onSelectAll: () => void;
}

export function ZohoLeadsTable({
  leads,
  isZohoConnected,
  selectedLeads,
  onToggleSelect,
  onSelectAll,
}: ZohoLeadsTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 via-gray-50 to-gray-100">
            <tr>
              {isZohoConnected && (
                <th scope="col" className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedLeads.size === leads.length && leads.length > 0}
                    onChange={onSelectAll}
                    className="w-4 h-4 text-primary border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
                  />
                </th>
              )}
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Lead Name
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Phone
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Converted Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.length > 0 ? (
              leads.map((lead, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  {isZohoConnected && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedLeads.has(index)}
                        onChange={() => onToggleSelect(index)}
                        className="w-4 h-4 text-primary border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                        <span className="text-sm font-bold text-white">
                          {lead.Last_Name?.[0]?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {lead.Last_Name || "N/A"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 flex items-center gap-2">
                      {lead.Email ? (
                        <>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{lead.Email}</span>
                        </>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 flex items-center gap-2">
                      {lead.Phone ? (
                        <>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{lead.Phone}</span>
                        </>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lead.Record_Status__s ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                        {lead.Record_Status__s}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm font-medium">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {lead.Converted_Date_Time ? FormateTime(lead.Converted_Date_Time) : "N/A"}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isZohoConnected ? 6 : 5} className="px-6 py-16">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 3.747a8 8 0 00-15 0" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads found</h3>
                    <p className="text-gray-500 text-sm">
                      {isZohoConnected
                        ? "Click 'Fetch Leads' to retrieve leads from your Zoho CRM"
                        : "Please integrate Zoho CRM to fetch leads"}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

