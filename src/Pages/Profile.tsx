import { TbUser, TbMail, TbLock, TbCheck, TbPencil, TbArrowLeft, TbHelp } from "react-icons/tb";
import { backendRequest } from "../Helpers/backendRequest";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { notifyResponse } from "../Helpers/notyf";
import { Loading } from "../Components/Loading";
import { Link, useNavigate } from "react-router-dom";

export function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    created_at: "",

  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState({
    name: false,
    email: false,
    password: false,
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const navigate = useNavigate();

  async function fetchProfile() {
    setLoading(true);
    try {
      const fetchedData = await backendRequest("GET", "/profile");
      setProfile(prev => ({
        ...prev,
        name: fetchedData.name || "",
        email: fetchedData.email || "",
        created_at : fetchedData.created_at || ""
      }));
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
  }

  function togglePasswordVisibility(field: keyof typeof showPassword) {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  }

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    
    // Validate passwords match
    if (editMode.password && profile.newPassword !== profile.confirmPassword) {
      notifyResponse({ success: false, message: "New passwords do not match" });
      setSaving(false);
      return;
    }

    // Validate password requirements
    if (editMode.password && profile.newPassword && profile.newPassword.length < 8) {
      notifyResponse({ success: false, message: "Password must be at least 8 characters" });
      setSaving(false);
      return;
    }

    const payload = {
      name: profile.name,
      email: profile.email,
      ...(editMode.password && {
        currentPassword: profile.currentPassword,
        newPassword: profile.newPassword
      })
    };

    try {
      const response = await backendRequest("PUT", "/update-profile", payload);
      notifyResponse(response);

      if (response.success) {
        // Reset password fields and exit edit modes
        setProfile(prev => ({ 
          ...prev, 
          currentPassword: "", 
          newPassword: "", 
          confirmPassword: "" 
        }));
        setEditMode({ name: false, email: false, password: false });
        fetchProfile();
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
    setSaving(false);
  }

  function handleForgotPassword() {
    navigate("/forget-password");
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  const formatDate = (dateString: string) => {
    console.log("----------",dateString)
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
  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-amber-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to="/dashboard" 
                className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
              >
                <TbArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back to Dashboard</span>
              </Link>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Profile Settings</h1>
            </div>
            <div className="w-24"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Profile</h1>
            <p className="text-gray-600">Manage your personal information and account security</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - User Avatar & Info */}
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
                      <span className="text-sm text-gray-600">Member Since</span>
                      {formatDate(profile.created_at)}

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
                  <p className="text-gray-600 text-sm">Update your personal information and password</p>
                </div>

                <form onSubmit={save} className="space-y-6">
                  {/* Personal Information Section */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                      
                      {/* Name Field */}
                      <div className="space-y-2 mb-4">
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
                    </div>

                    {/* Password Change Section */}
                    <div className="pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                        <button
                          type="button"
                          onClick={() => toggleEdit("password")}
                          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                            editMode.password 
                              ? "bg-green-50 text-green-600" 
                              : "bg-primary text-white hover:bg-primary-dark"
                          }`}
                        >
                          {editMode.password ? (
                            <>
                              <TbCheck className="w-4 h-4" />
                              Cancel Change
                            </>
                          ) : (
                            <>
                              <TbLock className="w-4 h-4" />
                              Change Password
                            </>
                          )}
                        </button>
                      </div>
                      
                      {editMode.password && (
                        <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
                          {/* Current Password */}
                          <div className="space-y-2">
                            <label className="flex items-center justify-between text-sm font-medium text-gray-700">
                              <span className="flex items-center gap-2">
                                <TbLock className="w-4 h-4" />
                                Current Password
                              </span>
                              <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark"
                              >
                                <TbHelp className="w-3 h-3" />
                                Forgot password?
                              </button>
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword.current ? "text" : "password"}
                                value={profile.currentPassword}
                                onChange={handleChange}
                                name="currentPassword"
                                className="w-full pl-10 pr-12 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Enter your current password"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility("current")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showPassword.current ? "Hide" : "Show"}
                              </button>
                            </div>
                          </div>

                          {/* New Password */}
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <TbLock className="w-4 h-4" />
                              New Password
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword.new ? "text" : "password"}
                                value={profile.newPassword}
                                onChange={handleChange}
                                name="newPassword"
                                className="w-full pl-10 pr-12 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Enter new password (min. 8 characters)"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility("new")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showPassword.new ? "Hide" : "Show"}
                              </button>
                            </div>
                          </div>

                          {/* Confirm New Password */}
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <TbLock className="w-4 h-4" />
                              Confirm New Password
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword.confirm ? "text" : "password"}
                                value={profile.confirmPassword}
                                onChange={handleChange}
                                name="confirmPassword"
                                className="w-full pl-10 pr-12 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Confirm your new password"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility("confirm")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showPassword.confirm ? "Hide" : "Show"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
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