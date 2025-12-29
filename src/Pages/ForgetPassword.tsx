import { useState, FormEvent } from "react";
import { Input } from "../Components/Input";
import { Anchor } from "../Components/Anchor";
import { backendRequest } from "../Helpers/backendRequest";
import { notifyResponse } from "../Helpers/notyf";
import { useNavigate } from "react-router-dom";
import { FaLock, FaEnvelope, FaArrowRight, FaArrowLeft, FaKey } from "react-icons/fa";

export function ForgetPassword() {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'enter_email' | 'enter_code'>('enter_email');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    
    // Dynamic year
    const currentYear = new Date().getFullYear();

    async function sendResetCode(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const data = new FormData(e.currentTarget);
        setEmail(data.get('email')!.toString());

        const response = await backendRequest("POST", "/send-reset-code", data);
        notifyResponse(response);
        if (response.success)
            setStep('enter_code');

        setLoading(false);
    }

    async function resetPassword(e: FormEvent<HTMLFormElement>) {
        setLoading(true);

        e.preventDefault();
        const data = new FormData(e.currentTarget);
        data.append("email", email);

        const response = await backendRequest("POST", "/reset-password", data);
        notifyResponse(response);

        if (response.success) navigate("/login");

        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-amber-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-6">
                    <img src="/logo.png" alt="VanillaVoice Logo" className="h-16 mx-auto mb-4" />
                </div>

                {/* Forgot Password Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                            <FaLock className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Reset Password</h2>
                        <p className="text-sm text-gray-600">
                            {step === 'enter_email' 
                                ? "Enter your email to receive a reset code"
                                : "Enter code and create new password"
                            }
                        </p>
                    </div>

                    {step === "enter_email" && (
                        <form onSubmit={sendResetCode} className="space-y-4">
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaEnvelope className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <Input
                                        type="email"
                                        name="email"
                                        placeholder="you@example.com"
                                        className="w-full pl-10 pr-3 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                                        required
                                    />
                                </div>
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
                                        Sending...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        Send Reset Code
                                        <FaArrowRight className="w-3 h-3" />
                                    </div>
                                )}
                            </button>
                        </form>
                    )}

                    {step === "enter_code" && (
                        <form onSubmit={resetPassword} className="space-y-4">
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Reset Code</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaKey className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <Input
                                        type="text"
                                        name="code"
                                        placeholder="Enter 6-digit code"
                                        className="w-full pl-10 pr-3 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                                        required
                                        maxLength={6}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1">New Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaLock className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <Input
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        className="w-full pl-10 pr-3 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                                        required
                                    />
                                </div>
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
                                        Updating...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        Reset Password
                                        <FaArrowRight className="w-3 h-3" />
                                    </div>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Back to Login */}
                    <div className="mt-5 pt-4 border-t border-gray-100 text-center">
                        <Anchor 
                            to="/login" 
                            className="text-xs text-primary hover:text-primary-dark font-medium hover:underline inline-flex items-center gap-1"
                        >
                            <FaArrowLeft className="w-3 h-3" />
                            Back to Login
                        </Anchor>
                    </div>
                </div>

                {/* Footer with dynamic year */}
                <div className="text-center mt-4">
                    <p className="text-xs text-gray-500">
                        © {currentYear} HeliosAI. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}