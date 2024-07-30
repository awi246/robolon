import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  sendOtp,
  setPhoneNumber,
  fetchTermsConditions,
} from "../store/slices/appSlice";
import { toast } from "react-toastify";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const SignupForm = () => {
  const { otpStatus, termsConditions } = useSelector((state) => state.app);
  const [phoneNumber, setPhoneNumberInput] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showEmailError, setShowEmailError] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const inputRefs = useRef([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const access_token = localStorage.getItem("access_token");
    if (access_token) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions.");
      return;
    }
    if (phoneNumber) {
      try {
        dispatch(setPhoneNumber(phoneNumber));
        const response = await dispatch(sendOtp(phoneNumber)).unwrap();
        if (response.success && response.message) {
          toast.success(response.message);
          navigate("/sign-up-code-confirm");
        } else if (response.message) {
          toast.error(response.message);
        } else {
          toast.error("Failed to send OTP. Please try again.");
        }
      } catch (error) {
        if (error.errors && error.errors.phone) {
          toast.error(error.errors.phone[0]);
        } else {
          toast.error("Failed to send OTP. Please try again.");
        }
      }
    } else {
      toast.error("Please enter your phone number.");
    }
  };

  const handleGuestLogin = () => {
    if (!guestName || !guestPhone) {
      toast.error("Name and Phone Number are required.");
      return;
    }
    // Store guest details in local storage
    localStorage.setItem("guestName", guestName);
    localStorage.setItem("guestPhone", guestPhone);
    if (guestEmail) {
      localStorage.setItem("guestEmail", guestEmail);
    }
    // Handle guest login logic here
    toast.success("Logged in as guest successfully.");
    setShowGuestModal(false);
    navigate("/");
  };

  const handleEmailChange = (e) => {
    setGuestEmail(e.target.value);
    if (showEmailError && !e.target.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError("Invalid email format");
    } else {
      setEmailError("");
    }
  };

  const handleEmailBlur = () => {
    setIsEmailFocused(false);
    if (!guestEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError("Invalid email format");
      setShowEmailError(true);
    } else {
      setEmailError("");
      setShowEmailError(false);
    }
  };

  const handleEmailFocus = () => {
    setIsEmailFocused(true);
  };

  const handleTermsClick = async () => {
    setShowTermsModal(true);
    setModalVisible(true);
    dispatch(fetchTermsConditions());
  };

  const handleTermsAccept = () => {
    setTermsAccepted(true);
    setModalVisible(false);
    setTimeout(() => setShowTermsModal(false), 300);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto mt-24 lg:py-0 my-24">
          <div className="w-full bg-white rounded-lg shadow-lg border md:mt-0 sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <p className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl text-center">
                Join <span className="text-gray-500">Robolon</span>
              </p>
              <div>
                <label className="text-gray-600 text-sm">Phone number</label>
                <div className="relative mt-2 text-gray-500">
                  <PhoneInput
                    className="w-full pl-[1rem] pr-3 py-2 appearance-none bg-transparent outline-none border border-gray-300 shadow-sm rounded-lg"
                    placeholder="+1 (555) 000-000"
                    value={phoneNumber}
                    onChange={setPhoneNumberInput}
                    international
                  />
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300"
                    type="checkbox"
                    aria-describedby="terms"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-light text-gray-500">
                    I accept the{" "}
                    <a
                      href="#"
                      className="font-medium text-primary-600 hover:underline"
                      onClick={handleTermsClick}
                    >
                      Terms and Conditions
                    </a>
                  </label>
                </div>
              </div>
              <button
                className={`w-full font-medium rounded-lg text-sm px-5 py-2.5 text-center text-white mt-8 ${
                  otpStatus === "loading" || !termsAccepted
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-600 focus:ring-4 focus:outline-none focus:ring-primary-300"
                }`}
                type="submit"
                disabled={otpStatus === "loading" || !termsAccepted}
              >
                {otpStatus === "loading" ? "Sending..." : "Send Code"}
              </button>
              <div className="flex justify-center mt-4">
                <p
                  className="text-gray-500 cursor-pointer hover:underline"
                  onClick={() => setShowGuestModal(true)}
                >
                  Login as Guest?
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>

      {showGuestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-200 rounded-lg shadow-lg p-6 w-full max-w-lg flex flex-col items-center gap-4 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowGuestModal(false)}
            >
              &times;
            </button>
            <a className="text-gray-700 uppercase tracking-wider font-bold text-xl mt-2">
              Set up Profile
            </a>
            <div className="relative w-full mt-4 inputBox">
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                className="peer w-full p-2.5 bg-transparent border-2 border-b-2 border-black text-black outline-none transition duration-100"
                ref={(el) => (inputRefs.current[0] = el)}
              />
              <span
                className="absolute left-0 top-[26px] transform -translate-y-4 translate-x-2 text-xl text-black transition duration-500 peer-focus:transform peer-focus:translate-x-[0px] peer-focus:translate-y-[-50px] peer-valid:transform peer-valid:translate-x-[0px] peer-valid:translate-y-[-50px] peer-valid:text-xs peer-focus:text-xs"
                onClick={() => inputRefs.current[0].focus()}
              >
                Name
              </span>
            </div>
            <div className="relative w-full mt-4 inputBox">
              <input
                type="text"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                required
                className="peer w-full p-2.5 bg-transparent border-2 border-b-2 border-black text-black outline-none transition duration-100"
                ref={(el) => (inputRefs.current[1] = el)}
              />
              <span
                className="absolute left-0 top-[26px] transform -translate-y-4 translate-x-2 text-xl text-black transition duration-500 peer-focus:transform peer-focus:translate-x-[0px] peer-focus:translate-y-[-50px] peer-valid:transform peer-valid:translate-x-[0px] peer-valid:translate-y-[-50px] peer-valid:text-xs peer-focus:text-xs"
                onClick={() => inputRefs.current[1].focus()}
              >
                Phone Number
              </span>
            </div>
            <div className="relative w-full mt-4 inputBox1">
              <input
                type="email"
                value={guestEmail}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                onFocus={handleEmailFocus}
                className={`peer w-full p-2.5 bg-transparent border-2 border-b-2 ${
                  emailError ? "border-red-500" : "border-black"
                } text-black outline-none transition duration-100`}
                ref={(el) => (inputRefs.current[2] = el)}
              />
              <span
                className={`absolute left-0 top-[26px] transform ${
                  guestEmail || isEmailFocused
                    ? "translate-x-0 -translate-y-[50px] text-xs"
                    : "translate-x-2 -translate-y-4 text-xl"
                } text-black transition duration-500`}
                onClick={() => inputRefs.current[2].focus()}
              >
                Email
              </span>
              {showEmailError && emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>
            <button
              className="mt-6 h-12 w-32 border-2 border-black rounded-lg bg-transparent text-black uppercase text-sm tracking-widest transition duration-500 hover:bg-black hover:text-white"
              onClick={handleGuestLogin}
            >
              Login As Guest
            </button>
          </div>
        </div>
      )}

      {showTermsModal && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
            modalVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl flex flex-col items-center gap-4 relative transform transition-transform duration-300 ${
              modalVisible ? "scale-100" : "scale-95"
            }`}
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() =>
                setModalVisible(false) ||
                setTimeout(() => setShowTermsModal(false), 300)
              }
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Terms and Conditions</h2>

            <div className="max-h-96 overflow-y-auto">
              <p className="text-gray-700 whitespace-pre-line">
                {termsConditions}
              </p>
            </div>

            <div className="flex items-start mt-4">
              <div className="flex items-center h-5">
                <input
                  className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300"
                  type="checkbox"
                  id="modal-terms"
                  checked={termsAccepted}
                  onChange={handleTermsAccept}
                />
              </div>
              <div className="ml-3 text-sm">
                <label
                  className="font-light text-gray-500"
                  htmlFor="modal-terms"
                >
                  I agree to all the terms and conditions
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SignupForm;
