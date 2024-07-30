import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchTenantStaffs,
  setSelectedStaff,
  setSelectedServicesForBooking,
} from "../store/slices/appSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// eslint-disable-next-line react/prop-types
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

const SelectStaff = () => {
  const defaultStaff = { id: "any", name: "Any Staff", image: null };
  const [selected, setSelected] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();

  const {
    selectedServicesForBooking = [],
    tenantStaffs,
    selectedTenantId,
    selectedStaff,
    homePageData,
  } = useSelector((state) => state.app);

  useEffect(() => {
    if (selectedTenantId) {
      dispatch(fetchTenantStaffs(selectedTenantId));
    }
  }, [dispatch, selectedTenantId]);

  useEffect(() => {
    if (selectedStaff) {
      const index = tenantStaffs.findIndex(
        (staff) => staff.id === selectedStaff.id
      );
      setSelected(index);
    } else {
      setSelected(tenantStaffs.length); // Default to "Any Staff" if no staff is selected
    }
  }, [selectedStaff, tenantStaffs]);

  useEffect(() => {
    console.log(
      "Selected services for booking changed:",
      selectedServicesForBooking
    );
  }, [selectedServicesForBooking]);

  const handleCheckboxChange = (index) => {
    setSelected(index);
  };

  const handleNextClick = () => {
    if (selected !== null) {
      dispatch(setSelectedStaff(tenantStaffs[selected] || defaultStaff));
    }
  };

  const handlePreviousClick = () => {
    if (selected !== null) {
      dispatch(setSelectedStaff(tenantStaffs[selected] || defaultStaff));
    }
  };

  const handleRemoveService = (serviceId) => {
    if (selectedServicesForBooking.length === 1) {
      toast.error("You need at least one service to book an appointment.");
      return;
    }

    const updatedSelectedServices = selectedServicesForBooking.filter(
      (id) => id !== serviceId
    );

    const updatedServiceDetails =
      homePageData?.services && updatedSelectedServices.length > 0
        ? updatedSelectedServices
            .map((id) =>
              homePageData.services.find((service) => service.id === id)
            )
            .filter((service) => service !== undefined)
        : [];

    const updatedTotalDuration = updatedServiceDetails.reduce(
      (sum, service) => sum + parseInt(service.duration.split(" ")[0]),
      0
    );
    const updatedTotalPrice = updatedServiceDetails.reduce(
      (sum, service) => sum + parseFloat(service.price),
      0
    );

    dispatch(
      setSelectedServicesForBooking({
        services: updatedSelectedServices,
        duration: updatedTotalDuration,
        cost: updatedTotalPrice,
      })
    );
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

  useEffect(() => {
    console.log("Selected service details:", selectedServiceDetails);
  }, [selectedServiceDetails]);

  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}hr ${mins}min`;
  };

  const totalDuration = selectedServiceDetails.reduce(
    (sum, service) => sum + parseInt(service.duration.split(" ")[0]),
    0
  );
  const totalPrice = selectedServiceDetails.reduce(
    (sum, service) => sum + parseFloat(service.price),
    0
  );

  const allTenantStaffs =
    tenantStaffs.length > 0 ? [...tenantStaffs, defaultStaff] : [defaultStaff];

  return (
    <div className="flex flex-col min-h-screen">
      <ToastContainer />
      <main className="container mx-auto px-4 mt-6 py-4 flex-grow">
        <div>
          <div className="flex flex-wrap justify-between">
            {selectedServiceDetails.map((service) => (
              <div
                key={service.id}
                className="relative flex-1 text-center font-bold p-4 border m-2 rounded"
              >
                {service.name} <br /> {service.duration} - ${service.price}
                <button
                  onClick={() => handleRemoveService(service.id)}
                  className="absolute top-0 right-0 text-red-500 text-lg"
                  style={{ transform: "translate(50%, -50%)" }}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <hr className="my-6 border-t-1 border-black font-bold" />
          <div className="space-y-6 mt-12">
            {allTenantStaffs.map((staff, index) => (
              <div key={staff.id} className="flex justify-around items-center">
                <div className="flex items-center space-x-4 my-4">
                  <div className="text-2xl">
                    {staff.image ? (
                      <img
                        src={staff.image}
                        alt={staff.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      "👤"
                    )}
                  </div>
                  <div className="text-lg w-36">{staff.name}</div>
                </div>
                <input
                  type="checkbox"
                  className="form-checkbox h-6 w-6"
                  checked={selected === index}
                  onChange={() => handleCheckboxChange(index)}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
      <footer className="bg-gray-100 shadow py-4 overflow-auto w-[calc(100%-40px)]  rounded-lg m-5">
        <div className="container mx-auto px-4 relative">
          <div className="hidden lg:flex justify-between items-center">
            <Link to="/book-appointment">
              <button
                className="px-6 py-2 bg-white rounded border-2 border-gray-500 shadow-lg hover:bg-gray-500 text-black hover:text-white duration-300 cursor-pointer active:scale-[0.98]"
                onClick={handlePreviousClick}
              >
                PREVIOUS
              </button>
            </Link>
            <div className="font-bold">
              Duration: {formatDuration(totalDuration)}
            </div>
            <div className="font-bold">
              Total Cost: ${totalPrice.toFixed(2)}
            </div>
            <div className="text-sm max-w-xs md:text-left text-center">
              Please note that this is only an estimate, and the actual cost may
              be higher or lower depending on the actual scope of work required.
            </div>
            <Link to="/select-date">
              <button
                className="px-6 py-2 bg-white rounded border-2 border-gray-500 shadow-lg hover:bg-gray-500 text-black hover:text-white duration-300 cursor-pointer active:scale-[0.98]"
                onClick={handleNextClick}
              >
                SELECT TIME
              </button>
            </Link>
          </div>

          <div className="hidden md:flex lg:hidden flex-col space-y-2 items-center relative">
            <div className="flex justify-between items-center w-full">
              <Link to="/book-appointment">
                <button
                  className="px-6 py-2 bg-white rounded border-2 border-gray-500 shadow-lg hover:bg-gray-500 text-black hover:text-white duration-300 cursor-pointer active:scale-[0.98]"
                  onClick={handlePreviousClick}
                >
                  PREVIOUS
                </button>
              </Link>
              <div className="font-bold mx-4">
                Duration: {formatDuration(totalDuration)}
              </div>
              <div className="font-bold mx-4">
                Total Cost: ${totalPrice.toFixed(2)}
              </div>
              <Link to="/select-date">
                <button
                  className="px-6 py-2 bg-white rounded border-2 border-gray-500 shadow-lg hover:bg-gray-500 text-black hover:text-white duration-300 cursor-pointer active:scale-[0.98]"
                  onClick={handleNextClick}
                >
                  SELECT TIME
                </button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col md:hidden space-y-4 items-center">
            <div className="flex items-center space-x-4">
              {selectedServiceDetails.length > 0 ? (
                <>
                  <p className="font-bold">
                    Duration: {formatDuration(totalDuration)}
                  </p>
                  <p className="font-bold">
                    Estimated cost: ${totalPrice.toFixed(2)}
                  </p>
                </>
              ) : (
                <p className="font-bold">Please select a service</p>
              )}
            </div>
            <div className="flex space-x-4 w-full justify-center">
              <Link
                to="/book-appointment"
                className="block text-gray-600 hover:text-gray-900 w-full"
              >
                <button
                  className="w-full px-6 py-2 bg-white rounded border-2 border-gray-500 shadow-lg hover:bg-gray-500 text-black hover:text-white duration-300 cursor-pointer active:scale-[0.98] text-sm"
                  onClick={handlePreviousClick}
                >
                  PREVIOUS
                </button>
              </Link>
              <Link
                to="/select-date"
                className="block text-gray-600 hover:text-gray-900 w-full"
              >
                <button
                  className="w-full px-6 py-2 bg-white rounded border-2 border-gray-500 shadow-lg hover:bg-gray-500 text-black hover:text-white duration-300 cursor-pointer active:scale-[0.98] text-sm"
                  onClick={handleNextClick}
                >
                  SELECT TIME
                </button>
              </Link>
            </div>
          </div>

          <button
            className="text-md  absolute -top-2 right-3 md:hidden bg-gray-600 w-5 h-5 rounded-full text-white"
            onClick={() => setIsModalOpen(true)}
          >
            i
          </button>
        </div>
      </footer>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        Please note that this is only an estimate, and the actual cost may be
        higher or lower depending on the actual scope of work required.
      </Modal>
    </div>
  );
};

export default SelectStaff;
