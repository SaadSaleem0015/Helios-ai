import { useState, FormEvent } from "react";
import { Input } from "../Components/Input";
import { Anchor } from "../Components/Anchor";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaArrowRight, FaPhone } from "react-icons/fa";
import { backendRequest } from "../Helpers/backendRequest";
import { notifyResponse } from "../Helpers/notyf";

export function Signup() {
    const [loading, setLoading] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false);  
    const [phoneError, setPhoneError] = useState<string>("");
    const navigate = useNavigate();
    
    // Dynamic year
    const currentYear = new Date().getFullYear();

    function validatePhone(phone: string): boolean {
        // Remove common separators (spaces, hyphens, parentheses)
        const cleaned = phone.replace(/[\s\-\(\)]+/g, '');
        
        // Check if it's international format (starts with +)
        if (cleaned.startsWith('+')) {
            // International format: + followed by 8-15 digits
            const isValid = /^\+\d{8,15}$/.test(cleaned);
            if (!isValid) {
                setPhoneError("International phone number must have + followed by 8-15 digits");
                return false;
            }
        } else {
            // Local format: 10-15 digits
            const isValid = /^\d{10,15}$/.test(cleaned);
            if (!isValid) {
                setPhoneError("Phone number must contain 10-15 digits");
                return false;
            }
        }
        
        setPhoneError("");
        return true;
    }

    async function login(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const form = e.currentTarget;
        const formData = new FormData(form);
        const data: Record<string, string> = {};

        const firstName = formData.get("first_name")?.toString();
        const lastName = formData.get("last_name")?.toString();
        const email = formData.get("email")?.toString();
        const password = formData.get("password")?.toString();
        const phone = formData.get("phone")?.toString();

        // Validate phone before sending to backend
        if (phone && !validatePhone(phone)) {
            setLoading(false);
            return;
        }

        if (firstName && lastName && email && password && phone) {
            data.name = `${firstName} ${lastName}`;
            data.email = email;
            data.password = password;
            data.phone = phone;
        } else {
            console.error("Missing required fields");
            setLoading(false);
            return;
        }

        try {
            const response = await backendRequest("POST", "/signup", data);
            
            // Check if response has validation errors array
            if (response && 'detail' in response && Array.isArray(response.detail)) {
                const validationErrors = response.detail.map((err: any) => {
                    if (err.loc && err.msg) {
                        const field = err.loc[err.loc.length - 1];
                        return `${field}: ${err.msg}`;
                    }
                    return err.msg || "Validation error";
                });
                // Show the first validation error
                if (validationErrors.length > 0) {
                    notifyResponse({ success: false, detail: validationErrors[0] });
                }
            } else {
                notifyResponse(response);
            }

            if (response.success) {
                localStorage.setItem("signupEmail", data.email);
                navigate(`/activate-account?email=${btoa(data.email)!.toString()}`); 
                form.reset(); 
            }
        } catch (error) {
            console.error("Error during signup:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-amber-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="mb-4">
                        <img src="/logo.jpeg" alt="Helios AI Logo" className="h-16 mx-auto" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Create Your Account
                    </h1>
                    <p className="text-gray-600 text-sm">Get started with The Helios AI today</p>
                </div>

                {/* Signup Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <form onSubmit={login} className="space-y-4">
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    First Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaUser className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <Input
                                        type="text"
                                        name="first_name"
                                        placeholder="First"
                                        autoComplete="given-name"
                                        className="w-full pl-10 pr-3 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Last Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaUser className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <Input
                                        type="text"
                                        name="last_name"
                                        placeholder="Last"
                                        autoComplete="family-name"
                                        className="w-full pl-10 pr-3 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

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
                                    autoComplete="email"
                                    className="w-full pl-10 pr-3 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                                    required
                                />
                            </div>
                        </div>

                        {/* Phone Number Field */}
                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaPhone className="h-4 w-4 text-gray-400" />
                                </div>
                                <Input
                                    type="tel"
                                    name="phone"
                                    placeholder="+1 (555) 000-9999"
                                    autoComplete="tel"
                                    className={`w-full pl-10 pr-3 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ${
                                        phoneError ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    onChange={(e) => {
                                        // Clear error when user types
                                        if (phoneError) setPhoneError("");
                                    }}
                                    onBlur={(e) => validatePhone(e.target.value)}
                                    required
                                />
                            </div>
                            {phoneError && (
                                <p className="text-xs text-red-500 mt-1">{phoneError}</p>
                            )}
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
                                    autoComplete="new-password"
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

                        {/* Terms and Conditions */}
                        <div className="flex items-start space-x-2 p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center h-4">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={agreedToTerms}
                                    onChange={() => setAgreedToTerms(!agreedToTerms)} 
                                    className="w-3.5 h-3.5 text-primary focus:ring-primary border-gray-300 rounded transition-colors"
                                    required
                                />
                            </div>
                            <label htmlFor="terms" className="text-xs text-gray-600 leading-tight">
                                I agree to the{" "}
                                <Link
                                    to="/terms-and-conditions"
                                    className="text-primary hover:text-primary-dark font-medium hover:underline"
                                >
                                    Terms & Conditions
                                </Link>
                                {" "}and{" "}
                                <Link
                                    to="/privacy-policy"
                                    className="text-primary hover:text-primary-dark font-medium hover:underline"
                                >
                                    Privacy Policy
                                </Link>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !agreedToTerms || !!phoneError}
                            className={`w-full py-3 px-4 bg-primary text-white rounded-xl font-medium text-sm transition-all duration-200 hover:bg-primary-dark ${
                                loading || !agreedToTerms || phoneError
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : 'hover:shadow-md'
                            }`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Creating account...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    Create Account
                                    <FaArrowRight className="w-3 h-3" />
                                </div>
                            )}
                        </button>
                    </form>

                    {/* Sign In Link */}
                    <div className="mt-5 pt-4 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-600">
                            Already have an account?{' '}
                            <Anchor 
                                to="/login" 
                                className="text-primary hover:text-primary-dark font-medium hover:underline"
                            >
                                Sign in
                            </Anchor>
                        </p>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="text-center mt-4 space-x-4">
                    <Link 
                        to="/terms-and-conditions" 
                        className="text-xs text-gray-500 hover:text-primary transition-colors"
                    >
                        Terms
                    </Link>
                    <span className="text-xs text-gray-300">•</span>
                    <Link 
                        to="/privacy-policy" 
                        className="text-xs text-gray-500 hover:text-primary transition-colors"
                    >
                        Privacy
                    </Link>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-500">
                        © {currentYear}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default Signup;