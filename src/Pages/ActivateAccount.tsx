import { useState, FormEvent, useMemo } from "react";
import { Input } from "../Components/Input";
import { backendRequest } from "../Helpers/backendRequest";
import { useNavigate, useSearchParams } from "react-router-dom";
import { notifyResponse } from "../Helpers/notyf";
import { FaCheckCircle, FaEnvelope, FaArrowRight } from "react-icons/fa";

export function ActivateAccount() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    
    // Get dynamic current year
    const currentYear = new Date().getFullYear();
    
    const email = useMemo(() => {
        const encodedEmail = searchParams.get("email");
        return encodedEmail ? atob(encodedEmail) : "";
    }, [searchParams]);

    async function activateAccount(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const data = new FormData(e.currentTarget);
        data.append("email", email);
        const response = await backendRequest<{ success: boolean, token: string , role:string}>("POST", "/activate", data);
        notifyResponse(response);
        if (response.success){
            localStorage.setItem('token', response.token);
            localStorage.setItem('role', response.role);
            navigate("/dashboard");
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-amber-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-6">
                    <img src="/logo.png" alt="VanillaVoice Logo" className="h-16 mx-auto mb-4" />
                </div>

                {/* Activation Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                            <FaCheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Verify Your Account</h2>
                        <p className="text-sm text-gray-600 mb-3">Check your email for the activation code</p>
                        <div className="inline-flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                            <FaEnvelope className="w-4 h-4 text-primary" />
                            <p className="text-xs font-medium text-gray-700">{email}</p>
                        </div>
                    </div>

                    <form onSubmit={activateAccount} className="space-y-4">
                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Activation Code</label>
                            <Input
                                name="code"
                                placeholder="Enter 6-digit code"
                                className="w-full px-4 py-3 text-center border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm tracking-widest"
                                required
                                maxLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-4 bg-primary text-white rounded-xl font-medium text-sm transition-all duration-200 hover:bg-primary-dark ${
                                loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                            }`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Verifying...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    Verify Account
                                    <FaArrowRight className="w-3 h-3" />
                                </div>
                            )}
                        </button>
                    </form>

                    <div className="mt-5 pt-4 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-500 mb-2">
                            Didn't receive the code? Check spam folder.
                        </p>
                        <button 
                            className="text-xs text-primary hover:text-primary-dark font-medium hover:underline transition-colors"
                            onClick={() => window.location.reload()}
                        >
                            Request new code
                        </button>
                    </div>
                </div>

                {/* Footer with dynamic year */}
                <div className="text-center mt-4">
                    <p className="text-xs text-gray-500">
                        © {currentYear} VanillaVoice AI. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}