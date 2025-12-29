import { useEffect, useMemo, useState } from "react";
import { Card } from "../../Components/Card";
import { backendRequest } from "../../Helpers/backendRequest";
import { Loading } from "../../Components/Loading";
import { useSearchParams } from "react-router-dom";
import { filterAndPaginate } from "../../Helpers/filterAndPaginate";
import { FaSearch, FaExclamationTriangle, FaPhone, FaUser, FaEnvelope, FaBuilding, FaUndo, FaTimes } from "react-icons/fa";
import { PageNumbers } from "../../Components/PageNumbers";

interface PhoneNumber {
    phone_number: string;
    phone_sid: string | null;
    username: string | null;
    email: string | null;
    company_name: string | null;
}

interface ApiError {
    message: string;
    status?: number;
}

interface ReturnNumberResponse {
    message: string;
    success: boolean;
}

export function AdminPhoneNumbers() {
    const [searchParams] = useSearchParams();
    const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
    const [returning, setReturning] = useState(false);
    const [returnError, setReturnError] = useState<string | null>(null);

    const { filteredItems: filteredPhoneNumbers, pagesCount, pageNumbers } = useMemo(
        () => filterAndPaginate(
            phoneNumbers,
            search,
            currentPage
        ),
        [phoneNumbers, search, currentPage]
    );

    async function fetchPhoneNumbers() {
        setLoading(true);
        setError(null);
        
        try {
            const response = await backendRequest<PhoneNumber[]>("GET", "/phone_numbers");
            
            if (Array.isArray(response)) {
                setPhoneNumbers(response);
            } else {
                throw new Error("Invalid response format");
            }
        } catch (err) {
            console.error("Error fetching phone numbers:", err);
            setError({
                message: err instanceof Error ? err.message : "Failed to fetch phone numbers",
                status: err instanceof Error && 'status' in err ? (err as any).status : undefined
            });
        } finally {
            setLoading(false);
        }
    }

    const handleRetry = () => {
        fetchPhoneNumbers();
    };

    const handleReturnNumber = (phoneNumber: PhoneNumber) => {
        setSelectedNumber(phoneNumber);
        setShowReturnModal(true);
        setReturnError(null);
    };

    const confirmReturnNumber = async () => {
        if (!selectedNumber || !selectedNumber.phone_sid) return;

        setReturning(true);
        setReturnError(null);

        try {
            const response = await backendRequest<ReturnNumberResponse>("POST", `/return-phone-number/${selectedNumber.phone_sid}`);

            if (response.success) {
                await fetchPhoneNumbers();
                setShowReturnModal(false);
                setSelectedNumber(null);
            } else {
                setReturnError(response.message || "Failed to return phone number");
            }
        } catch (err) {
            console.error("Error returning phone number:", err);
            setReturnError(err instanceof Error ? err.message : "Failed to return phone number");
        } finally {
            setReturning(false);
        }
    };

    const closeReturnModal = () => {
        setShowReturnModal(false);
        setSelectedNumber(null);
        setReturnError(null);
    };





    useEffect(() => {
        fetchPhoneNumbers();
    }, [searchParams]);

    if (loading) return <Loading />;

    if (error) {
        return (
            <Card className="p-6 bg-white rounded-xl shadow-sm">
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="bg-red-100 p-4 rounded-full mb-4">
                        <FaExclamationTriangle className="text-red-600 text-2xl" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Phone Numbers</h2>
                    <p className="text-gray-600 text-center mb-6 max-w-md">
                        {error.message}
                        {error.status && ` (Status: ${error.status})`}
                    </p>
                    <button
                        onClick={handleRetry}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
                    >
                        Try Again
                    </button>
                </div>
            </Card>
        );
    }

    return (
        <div className="">
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border-0">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <FaPhone className="text-primary text-xl" />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Phone Numbers</h1>
                            <p className="text-gray-600 mt-1">
                                Manage and view all registered phone numbers
                            </p>
                        </div>
                    </div>

                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search phone numbers, users, or companies..."
                            value={search}
                            onChange={(e) => setSearch(e.currentTarget.value)}
                            className="bg-white border border-gray-200 text-gray-900 rounded-lg focus:ring-2 focus:ring-primary/70 focus:border-primary/80 focus:outline-none w-full lg:w-80 pl-11 pr-4 py-3 shadow-sm transition-all duration-200"
                        />
                    </div>
                </div>
            </Card>

            <Card className="p-6 bg-white rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                            Total: {phoneNumbers.length} phone numbers
                        </span>
                        {search && (
                            <span className="text-sm text-gray-500">
                                • Showing {filteredPhoneNumbers.length} results
                            </span>
                        )}
                    </div>
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Clear search
                        </button>
                    )}
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <FaPhone className="text-gray-400" />
                                            Phone Number
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <FaUser className="text-gray-400" />
                                            Username
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <FaEnvelope className="text-gray-400" />
                                            Email
                                        </div>
                                    </th>
                                    {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <FaBuilding className="text-gray-400" />
                                            Company
                                        </div>
                                    </th> */}
                                    {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th> */}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPhoneNumbers?.length > 0 ? (
                                    filteredPhoneNumbers.map((phone, index) => (
                                        <tr 
                                            key={phone.phone_number} 
                                            className={`hover:bg-gray-50 transition-colors duration-150 ${
                                                index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                                            }`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {phone.phone_number}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {phone.username || (
                                                        <span className="text-gray-400 italic">Not provided</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {phone.email ? (
                                                        <a 
                                                            href={`mailto:${phone.email}`}
                                                            className="text-blue-600 hover:text-blue-700 transition-colors"
                                                        >
                                                            {phone.email}
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Not provided</span>
                                                    )}
                                                </div>
                                            </td>
                                            {/* <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {phone.company_name || (
                                                        <span className="text-gray-400 italic">Not provided</span>
                                                    )}
                                                </div>
                                            </td> */}
                                            {/* <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={getStatusBadge(phone.status)}>
                                                    {phone.status}
                                                </span>
                                            </td> */}
                                            
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="bg-gray-100 p-3 rounded-full mb-4">
                                                    <FaSearch className="text-gray-400 text-xl" />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                    {search ? 'No results found' : 'No phone numbers found'}
                                                </h3>
                                                <p className="text-gray-500 max-w-md">
                                                    {search 
                                                        ? `No phone numbers match your search "${search}". Try adjusting your search terms.`
                                                        : 'No phone numbers have been registered yet.'
                                                    }
                                                </p>
                                                {search && (
                                                    <button
                                                        onClick={() => setSearch("")}
                                                        className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                                                    >
                                                        Clear search
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {filteredPhoneNumbers.length > 0 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, filteredPhoneNumbers.length)} of {filteredPhoneNumbers.length} results
                        </div>
                        <PageNumbers
                            pageNumbers={pageNumbers}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            pagesCount={pagesCount}
                            className="flex justify-center"
                        />
                    </div>
                )}
            </Card>

  
            {showReturnModal && selectedNumber && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Return Phone Number</h3>
                            <button
                                onClick={closeReturnModal}
                                className="text-gray-400 hover:text-gray-600"
                                disabled={returning}
                            >
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div className="mb-6">
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to return this phone number?
                            </p>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm font-medium text-gray-900">
                                    {selectedNumber.phone_number}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Status: <span className="font-medium">{selectedNumber.status}</span>
                                </p>
                                {selectedNumber.company_name && (
                                    <p className="text-sm text-gray-600">
                                        Company: <span className="font-medium">{selectedNumber.company_name}</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        {returnError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{returnError}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={closeReturnModal}
                                disabled={returning}
                                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmReturnNumber}
                                disabled={returning}
                                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {returning ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Returning...
                                    </>
                                ) : (
                                    <>
                                        <FaUndo />
                                        Return Number
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}