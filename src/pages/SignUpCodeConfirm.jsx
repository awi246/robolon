import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { validateOtp, sendOtp, updateProfile } from "../store/slices/appSlice";
import { toast } from "react-toastify";

const OTPVerificationForm = () => {
  const inputRefs = useRef([]); // References to OTP input fields
  const [otp, setOtp] = useState(new Array(6).fill("")); // State to store OTP input values
  const { phoneNumber, otpError } = useSelector((state) => state.app); // Extract phone number and OTP error from Redux store
  const [showModal, setShowModal] = useState(false); // State to control profile setup modal visibility
  const [email, setEmail] = useState(""); // State for email input
  const [emailError, setEmailError] = useState(""); // State for email error message
  const [showEmailError, setShowEmailError] = useState(false); // State to control email error visibility
  const [name, setName] = useState(""); // State for name input
  const [dob, setDob] = useState(""); // State for date of birth input
  const [isEmailFocused, setIsEmailFocused] = useState(false); // State to control email input focus
  const [timer, setTimer] = useState(1); // State for resend OTP timer
  const [isResendDisabled, setIsResendDisabled] = useState(true); // State to control resend OTP button
  const navigate = useNavigate(); // Navigation function from react-router
  const dispatch = useDispatch(); // Redux dispatch function

  // Effect to handle resend OTP timer
  useEffect(() => {
    let interval = null;
    if (isResendDisabled) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer === 1) {
            clearInterval(interval);
            setIsResendDisabled(false);
            return 60; // Reset the timer to 60 seconds
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResendDisabled]);

  // Handle input change for OTP inputs
  const handleInputChange = (e, index) => {
    const value = e.target.value;
    if (/^\d$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value !== "" && index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  // Handle backspace key press in OTP inputs
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (index === otp.length - 1 || otp[index + 1] === "") {
        if (index > 0 && otp[index] === "") {
          inputRefs.current[index - 1].focus();
        }
        setOtp((prevOtp) => {
          const newOtp = [...prevOtp];
          newOtp[index] = "";
          return newOtp;
        });
      }
    }
  };

  // Handle OTP input click to focus on the first empty field
  const handleInputClick = (index) => {
    const firstEmptyIndex = otp.findIndex((val) => val === "");
    if (firstEmptyIndex !== -1 && index >= firstEmptyIndex) {
      inputRefs.current[firstEmptyIndex].focus();
    } else if (firstEmptyIndex === -1 && index >= 0) {
      inputRefs.current[otp.length - 1].focus();
    }
  };

  // Handle OTP form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length === 6) {
      try {
        const response = await dispatch(
          validateOtp({ phone: phoneNumber, otp: otpCode })
        ).unwrap();
        if (response.success) {
          const data = response.data;

          // Remove guest information from local storage if present
          if (localStorage.getItem("guestName")) {
            localStorage.removeItem("guestName");
          }
          if (localStorage.getItem("guestPhone")) {
            localStorage.removeItem("guestPhone");
          }
          if (localStorage.getItem("guestEmail")) {
            localStorage.removeItem("guestEmail");
          }

          // Save access token to local storage
          localStorage.setItem("access_token", data.access_token);
          toast.success(data.message || "OTP validated successfully");

          // Show modal if the user is new (name is null)
          if (data.name === null) {
            setShowModal(true);
          } else {
            navigate("/");
          }
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        if (error.errors) {
          for (const fieldErrors of Object.values(error.errors)) {
            fieldErrors.forEach((message) => toast.error(message));
          }
        } else {
          toast.error(
            error.message || "Failed to validate OTP. Please try again."
          );
        }
      }
    } else {
      toast.error("Please enter a valid 6-digit OTP.");
    }
  };

  // Handle email input change
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (showEmailError && !e.target.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError("Invalid email format");
    } else {
      setEmailError("");
    }
  };

  // Handle email input blur
  const handleEmailBlur = () => {
    setIsEmailFocused(false);
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError("Invalid email format");
      setShowEmailError(true);
    } else {
      setEmailError("");
      setShowEmailError(false);
    }
  };

  // Handle email input focus
  const handleEmailFocus = () => {
    setIsEmailFocused(true);
  };

  // Handle name input change
  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  // Handle date of birth input change
  const handleDobChange = (e) => {
    setDob(e.target.value);
  };

  // Handle profile creation form submission
  const handleCreateProfile = async () => {
    if (!emailError && email && name && dob) {
      try {
        const profileData = { name, email, dob };
        const response = await dispatch(updateProfile(profileData)).unwrap();
        setShowModal(false);
        toast.success("Profile created successfully");
        navigate("/", { state: response }); // Navigate to ProfilePage with profile data
      } catch (error) {
        console.error("Error updating profile:", error); // Log the error for debugging
        if (error && error.errors) {
          // Handling validation errors
          for (const fieldErrors of Object.values(error.errors)) {
            fieldErrors.forEach((message) => toast.error(message));
          }
        } else if (error && error.message) {
          toast.error(error.message);
        } else {
          toast.error("Failed to create profile. Please try again.");
        }
      }
    } else {
      toast.error("Please fill in all required fields correctly.");
    }
  };

  // Prevent blur on invalid email input
  const preventBlurOnInvalidEmail = (e) => {
    if (emailError) {
      e.preventDefault();
      inputRefs.current[1].focus();
    }
  };

  // Get today's date in YYYY-MM-DD format
  const getMaxDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Handle resend OTP action
  const handleResendOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await dispatch(sendOtp(phoneNumber)).unwrap();
      if (response.success) {
        toast.success(response.message || "OTP sent successfully");
        setIsResendDisabled(true);
        setTimer(60); // Reset the timer to 60 seconds
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      if (error.errors) {
        // Handling validation errors
        for (const fieldErrors of Object.values(error.errors)) {
          fieldErrors.forEach((message) => toast.error(message));
        }
      } else {
        toast.error(otpError || "Failed to resend OTP. Please try again.");
      }
    }
  };

  return (
    <>
      <form
        className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 my-24"
        onSubmit={handleSubmit}
      >
        <div className="w-full bg-white rounded-lg shadow-lg border md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <p className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl text-center">
              OTP Verification Code
            </p>
            <p className="text-gray-500 text-sm mt-2 text-center">
              We have sent a verification code to your mobile number
            </p>
            <div className="flex justify-center mt-4">
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    className="w-10 h-10 text-center border-b-2 border-gray-300 mx-2 focus:border-blue-500 focus:outline-none"
                    onChange={(e) => handleInputChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onClick={() => handleInputClick(index)}
                    ref={(el) => (inputRefs.current[index] = el)}
                    value={otp[index]}
                  />
                ))}
            </div>
            <div className="text-center mt-4">
              <button
                onClick={handleResendOtp}
                disabled={isResendDisabled}
                className="text-red-600 font-medium hover:underline"
              >
                {isResendDisabled
                  ? `Resend code in ${timer}s`
                  : "Didn't receive code?"}
              </button>
            </div>
            <button
              className="w-full bg-[#7747ff] focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center text-white mt-4"
              type="submit"
            >
              Verify Me
            </button>
          </div>
        </div>
      </form>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-200 rounded-lg shadow-lg p-6 w-[500px] flex flex-col items-center gap-8">
            <a className="text-gray-700 uppercase tracking-wider font-bold text-xl mt-6">
              Set up Profile
            </a>
            <div className="relative w-96 mt-4 inputBox">
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                onBlur={preventBlurOnInvalidEmail}
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
            <div className="relative w-96 mt-4 inputBox1">
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                onFocus={handleEmailFocus}
                required
                className={`peer w-full p-2.5 bg-transparent border-2 border-b-2 ${
                  emailError ? "border-red-500" : "border-black"
                } text-black outline-none transition duration-100`}
                ref={(el) => (inputRefs.current[1] = el)}
              />
              <span
                className={`absolute left-0 top-[26px] transform ${
                  email || isEmailFocused
                    ? "translate-x-0 -translate-y-[50px] text-xs"
                    : "translate-x-2 -translate-y-4 text-xl"
                } text-black transition duration-500`}
                onClick={() => inputRefs.current[1].focus()}
              >
                Email
              </span>
              {showEmailError && emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>
            <div className="relative w-96 mt-4 inputBox">
              <span onClick={preventBlurOnInvalidEmail}>Date of Birth</span>
              <input
                type="date"
                value={dob}
                onChange={handleDobChange}
                onFocus={preventBlurOnInvalidEmail}
                required
                max={getMaxDate()}
                className="peer w-full p-2.5 bg-transparent border-2 border-b-2 border-black text-black outline-none transition duration-100"
              />
              <p className="text-sm text-black mt-1">
                You can&apos;t change the DOB later.
              </p>
            </div>
            <button
              className="mt-8 h-12 w-32 border-2 border-black rounded-lg bg-transparent text-black uppercase text-sm tracking-widest transition duration-500 hover:bg-black hover:text-white mb-4"
              onClick={handleCreateProfile}
            >
              Create Profile
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default OTPVerificationForm;
