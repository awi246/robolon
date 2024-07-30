/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaPencilAlt,
  FaSignOutAlt,
  FaCheckCircle,
  FaCalendarAlt,
  FaTimesCircle,
  FaChartPie,
  FaClock,
  FaCut,
  FaUser,
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import {
  fetchProfile,
  updateProfile,
  fetchAppointments,
  fetchHomePageData,
  cancelAppointment,
} from "../store/slices/appSlice";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ProfileSetupModal from "../components/ProfileSetupModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Modal for logout confirmation
const LogoutConfirmationModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded shadow-md text-center">
      <p>Do you really want to log out?</p>
      <div className="mt-4">
        <button
          className="bg-red-500 text-white px-4 py-2 rounded mr-2"
          onClick={onConfirm}
        >
          Yes
        </button>
        <button
          className="bg-gray-300 text-black px-4 py-2 rounded"
          onClick={onCancel}
        >
          No
        </button>
      </div>
    </div>
  </div>
);

const AppointmentDetailsModal = ({ appointmentDetails, onClose, onCancel }) => {
  const date = new Date(appointmentDetails.datetime).toLocaleDateString();
  const time = new Date(appointmentDetails.datetime).toLocaleTimeString();
  const services = appointmentDetails.services.map((service) => service.name);
  const totalPrice = appointmentDetails.services
    .reduce((sum, service) => sum + parseFloat(service.price), 0)
    .toFixed(2);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="bg-white p-6 rounded shadow-lg z-10 max-w-md w-full">
        <h2 className="text-xl font-bold mb-2 text-center">
          Appointment Details
        </h2>
        <p className="text-sm text-gray-600 mb-4 text-center">
          Please take a screenshot of your appointment details.
        </p>
        <p className="mb-4 text-center">
          <strong>Appointment ID:</strong> {appointmentDetails.id}
        </p>
        <p className="mb-4 text-center">
          <strong>Total Price:</strong> ${totalPrice}
        </p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <FaCalendarAlt className="mr-2" />
            <p>
              <strong>Date:</strong> {date}
            </p>
          </div>
          <div className="flex items-center">
            <FaClock className="mr-2" />
            <p>
              <strong>Time:</strong> {time}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-start">
            <FaCut className="mr-2 mt-1" />
            <div>
              <p>
                <strong>Services:</strong>
              </p>
              <ul className="list-disc pl-5">
                {services.map((service, index) => (
                  <li key={index}>{service}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex items-start">
            <FaUser className="mr-2 mt-1" />
            <p>
              <strong>Staff:</strong> {appointmentDetails.staff || "Any Staff"}
            </p>
          </div>
        </div>
        <div className="text-center">
          <button
            className="px-4 py-2 rounded bg-red-500 hover:bg-red-700 text-white"
            onClick={onClose}
          >
            Close
          </button>
          {appointmentDetails.is_upcoming && (
            <button
              className="ml-2 px-4 py-2 rounded bg-red-500 hover:bg-red-700 text-white"
              onClick={() => onCancel(appointmentDetails.id)}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const profileDataFromState = location.state || null;
  const profileData = useSelector((state) => state.app.profileData);
  const profileStatus = useSelector((state) => state.app.profileStatus);
  const appointments = useSelector((state) => state.app.appointments);
  const appointmentsStatus = useSelector(
    (state) => state.app.appointmentsStatus
  );
  const homePageStatus = useSelector((state) => state.app.homePageStatus);

  const [selectedChart, setSelectedChart] = useState("completed");
  const [editMode, setEditMode] = useState({
    name: false,
    email: false,
    image: false,
  });
  const [tempData, setTempData] = useState(profileDataFromState || {});
  const [errors, setErrors] = useState({ name: "", email: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileSetupModal, setShowProfileSetupModal] = useState(false);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch profile and appointments data if token exists
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/sign-up-code");
    } else {
      if (!profileDataFromState) {
        dispatch(fetchProfile());
      }
      dispatch(fetchAppointments());

      if (homePageStatus === "idle") {
        dispatch(fetchHomePageData());
      }
    }
  }, [dispatch, navigate, profileDataFromState, homePageStatus]);

  // Initialize profile data and show setup modal if needed
  useEffect(() => {
    if (profileData) {
      setTempData(profileData);
      if (!profileData.name) {
        setShowProfileSetupModal(true);
      }
    }
  }, [profileData]);

  const handleChartClick = (chart) => {
    setSelectedChart(chart);
  };

  const handleEditClick = (field) => {
    setEditMode({ ...editMode, [field]: true });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempData({ ...tempData, [name]: value });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSaveClick = () => {
    const newErrors = { name: "", email: "" };

    if (!tempData.name.trim()) {
      newErrors.name = "Name cannot be empty";
    }

    if (!tempData.email.trim()) {
      newErrors.email = "Email cannot be empty";
    } else if (!validateEmail(tempData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (newErrors.name || newErrors.email) {
      setErrors(newErrors);
    } else {
      dispatch(updateProfile(tempData));
      setEditMode({ name: false, email: false, image: false });
      setErrors({ name: "", email: "" });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempData({ ...tempData, image: reader.result });
        setEditMode({ ...editMode, image: false });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem("access_token");
    navigate("/sign-up-code");
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const categorizeAppointments = (appointments) => {
    const pastAppointments = [];
    const todayAppointments = [];
    const futureAppointments = [];
    const canceledAppointments = [];
    const today = new Date().toISOString().slice(0, 10);

    appointments.forEach((appointment) => {
      if (appointment.is_canceled) {
        canceledAppointments.push(appointment);
      } else {
        const appointmentDate = appointment.datetime.slice(0, 10);
        if (appointmentDate < today) {
          pastAppointments.push(appointment);
        } else if (appointmentDate === today) {
          todayAppointments.push(appointment);
        } else {
          futureAppointments.push(appointment);
        }
      }
    });

    return {
      pastAppointments,
      todayAppointments,
      futureAppointments,
      canceledAppointments,
    };
  };

  const {
    pastAppointments,
    todayAppointments,
    futureAppointments,
    canceledAppointments,
  } = categorizeAppointments(appointments || []);

  const handleCancelAppointment = async (appointmentId) => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await dispatch(
        cancelAppointment({ appointmentId, token })
      ).unwrap();
      toast.success(response.message || "Appointment cancelled successfully");
      dispatch(fetchAppointments());
    } catch (error) {
      toast.error(error.message || "Failed to cancel appointment");
    }
  };

  const handleShowDetails = (appointment) => {
    setAppointmentDetails(appointment);
    setShowAppointmentDetails(true);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // 1-second delay
    return () => clearTimeout(timer);
  }, []);

  if (
    isLoading ||
    profileStatus === "loading" ||
    appointmentsStatus === "loading"
  ) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSkeleton />
      </div>
    );
  }

  const renderAppointments = (appointments) => {
    if (appointments.length === 0) {
      return <p>No Appointments</p>;
    }

    // Sort appointments by date and time
    const sortedAppointments = [...appointments].sort(
      (a, b) => new Date(a.datetime) - new Date(b.datetime)
    );

    return (
      <div className="space-y-4 max-h-[45vh] overflow-y-auto">
        {sortedAppointments.map((appointment) => {
          const totalPrice = appointment.services
            .reduce((sum, service) => sum + parseFloat(service.price), 0)
            .toFixed(2);
          const isUpcoming = new Date(appointment.datetime) > new Date();
          const isCanceled = appointment.is_canceled;

          return (
            <div
              key={appointment.id}
              className="bg-white p-4 border border-gray-300 rounded-lg shadow-md flex flex-col lg:flex-row lg:justify-evenly lg:items-center"
              onClick={() => handleShowDetails(appointment)}
            >
              <div className="flex flex-col lg:flex-row lg:justify-evenly lg:items-center w-full text-center">
                <div className="flex flex-col lg:flex-row lg:justify-evenly lg:w-full mb-2 lg:mb-0 items-center">
                  <div>
                    <strong>ID:</strong> {appointment.id}
                  </div>
                  <div>
                    <strong>Price:</strong> ${totalPrice}
                  </div>
                </div>
                <div className="flex flex-col lg:flex-row lg:justify-between lg:w-full lg:mr-4 mb-2 lg:mb-0 items-center">
                  <div>
                    <strong>Date:</strong>{" "}
                    {new Date(appointment.datetime).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Time:</strong>{" "}
                    {new Date(appointment.datetime).toLocaleTimeString()}
                  </div>
                </div>
                <div className="flex flex-col lg:flex-row lg:justify-evenly lg:w-full mb-2 lg:mb-0 items-center">
                  <div>
                    <strong>Services:</strong>{" "}
                    {appointment.services.length > 1
                      ? `${appointment.services[0].name}, ...`
                      : appointment.services[0].name}
                  </div>
                  <div>
                    <strong>Staff:</strong> {appointment.staff || "Any Staff"}
                  </div>
                </div>
                <div className="flex justify-center w-full lg:w-auto mt-2 lg:mt-0">
                  {isUpcoming && !isCanceled && (
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelAppointment(appointment.id);
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center w-screen bg-gray-100 lg:h-[89vh] lg:bg-gray-100">
      <div className="bg-white w-full h-full shadow-md border border-gray-300 lg:w-full lg:h-full lg:flex lg:shadow-md lg:border-gray-300">
        <aside className="flex flex-col w-full bg-gray-200 p-6 lg:w-1/4 lg:bg-gray-200 lg:p-6">
          <div className="relative bg-white border border-gray-300 rounded-lg flex flex-col items-center mb-6 p-4 overflow-hidden group">
            <div className="w-[200px] h-[200px] lg:w-[200px] lg:h-[200px] rounded-full overflow-hidden mb-4 relative">
              <img
                src={tempData.image}
                alt="Profile"
                className="w-full h-full object-cover"
                style={{ objectFit: "contain" }}
              />
              <div
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => handleEditClick("image")}
              >
                <span className="text-white font-bold">Edit</span>
              </div>
              {editMode.image && (
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleImageChange}
                />
              )}
            </div>
          </div>
          <div className="bg-white p-4 border border-gray-300 rounded-lg">
            <div className="flex flex-col space-y-4">
              <p className="flex justify-between items-center">
                <span>
                  <span className="font-bold">Name:</span>{" "}
                  {editMode.name ? (
                    <input
                      type="text"
                      name="name"
                      value={tempData.name || ""}
                      onChange={handleInputChange}
                      className="border p-1"
                    />
                  ) : (
                    tempData.name
                  )}
                </span>
                <FaPencilAlt
                  className="text-gray-500 cursor-pointer"
                  onClick={() => handleEditClick("name")}
                />
              </p>
              {errors.name && <p className="text-red-500">{errors.name}</p>}
              <p className="flex justify-between items-center">
                <span>
                  <span className="font-bold">Email:</span>{" "}
                  {editMode.email ? (
                    <input
                      type="email"
                      name="email"
                      value={tempData.email || ""}
                      onChange={handleInputChange}
                      className="border p-1"
                    />
                  ) : (
                    tempData.email
                  )}
                </span>
                <FaPencilAlt
                  className="text-gray-500 cursor-pointer"
                  onClick={() => handleEditClick("email")}
                />
              </p>
              {errors.email && <p className="text-red-500">{errors.email}</p>}
              <p className="flex justify-between items-center">
                <span>
                  <span className="font-bold">Phone:</span>{" "}
                  {tempData.phone_number}
                </span>
              </p>
              <p className="flex justify-between items-center">
                <span>
                  <span className="font-bold">DOB:</span> {tempData.dob}
                </span>
                {(editMode.name || editMode.email) && (
                  <button
                    className="bg-blue-500 text-white p-2 rounded"
                    onClick={handleSaveClick}
                  >
                    Save
                  </button>
                )}
              </p>
            </div>
          </div>
          <button
            className="flex items-center justify-center mt-6 p-2 bg-red-500 text-white rounded shadow hover:bg-red-700 transition-colors duration-200 max-lg:absolute max-lg:right-10 "
            onClick={handleLogoutClick}
          >
            <FaSignOutAlt className="mr-2 " />{" "}
            <span className="hidden lg:inline text-white">Logout</span>
          </button>
        </aside>
        <main className="flex-1 bg-white max-h-[100vh] p-6 flex flex-col overflow-auto relative">
          <div className="sticky top-0 bg-white p-4 mb-4 z-10">
            <div className="sm:space-y-2 sm:flex sm:space-x-4 md:hidden">
              <div className="relative">
                <button
                  className="bg-white p-4 border border-gray-300 w-full cursor-pointer transition-colors hover:text-gray-600 hover:border-gray-600 flex justify-between items-center"
                  onClick={toggleDropdown}
                >
                  <span>
                    {selectedChart.charAt(0).toUpperCase() +
                      selectedChart.slice(1)}{" "}
                    Appointments
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 w-full bg-white border border-gray-300 shadow-lg z-10">
                    {[
                      { name: "completed", icon: <FaCheckCircle /> },
                      { name: "upcoming", icon: <FaCalendarAlt /> },
                      { name: "canceled", icon: <FaTimesCircle /> },
                      { name: "chart", icon: <FaChartPie /> },
                    ].map((chart) => (
                      <div
                        key={chart.name}
                        className={`p-4 cursor-pointer transition-colors hover:bg-gray-100 ${
                          selectedChart === chart.name ? "bg-gray-100" : ""
                        }`}
                        onClick={() => {
                          handleChartClick(chart.name);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <h2 className="flex items-center space-x-2">
                          {chart.icon}{" "}
                          <span>
                            {chart.name.charAt(0).toUpperCase() +
                              chart.name.slice(1)}{" "}
                            Appointments
                          </span>
                        </h2>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {!isDropdownOpen && (
              <div className="hidden md:flex space-y-2 sm:space-y-0 sm:flex sm:space-x-4">
                {[
                  { name: "completed", icon: <FaCheckCircle /> },
                  { name: "upcoming", icon: <FaCalendarAlt /> },
                  { name: "canceled", icon: <FaTimesCircle /> },
                  { name: "chart", icon: <FaChartPie /> },
                ].map((chart) => (
                  <div
                    key={chart.name}
                    className={`bg-white p-4 border border-gray-300 w-full sm:w-1/4 cursor-pointer transition-colors ${
                      selectedChart === chart.name
                        ? "text-gray-600 border-gray-600"
                        : "hover:text-gray-600 hover:border-gray-600"
                    }`}
                    onClick={() => handleChartClick(chart.name)}
                  >
                    <h2 className="text-center flex items-center justify-center space-x-2">
                      {chart.icon}{" "}
                      <span>
                        {chart.name.charAt(0).toUpperCase() +
                          chart.name.slice(1)}{" "}
                        Appointments
                      </span>
                    </h2>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white p-6 border border-gray-300 w-full mb-4 flex-shrink-0 rounded-lg shadow-lg z-0 h-[45vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-2">
              {selectedChart === "completed"
                ? "Completed Appointments"
                : selectedChart === "upcoming"
                ? "Upcoming Appointments"
                : selectedChart === "canceled"
                ? "Canceled Appointments"
                : "Chart"}
            </h2>
            {selectedChart === "completed" &&
              renderAppointments(pastAppointments)}
            {selectedChart === "upcoming" &&
              renderAppointments([...todayAppointments, ...futureAppointments])}
            {selectedChart === "canceled" &&
              renderAppointments(canceledAppointments)}
            {selectedChart === "chart" && (
              <div className="flex justify-center max-h-[285px]">
                <img
                  src="https://www.jaspersoft.com/content/dam/jaspersoft/images/graphics/infographics/line-chart-example.svg"
                  alt="Chart"
                  className="max-w-full"
                />
              </div>
            )}
          </div>
          <div
            className={`bg-white p-6 border border-gray-300 w-full mb-4 flex-shrink-0 rounded-lg shadow-lg z-0 ${
              selectedChart ? "" : "mt-auto"
            }`}
          >
            <h2 className="text-xl font-bold mb-2">Review from Staff...</h2>
            <p className="break-words overflow-hidden text-ellipsis whitespace-normal">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut enim
              illum maiores possimus excepturi ex sit quis molestias placeat
              velit ullam, quibusdam voluptas maxime optio cumque tenetur atque
              suscipit commodi. Lorem ipsum dolor sit amet consectetur
              adipisicing elit. Quae, in consequatur? Eveniet, ipsam, alias nemo
              laboriosam reiciendis aliquam quos quaerat nam, dolorum eius cum
              eligendi molestiae maxime earum iste repudiandae?
            </p>
          </div>
        </main>
      </div>
      {showLogoutModal && (
        <LogoutConfirmationModal
          onConfirm={handleLogoutConfirm}
          onCancel={handleLogoutCancel}
        />
      )}
      {showProfileSetupModal && (
        <ProfileSetupModal onClose={() => setShowProfileSetupModal(false)} />
      )}
      {showAppointmentDetails && (
        <AppointmentDetailsModal
          appointmentDetails={appointmentDetails}
          onClose={() => setShowAppointmentDetails(false)}
          onCancel={handleCancelAppointment}
        />
      )}
      <ToastContainer />
    </div>
  );
};

export default ProfilePage;
