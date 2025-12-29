import { TbPencil, TbUser, TbMail, TbLock, TbCheck, TbX, TbArrowLeft } from "react-icons/tb";
import { backendRequest } from "../../Helpers/backendRequest";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { notifyResponse } from "../../Helpers/notyf";
import { Loading } from "../../Components/Loading";
import { Link } from "react-router-dom";

export function AdminProfile() {
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        password: "",
        created_at: "",
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState({
        name: false,
        email: false,
        password: false,
    });
    const [showPassword, setShowPassword] = useState(false);

    async function fetchProfile() {
        setLoading(true);
        try {
            const fetchedData = await backendRequest("GET", "/admin_profile");
            setProfile(fetchedData);
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        }
        setLoading(false);
    }

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        setProfile((oldData) => ({ ...oldData, [e.target.name]: e.target.value }));
    }

    function toggleEdit(field: keyof typeof editMode) {
        setEditMode(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
        
        // Clear password field when cancelling
        if (field === "password" && editMode.password) {
            setProfile(prev => ({ ...prev, password: "" }));
        }
    }

    async function save(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        
        const payload = {
            name: profile.name,
            email: profile.email,
            ...(editMode.password && profile.password && { password: profile.password })
        };

        try {
            const response = await backendRequest("PUT", "/admin_profile", payload);
            notifyResponse(response);

            if (response.success) {
                // Reset edit modes and clear password field
                setEditMode({ name: false, email: false, password: false });
                setProfile(prev => ({ ...prev, password: "" }));
                fetchProfile();
            }
        } catch (error) {
            console.error("Failed to update profile:", error);
        }
        setSaving(false);
    }

    // Format date for display
    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return "N/A";
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-amber-50">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link 
                                to="/admin/dashboard" 
                                className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                            >
                                <TbArrowLeft className="w-5 h-5" />
                                <span className="text-sm font-medium">Back to Dashboard</span>
                            </Link>
                        </div>
                    
                        <div className="w-24"></div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Super Admin Profile</h1>
                        <p className="text-gray-600">Manage your administrative account settings</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Admin Info */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                <div className="flex flex-col items-center">
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-primary to-primary-dark flex items-center justify-center mb-4 shadow-lg">
                                        <TbUser className="w-16 h-16 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 text-center">{profile.name}</h2>
                                    <p className="text-gray-600 text-center mt-1">{profile.email}</p>
                                    
                                    <div className="mt-6 w-full space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <span className="text-sm text-gray-600">Role</span>
                                            <span className="text-sm font-medium text-primary">Super Admin</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <span className="text-sm text-gray-600">Member Since</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {formatDate(profile.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Profile Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">Edit Profile</h2>
                                    <p className="text-gray-600 text-sm">Update your administrative account information</p>
                                </div>

                                <form onSubmit={save} className="space-y-6">
                                    {/* Name Field */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <TbUser className="w-4 h-4" />
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <input
                                                value={profile.name}
                                                onChange={handleChange}
                                                name="name"
                                                disabled={!editMode.name}
                                                className={`w-full pl-10 pr-12 py-3 text-sm border rounded-xl transition-all duration-200 ${
                                                    editMode.name 
                                                        ? "border-primary focus:ring-2 focus:ring-primary focus:border-transparent bg-white" 
                                                        : "border-gray-300 bg-gray-50"
                                                }`}
                                                placeholder="Enter your full name"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => toggleEdit("name")}
                                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                                                    editMode.name 
                                                        ? "text-green-600 bg-green-50" 
                                                        : "text-gray-400 hover:text-primary hover:bg-gray-100"
                                                }`}
                                            >
                                                {editMode.name ? <TbCheck className="w-4 h-4" /> : <TbPencil className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Email Field */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <TbMail className="w-4 h-4" />
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={profile.email}
                                                onChange={handleChange}
                                                name="email"
                                                disabled={!editMode.email}
                                                className={`w-full pl-10 pr-12 py-3 text-sm border rounded-xl transition-all duration-200 ${
                                                    editMode.email 
                                                        ? "border-primary focus:ring-2 focus:ring-primary focus:border-transparent bg-white" 
                                                        : "border-gray-300 bg-gray-50"
                                                }`}
                                                placeholder="Enter your email address"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => toggleEdit("email")}
                                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                                                    editMode.email 
                                                        ? "text-green-600 bg-green-50" 
                                                        : "text-gray-400 hover:text-primary hover:bg-gray-100"
                                                }`}
                                            >
                                                {editMode.email ? <TbCheck className="w-4 h-4" /> : <TbPencil className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Password Field */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <TbLock className="w-4 h-4" />
                                            Change Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={profile.password}
                                                onChange={handleChange}
                                                name="password"
                                                disabled={!editMode.password}
                                                className={`w-full pl-10 pr-12 py-3 text-sm border rounded-xl transition-all duration-200 ${
                                                    editMode.password 
                                                        ? "border-primary focus:ring-2 focus:ring-primary focus:border-transparent bg-white" 
                                                        : "border-gray-300 bg-gray-50"
                                                }`}
                                                placeholder="Enter new password"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                {editMode.password && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="text-gray-400 hover:text-gray-600 p-1"
                                                    >
                                                        {showPassword ? "Hide" : "Show"}
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleEdit("password")}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        editMode.password 
                                                            ? "text-green-600 bg-green-50" 
                                                            : "text-gray-400 hover:text-primary hover:bg-gray-100"
                                                    }`}
                                                >
                                                    {editMode.password ? <TbCheck className="w-4 h-4" /> : <TbPencil className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        {editMode.password && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Enter new password to change. Leave empty to keep current password.
                                            </p>
                                        )}
                                    </div>

                                    {/* Save Button */}
                                    <div className="pt-6 border-t border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    {editMode.name || editMode.email || editMode.password 
                                                        ? "You have unsaved changes" 
                                                        : "All changes are saved"}
                                                </p>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={saving || (!editMode.name && !editMode.email && !editMode.password)}
                                                className={`px-6 py-3 bg-primary text-white rounded-xl font-medium text-sm transition-all duration-200 hover:bg-primary-dark ${
                                                    saving || (!editMode.name && !editMode.email && !editMode.password)
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : "hover:shadow-md"
                                                }`}
                                            >
                                                {saving ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        Saving...
                                                    </div>
                                                ) : (
                                                    "Save Changes"
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}