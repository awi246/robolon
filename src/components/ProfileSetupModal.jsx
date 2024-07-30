/* eslint-disable react/prop-types */
import { useState } from "react";
import { useDispatch } from "react-redux";
import { updateProfile } from "../store/slices/appSlice";
import { toast } from "react-toastify";

const ProfileSetupModal = ({ onClose }) => {
  // State variables to manage form fields and validation
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showEmailError, setShowEmailError] = useState(false);
  const dispatch = useDispatch();

  // Handle email input change with validation
  const handleEmailChange = (e) => {
    const { value } = e.target;
    setEmail(value);
    if (showEmailError && !value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError("Invalid email format");
    } else {
      setEmailError("");
    }
  };

  // Validate email format on blur
  const handleEmailBlur = () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError("Invalid email format");
      setShowEmailError(true);
    } else {
      setEmailError("");
      setShowEmailError(false);
    }
  };

  // Handle profile creation form submission
  const handleCreateProfile = async () => {
    if (!emailError && email && name && dob) {
      try {
        const profileData = { name, email, dob };
        await dispatch(updateProfile(profileData)).unwrap();
        toast.success("Profile created successfully");
        onClose(); // Close the modal after successful profile creation
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
  // Get the maximum date for the date input field
  const getMaxDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-200 rounded-lg shadow-lg p-6 w-[500px] flex flex-col items-center gap-8">
        <h1 className="text-gray-700 uppercase tracking-wider font-bold text-xl mt-6">
          Set up Profile
        </h1>
        <div className="relative w-96 mt-4 inputBox">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="peer w-full p-2.5 bg-transparent border-2 border-b-2 border-black text-black outline-none transition duration-100"
          />
          <span className="absolute left-0 top-[26px] transform -translate-y-4 translate-x-2 text-xl text-black transition duration-500 peer-focus:transform peer-focus:translate-x-[0px] peer-focus:translate-y-[-50px] peer-valid:transform peer-valid:translate-x-[0px] peer-valid:translate-y-[-50px] peer-valid:text-xs peer-focus:text-xs">
            Name
          </span>
        </div>
        <div className="relative w-96 mt-4 inputBox1">
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            required
            className={`peer w-full p-2.5 bg-transparent border-2 border-b-2 ${
              emailError ? "border-red-500" : "border-black"
            } text-black outline-none transition duration-100`}
          />
          <span
            className={`absolute left-0 top-[26px] transform ${
              email
                ? "translate-x-0 -translate-y-[50px] text-xs"
                : "translate-x-2 -translate-y-4 text-xl"
            } text-black transition duration-500`}
          >
            Email
          </span>
          {showEmailError && emailError && (
            <p className="text-red-500 text-sm mt-1">{emailError}</p>
          )}
        </div>
        <div className="relative w-96 mt-4 inputBox">
          <span>Date of Birth</span>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
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
  );
};

export default ProfileSetupModal;
