/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { bookAppointment } from "../store/slices/appSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../components/LoadingSkeleton";
import { FaCalendarAlt, FaClock, FaUser, FaCut } from "react-icons/fa";

const generateTimeSlots = (start, end) => {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  const timeSlots = [];
  let currentHour = startHour;
  let currentMinute = startMinute;

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMinute < endMinute)
  ) {
    const slotStart = new Date();
    slotStart.setHours(currentHour);
    slotStart.setMinutes(currentMinute);
    timeSlots.push(
      slotStart.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    );

    currentMinute += 15;
    if (currentMinute >= 60) {
      currentMinute -= 60;
      currentHour++;
    }
  }

  return timeSlots;
};

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const handleClose = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleClose}
    >
      <div className="relative bg-white p-6 rounded shadow-lg w-11/12 md:w-1/2 lg:w-1/3">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

const AppointmentModal = ({ appointmentDetails, onClose, services }) => {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatDateTime = (datetime) => {
    const [date, time] = datetime.split(" ");
    return { date, time };
  };

  const { date, time } = formatDateTime(appointmentDetails.datetime);

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
              <strong>Staff:</strong> {appointmentDetails.staff}
            </p>
          </div>
        </div>
        <div className="text-center">
          <button
            className={`px-4 py-2 rounded ${
              countdown > 0
                ? "bg-gray-500 cursor-not-allowed"
                : " bg-red-500 hover:bg-red-700"
            } text-white`}
            onClick={onClose}
            disabled={countdown > 0}
          >
            {countdown > 0 ? `Close (${countdown})` : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Calendar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selectedTenantId = useSelector((state) => state.app.selectedTenantId);
  const selectedStaff = useSelector((state) => state.app.selectedStaff);
  const selectedServicesForBooking = useSelector(
    (state) => state.app.selectedServicesForBooking
  );
  const selectedDuration = useSelector((state) => state.app.selectedDuration);
  const selectedCost = useSelector((state) => state.app.selectedCost);
  const homePageData = useSelector((state) => state.app.homePageData);

  const [workingHours, setWorkingHours] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (selectedTenantId) {
      const localStorageKey = `footerData_${selectedTenantId}`;
      const storedFooterData = localStorage.getItem(localStorageKey);

      if (storedFooterData) {
        const data = JSON.parse(storedFooterData);
        setWorkingHours(data.working_hours || []);
      }
    }
  }, [selectedTenantId]);

  const handleDateClick = (day, date) => {
    if (selectedDate === date) {
      setSelectedDate(null);
      setTimeSlots([]);
      setSelectedTimeSlot(null);
    } else {
      const dayWorkingHours = workingHours.find(
        (wh) => wh.day.toLowerCase() === day.toLowerCase()
      );
      if (dayWorkingHours) {
        const slots = generateTimeSlots(
          dayWorkingHours.start,
          dayWorkingHours.end
        );
        setTimeSlots(slots);
        setSelectedDate(date);
        setSelectedTimeSlot(null);
      }
    }
  };

  const handleTimeSlotClick = (slot) => {
    setSelectedTimeSlot(slot);
  };

  const handleMonthChange = (increment) => {
    setCurrentMonthIndex(currentMonthIndex + increment);
    setSelectedDate(null);
    setTimeSlots([]);
    setSelectedTimeSlot(null);
  };

  const handleNextClick = async () => {
    if (selectedDate && selectedTimeSlot) {
      const selectedDateTime = new Date();
      selectedDateTime.setMonth(
        selectedDateTime.getMonth() + currentMonthIndex
      );
      selectedDateTime.setDate(selectedDate);
      selectedDateTime.setHours(parseInt(selectedTimeSlot.split(":")[0], 10));
      selectedDateTime.setMinutes(parseInt(selectedTimeSlot.split(":")[1], 10));
      const formattedDateTime = `${selectedDateTime.getFullYear()}-${String(
        selectedDateTime.getMonth() + 1
      ).padStart(2, "0")}-${String(selectedDateTime.getDate()).padStart(
        2,
        "0"
      )} ${String(selectedDateTime.getHours()).padStart(2, "0")}:${String(
        selectedDateTime.getMinutes()
      ).padStart(2, "0")}:00`;

      const appointmentDetails = {
        datetime: formattedDateTime,
        tenant_id: selectedTenantId,
        staff_id: selectedStaff ? selectedStaff.id : null,
        services: selectedServicesForBooking,
      };

      try {
        const response = await dispatch(
          bookAppointment(appointmentDetails)
        ).unwrap();
        if (response.success) {
          setLoading(true);
          setAppointmentDetails({
            id: response.data.id,
            services: selectedServicesForBooking,
            datetime: formattedDateTime,
            staff: selectedStaff ? selectedStaff.name : "Any staff",
          });
          setShowModal(true);
          setLoading(false);
        } else {
          toast.error(
            response.message ||
              "An error occurred while booking the appointment."
          );
        }
      } catch (error) {
        toast.error(
          error.message || "An error occurred while booking the appointment."
        );
      }
    } else {
      toast.error("Please select a date and time slot.");
    }
  };

  const selectedServiceDetails = useMemo(() => {
    return homePageData?.services && selectedServicesForBooking.length > 0
      ? selectedServicesForBooking
          .map((id) =>
            homePageData.services.find((service) => service.id === id)
          )
          .filter((service) => service !== undefined)
      : [];
  }, [homePageData?.services, selectedServicesForBooking]);

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const generateCalendarDays = () => {
    const today = new Date();
    today.setMonth(today.getMonth() + currentMonthIndex);
    const currentMonth = today.toLocaleString("default", { month: "short" });
    const currentYear = today.getFullYear();
    const currentDay = currentMonthIndex === 0 ? today.getDate() : 1;
    const daysInMonth = new Date(
      currentYear,
      today.getMonth() + 1,
      0
    ).getDate();
    const startDay = new Date(currentYear, today.getMonth(), 1).getDay();

    const calendarDays = [];
    for (let i = 0; i < startDay; i++) {
      calendarDays.push(
        <div
          key={`empty-${i}`}
          className="calendar-day p-2 text-gray-400"
        ></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayName = daysOfWeek[(startDay + day - 1) % 7];
      const isClickable =
        day >= currentDay &&
        workingHours.some(
          (wh) => wh.day.toLowerCase() === dayName.toLowerCase()
        );

      calendarDays.push(
        <div
          key={day}
          className={`calendar-day text-center p-3 ${
            isClickable ? "text-black cursor-pointer" : "text-gray-400"
          } ${
            selectedDate === day
              ? "bg-black rounded text-white font-semibold"
              : ""
          }`}
          onClick={() => isClickable && handleDateClick(dayName, day)}
        >
          {day}
        </div>
      );
    }

    const remainingCells = 7 - (calendarDays.length % 7);
    for (let i = 0; i < remainingCells; i++) {
      calendarDays.push(
        <div
          key={`remaining-${i}`}
          className="calendar-day p-2 text-gray-400"
        ></div>
      );
    }

    return (
      <div className="calendar w-full md:w-1/3 h-[70%] flex flex-col mb-4 md:mb-0">
        <div className="current-month text-center font-bold mb-4">
          Current Month ({currentMonth})
        </div>
        <div className="text-center mb-4">
          {currentMonthIndex > 0 && (
            <button className="mr-4" onClick={() => handleMonthChange(-1)}>
              ← Current Month
            </button>
          )}
          {currentMonthIndex === 0 && (
            <button className="ml-4" onClick={() => handleMonthChange(1)}>
              Next Month →
            </button>
          )}
        </div>
        <div className="calendar-grid grid grid-cols-7 gap-2 border-2 rounded-lg p-3">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="calendar-day-header p-3 font-bold text-center"
            >
              {day.substring(0, 3)}
            </div>
          ))}
          {calendarDays}
        </div>
        <div className="text-center bg-white p-4 rounded-lg shadow-lg mt-4">
          <FaUser className="inline-block mr-2" />
          <span className="font-semibold">Selected Staff:</span>
          <div className="mt-2">
            {selectedStaff ? (
              <>
                <p>{selectedStaff.name}</p>
                <p className="text-gray-600">{selectedStaff.email}</p>
              </>
            ) : (
              <p>Any staff</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSelectedServices = () => {
    if (selectedServiceDetails.length === 0) {
      return null;
    }

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg mt-4">
        <h3 className="text-lg font-bold mb-2">Selected Services</h3>
        <ul className="list-disc pl-5">
          {selectedServiceDetails.map((service) => (
            <li key={service.id}>{service.name}</li>
          ))}
        </ul>
      </div>
    );
  };

  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}hr ${mins}min`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <ToastContainer />
      {showModal && (
        <AppointmentModal
          appointmentDetails={appointmentDetails}
          onClose={() => {
            // Check for guest details in local storage
            const guestName = localStorage.getItem("guestName");
            const guestPhone = localStorage.getItem("guestPhone");
            const guestEmail = localStorage.getItem("guestEmail");

            if (guestName || guestPhone || guestEmail) {
              // Remove guest details if they exist
              localStorage.removeItem("guestName");
              localStorage.removeItem("guestPhone");
              localStorage.removeItem("guestEmail");
            }

            // Close the modal and navigate
            setShowModal(false);
            navigate("/");
            window.location.reload();
          }}
          services={selectedServiceDetails.map((service) => service.name)}
        />
      )}
      {loading ? (
        <Loader />
      ) : (
        <>
          <main className="container mx-auto p-4 bg-white rounded-lg shadow-lg flex-grow flex flex-col md:flex-row">
            {generateCalendarDays()}
            <div className="schedule w-full md:w-2/3 h-[60%] bg-gray-200 p-4 rounded-lg ml-0 md:ml-4 overflow-hidden">
              <div className="h-[calc(5*5rem)] overflow-y-auto">
                {selectedDate && timeSlots.length > 0 ? (
                  timeSlots.map((slot, index) => (
                    <div
                      key={index}
                      className={`bg-gray-300 p-2 rounded-lg mb-2 flex items-center justify-center h-20 font-bold transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${
                        selectedTimeSlot === slot ? "bg-gray-700" : ""
                      }`}
                      onClick={() => handleTimeSlotClick(slot)}
                    >
                      <span
                        className={
                          selectedTimeSlot === slot
                            ? "text-white"
                            : "text-black"
                        }
                      >
                        {slot}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500">
                    Select a day to see available time slots
                  </div>
                )}
              </div>
              {renderSelectedServices()}
            </div>
          </main>
          <footer className="bg-gray-100 shadow py-4 overflow-auto w-[calc(100%-40px)] rounded-lg m-5">
            <div className="container mx-auto px-4 relative">
              <div className="hidden lg:flex justify-between items-center">
                <Link to="/select-staff">
                  <button className="px-6 py-2 bg-white rounded border-2 border-gray-500 shadow-lg hover:bg-gray-500 text-black hover:text-white duration-300 cursor-pointer active:scale-[0.98]">
                    PREVIOUS
                  </button>
                </Link>
                <div className="font-bold">
                  Duration: {formatDuration(selectedDuration)}
                </div>
                <div className="font-bold">
                  Total Cost: ${selectedCost.toFixed(2)}
                </div>
                <div className="text-sm max-w-xs md:text-left text-center">
                  Please note that this is only an estimate, and the actual cost
                  may be higher or lower depending on the actual scope of work
                  required.
                </div>
                <button
                  className="px-6 py-2 bg-white rounded border-2 border-gray-500 shadow-lg hover:bg-gray-500 text-black hover:text-white duration-300 cursor-pointer active:scale-[0.98]"
                  onClick={handleNextClick}
                >
                  Book Appointment
                </button>
              </div>

              <div className="hidden md:flex lg:hidden flex-col space-y-2 items-center relative">
                <div className="absolute -top-2 -right-6">
                  <button
                    className="text-sm bg-gray-600 w-5 h-5 rounded-full text-white"
                    onClick={() => setIsModalOpen(true)}
                  >
                    i
                  </button>
                </div>
                <div className="flex justify-between items-center w-full">
                  <Link to="/select-staff">
                    <button className="px-6 py-2 bg-white rounded border-2 border-gray-500 shadow-lg hover:bg-gray-500 text-black hover:text-white duration-300 cursor-pointer active:scale-[0.98]">
                      PREVIOUS
                    </button>
                  </Link>
                  <div className="font-bold mx-4">
                    Duration: {formatDuration(selectedDuration)}
                  </div>
                  <div className="font-bold mx-4">
                    Total Cost: ${selectedCost.toFixed(2)}
                  </div>
                  <button
                    className="px-6 py-2 bg-white rounded border-2 border-gray-500 shadow-lg hover:bg-gray-500 text-black hover:text-white duration-300 cursor-pointer active:scale-[0.98]"
                    onClick={handleNextClick}
                  >
                    Book Appointment
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:hidden space-y-4 items-center">
                <div className="flex items-center space-x-4">
                  {selectedServiceDetails.length > 0 ? (
                    <>
                      <p className="font-bold">
                        Duration: {formatDuration(selectedDuration)}
                      </p>
                      <p className="font-bold">
                        Estimated cost: ${selectedCost.toFixed(2)}
                      </p>
                    </>
                  ) : (
                    <p className="font-bold">Please select a service</p>
                  )}
                </div>
                <div className="flex space-x-4 w-full justify-center">
                  <Link
                    to="/select-staff"
                    className="block text-gray-600 hover:text-gray-900 w-full"
                  >
                    <button className="w-full px-6 py-2 bg-white rounded border-2 border-gray-500 shadow-lg hover:bg-gray-500 text-black hover:text-white duration-300 cursor-pointer active:scale-[0.98] text-sm">
                      PREVIOUS
                    </button>
                  </Link>
                  <button
                    className="w-full px-6 py-2 bg-white rounded border-2 border-gray-500 shadow-lg hover:bg-gray-500 text-black hover:text-white duration-300 cursor-pointer active:scale-[0.98] text-sm"
                    onClick={handleNextClick}
                  >
                    Book Appointment
                  </button>
                </div>
              </div>

              <button
                className="text-md absolute -top-2 right-3 md:hidden bg-gray-600 w-5 h-5 rounded-full text-white"
                onClick={() => setIsModalOpen(true)}
              >
                i
              </button>
            </div>
          </footer>

          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            Please note that this is only an estimate, and the actual cost may
            be higher or lower depending on the actual scope of work required.
          </Modal>
        </>
      )}
    </div>
  );
};

export default Calendar;
