import { useEffect, useState } from "react"
import { Card } from "../../Components/Card"
import { Loading } from "../../Components/Loading"
import { backendRequest } from "../../Helpers/backendRequest"
import { notifyResponse } from "../../Helpers/notyf"

interface Setting {
  max_call_duration: number
  max_calls: number
  transfer_rate: number
  monthly_fee: number
  phone_number_price: number
  seconds_per_dollar: number
  call_frequency: number
  call_period_minutes: number
  max_call_limit_free_trial: number
  max_lead_limit_free_trial: number
}

export default function AdminDefaultSettings() {
  const [loading, setLoading] = useState(false)
  const [warmTransferPrice, setWarmTransferPrice] = useState<string>("")
  const [minutesPerDollar, setMinutesPerDollar] = useState<string>("")
  const [maxCallDuration, setMaxCallDuration] = useState<string>("")
  const [phoneNumberPricing, setPhoneNumberPricing] = useState<string>("")
  const [monthlyFee, setMonthlyFee] = useState<string>("")
  const [maxCalls, setMaxCalls] = useState<string>("")
  const [callFrequency, setCallFrequency] = useState<string>("")
  const [callPeriodMinutes, setCallPeriodMinutes] = useState<string>("")
  // const [maxCallLimitFreeTrial, setMaxCallLimitFreeTrial] = useState<string>("")
  // const [maxLeadLimitFreeTrial, setMaxLeadLimitFreeTrial] = useState<string>("")

  const fetchDefaultSettings = async () => {
    try {
      setLoading(true)
      const res = await backendRequest<Setting>("GET", "/get-default-settings")
      if (res) {
        setWarmTransferPrice(res.transfer_rate?.toString() || "")
        setMaxCallDuration(res.max_call_duration?.toString() || "")
        setPhoneNumberPricing(res.phone_number_price?.toString() || "")
        setMinutesPerDollar(res.seconds_per_dollar ? (res.seconds_per_dollar / 60).toString() : "")
        setMonthlyFee(res.monthly_fee?.toString() || "")
        setMaxCalls(res.max_calls?.toString() || "")
        setCallFrequency(res.call_frequency?.toString() || "10")
        setCallPeriodMinutes(res.call_period_minutes?.toString() || "3")
        // setMaxCallLimitFreeTrial(res.max_call_limit_free_trial?.toString() || "2000")
        // setMaxLeadLimitFreeTrial(res.max_lead_limit_free_trial?.toString() || "3000")
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const validateField = (value: string, fieldName: string, isFloat = false) => {
    if (!value.trim()) {
      notifyResponse({
        success: false,
        detail: `${fieldName} is required`,
      })
      return false
    }
    
    const numValue = isFloat ? Number.parseFloat(value) : Number.parseInt(value)
    if (isNaN(numValue) || numValue < 0) {
      notifyResponse({
        success: false,
        detail: `Invalid ${fieldName}`,
      })
      return false
    }
    return true
  }

  const handleSaveSettings = async () => {
    // Validate all fields
    if (!validateField(warmTransferPrice, "Warm Transfer Price", true)) return
    if (!validateField(maxCallDuration, "Max Call Duration")) return
    if (!validateField(phoneNumberPricing, "Phone Number Pricing", true)) return
    if (!validateField(minutesPerDollar, "Minutes Per Dollar", true)) return
    if (!validateField(monthlyFee, "Monthly Fee")) return
    if (!validateField(maxCalls, "Max Calls")) return
    if (!validateField(callFrequency, "Call Frequency")) return
    if (!validateField(callPeriodMinutes, "Call Period Minutes")) return
    // if (!validateField(maxCallLimitFreeTrial, "Max Call Limit Free Trial")) return
    // if (!validateField(maxLeadLimitFreeTrial, "Max Lead Limit Free Trial")) return

    const settings = {
      warm_transfer_fee: Number.parseFloat(warmTransferPrice),
      max_duration: Number.parseInt(maxCallDuration),
      phone_number_price: Number.parseFloat(phoneNumberPricing),
      seconds_per_dollar: Number.parseFloat(minutesPerDollar) * 60,
      monthly_fee: Number.parseInt(monthlyFee),
      max_calls: Number.parseInt(maxCalls),
      call_frequency: Number.parseInt(callFrequency),
      call_period_minutes: Number.parseInt(callPeriodMinutes),
      // max_call_limit_free_trial: Number.parseInt(maxCallLimitFreeTrial),
      // max_lead_limit_free_trial: Number.parseInt(maxLeadLimitFreeTrial),
    }

    try {
      setLoading(true)
      const res = await backendRequest("PUT", "/default_settings", settings)
      notifyResponse(res)
      if (res.success) {
        fetchDefaultSettings()
      }
    } catch (error) {
      console.error("Error updating settings:", error)
      notifyResponse({ success: false, message: "Failed to update settings." })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDefaultSettings()
  }, [])

  if (loading) return <Loading />

  return (
    <div className="min-h-screen bg-gradient-to-br">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Default Settings
              </h1>
              <p className="text-gray-500 text-sm mt-1">Admin Configuration Panel</p>
            </div>
          </div>
        </div>

        <Card>
          <div className="p-4 sm:p-6 md:p-8">
            <div className="mb-12">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                Pricing Configuration
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    Warm Transfer Price ($)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={warmTransferPrice}
                      onChange={(e) => setWarmTransferPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 group-hover:border-gray-300"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">$</div>
                  </div>
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    Phone Number Price ($)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={phoneNumberPricing}
                      onChange={(e) => setPhoneNumberPricing(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 group-hover:border-gray-300"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">$</div>
                  </div>
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    Minutes Per $1
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={minutesPerDollar}
                      onChange={(e) => setMinutesPerDollar(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 group-hover:border-gray-300"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">min</div>
                  </div>
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    Monthly Fee ($)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min={0}
                      value={monthlyFee}
                      onChange={(e) => setMonthlyFee(e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 group-hover:border-gray-300"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">$</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Call Configuration
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    Max Call Duration (seconds)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      value={maxCallDuration}
                      onChange={(e) => setMaxCallDuration(e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 group-hover:border-gray-300"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">sec</div>
                  </div>
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    Max Calls
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={maxCalls}
                    onChange={(e) => setMaxCalls(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 group-hover:border-gray-300"
                  />
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    Call Frequency
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={callFrequency}
                    onChange={(e) => setCallFrequency(e.target.value)}
                    placeholder="10"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 group-hover:border-gray-300"
                  />
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    Call Period (minutes)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      value={callPeriodMinutes}
                      onChange={(e) => setCallPeriodMinutes(e.target.value)}
                      placeholder="3"
                      className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 group-hover:border-gray-300"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">min</div>
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="mb-12">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                Free Trial Limits
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    Max Call Limit (Free Trial)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={maxCallLimitFreeTrial}
                    onChange={(e) => setMaxCallLimitFreeTrial(e.target.value)}
                    placeholder="2000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 group-hover:border-gray-300"
                  />
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    Max Lead Limit (Free Trial)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={maxLeadLimitFreeTrial}
                    onChange={(e) => setMaxLeadLimitFreeTrial(e.target.value)}
                    placeholder="3000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 group-hover:border-gray-300"
                  />
                </div>
              </div>
            </div> */}

            <div className="flex justify-end pt-8 border-t border-gray-100">
              <button
                onClick={handleSaveSettings}
                disabled={loading}
                className="group relative px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {loading ? "Saving..." : "Save Settings"}
                </span>
                <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}