import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { backendRequest } from '../Helpers/backendRequest';
import { notifyResponse } from '../Helpers/notyf';

const AcceptInvitation = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepted, setIsAccepted] = useState(false);
  const [email, setEmail] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const[signupForm,setSignupForm] = useState(false)
  
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  const invitationEmail = queryParams.get('email');

  useEffect(() => {
    if (invitationEmail) {
      setEmail(invitationEmail);
    }

    if (token && invitationEmail) {
      checkInvitationStatus(token, invitationEmail);
    } else {
      setIsLoading(false);
    }
  }, [token, invitationEmail]);

  const checkInvitationStatus = async (token, email) => {
    try {
      const response = await backendRequest('GET', `/invite_status/${token}/${email}`);
      
      if (response.success) {
        setIsAccepted(true);
        setSignupForm(true); 

      } else {
        setIsAccepted(false);
      }
    } catch (error) {
      console.error("Error fetching invitation status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!token || !email) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await backendRequest('POST', `/accept_invitation/${token}/${email}`);
      notifyResponse(response);

      if (response.success) {
        setSignupForm(true);
      } else {
        console.log("Error");
        
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append('role', 'user');
    formData.append('type', 'organizational_user');
    formData.append(
      'name',
      formData.get("first_name")!.toString() + " " + formData.get("last_name")!.toString()
    );

    const data: Record<string, any> = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    const response = await backendRequest("POST", "/signup-team", data);
    notifyResponse(response);
    if(response.success){
      if (response.success){
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role)
        navigate("/dashboard");
    }
      navigate("/dashboard")
    }
    setIsLoading(false);

    if (response.success) {
      setTimeout(() => {
        setSignupForm(true)
      }, 2000);
    } else {
console.log("error")

    }
  };
console.log("signupForm",signupForm)

  return (
    <div className="flex flex-col justify-center py-16 px-8 sm:py-6 space-y-4">
      <div className="flex items-start">
        <img
          src="/logo.jpeg"
          alt="Phono AI Logo"
          className="h-14 mb-4"
        />
      </div>

      {isLoading ? (
        <div className="text-center items-center text-lg text-gray-700">
          <p>Loading...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center">
          <h2 className="text-3xl font-bold text-primary pb-2">Welcome!</h2>

          {isAccepted ? (
            <p className="text-lg font-semibold pb-2">
              You have already accepted this invitation! Please signup now.
            </p>
          ) : (
            <>
              {signupForm ? (
                <p className="text-lg text-gray-700 pb-8">
                  You have successfully accepted this invitation!
                </p>
              ) : (
                <>
                  <p className="text-lg text-gray-700 pb-8">
                    You've been invited to join our team. Please click the button below to accept your invitation.
                  </p>

                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-lg text-gray-800 font-semibold">
                        Email: <span className="text-blue-600">{email}</span>
                      </p>
                    </div>

                    <button
                      onClick={handleAccept}
                      className={`w-64 py-3 px-6 text-white font-semibold rounded-lg transition duration-300 transform ${
                        isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'
                      }`}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Accepting...' : 'Accept Invitation'}
                    </button>
                  </div>
                </>
              )}
            </>
          )}

        </div>
      )}

      { signupForm && (
        <div className="flex flex-col justify-center md:flex-row ">
          <div className="max-w-2xl px-8 bg-white rounded-lg mx-auto w-full">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">Signup</h2>
            <p className="text-gray-500 mb-8 text-center">Almost there! Just one last step to finish setting up your account.</p>

            <form onSubmit={handleSignup}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <input
                    type="text"
                    name="first_name"
                    placeholder="First Name"
                    autoComplete="name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="last_name"
                    placeholder="Last Name"
                    autoComplete="additional-name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={email}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              <div className="mb-6">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={() => setAgreedToTerms(!agreedToTerms)}
                  className="mr-2"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="/termsandconditions" className="text-primary hover:underline">
                    Terms & Conditions
                  </a>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 bg-primary text-white font-semibold rounded-lg transition duration-300 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                disabled={isLoading || !agreedToTerms}
              >
                {isLoading ? 'Signing Up...' : 'Sign Up'}
              </button>
            </form>

            <div className="text-center text-lg mt-6">
              <p className="text-gray-500">
                Already have an account?{' '}
                <a href="/login" className="text-primary hover:underline">
                  Login
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcceptInvitation;
