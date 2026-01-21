import { useState, FormEvent } from "react";
import { Input } from "../Components/Input";
import { backendRequest } from "../Helpers/backendRequest";
import { Anchor } from "../Components/Anchor";
import { useNavigate } from "react-router-dom";
import { notifyResponse } from "../Helpers/notyf";
import { Checkbox } from "../Components/Checkbox";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';

export function Login() {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); 
    const navigate = useNavigate();

    async function login(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
    
        const data = new FormData(e.currentTarget);
        const response = await backendRequest<{ success: boolean, token: string, verified: boolean, showPopup: boolean, user_role?: string, email?: string, change_password_on_login?: boolean }>("POST", "/login", data);
    
        if (response.success) {
            if (!response.verified) {
                notifyResponse(response);
                navigate(`/activate-account?email=${btoa(data.get("email")!.toString())}`);
            } else {
                localStorage.setItem('role', response.user.type || '');
                localStorage.setItem('email', response.user.email || '');
                localStorage.setItem('token', response.token);
                localStorage.setItem('showPopup', String(response.showPopup));

                if (response.user.type === "admin") {
                    navigate("/admin/dashboard");
                } else {
                    navigate("/dashboard");
                }
            }
        } else {
            notifyResponse(response);
        }
    
        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-amber-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="mb-4">
                        <img src="/logo.jpeg" alt="VanillaVoice Logo" className="h-16 mx-auto" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-600 text-sm">Sign in to your account</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <form onSubmit={login} className="space-y-4">
                        {/* Email Field */}
                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
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

                        {/* Password Field */}
                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="h-4 w-4 text-gray-400" />
                                </div>
                                <Input
                                    type={showPassword ? "text" : "password"} 
                                    name="password"
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-10 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200" 
                                    required
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />} 
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="remember_me"
                                    name="remember_me"
                                    className="w-3.5 h-3.5"
                                />
                                <label htmlFor="remember_me" className="text-xs text-gray-600">
                                    Remember me
                                </label>
                            </div>
                            <Anchor 
                                to="/forget-password" 
                                className="text-xs text-primary hover:text-primary-dark font-medium hover:underline"
                            >
                                Forgot password?
                            </Anchor>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit"
                            className={`w-full py-3 px-4 bg-primary text-white rounded-xl font-medium text-sm transition-all duration-200 hover:bg-primary-dark ${
                                loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                            }`}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Signing in...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    Sign In
                                    <FaArrowRight className="w-3 h-3" />
                                </div>
                            )}
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <div className="mt-5 pt-4 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-600">
                            Don't have an account?{' '}
                            <Anchor 
                                to="/signup" 
                                className="text-primary hover:text-primary-dark font-medium hover:underline"
                            >
                                Create account
                            </Anchor>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-4">
                    <p className="text-xs text-gray-500">
                        © 2025 VanillaVoice AI. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}