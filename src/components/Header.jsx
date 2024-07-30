/* eslint-disable react/prop-types */
import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Nav from "./Nav";
import { IoIosArrowDropdown } from "react-icons/io";
import {
  setSelectedTenantId,
  setSelectedTenantName,
  setSelectedTenantColor,
} from "../store/slices/appSlice";

const Header = ({ toggleDarkMode, onStoreSelect }) => {
  const dispatch = useDispatch();
  const homePageData = useSelector((state) => state.app.homePageData);
  const tenants = homePageData?.tenants || [];
  const selectedTenantName = useSelector(
    (state) => state.app.selectedTenantName
  );
  const selectedTenantId = useSelector((state) => state.app.selectedTenantId);

  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Toggle the store dropdown menu
  const toggleStoreDropdown = () => {
    setStoreDropdownOpen(!storeDropdownOpen);
  };

  // Handle store selection and update the state accordingly
  const handleStoreSelect = (store, tenantId, tenantColor) => {
    dispatch(setSelectedTenantName(store));
    dispatch(setSelectedTenantId(tenantId));
    dispatch(setSelectedTenantColor(tenantColor));
    setStoreDropdownOpen(false);
    setIsOverlayVisible(false);
    onStoreSelect(tenantId, tenantColor);
  };

  // Close the dropdown when clicking outside of it
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setStoreDropdownOpen(false);
      setIsOverlayVisible(false);
    }
  };

  // Handle the book appointment button click with authentication and tenant selection checks
  const handleBookAppointmentClick = (event) => {
    const token = localStorage.getItem("access_token");
    const guestName = localStorage.getItem("guestName");
    const guestPhone = localStorage.getItem("guestPhone");

    if (!selectedTenantId) {
      event.preventDefault();
      setIsOverlayVisible(true);
      setStoreDropdownOpen(true);
      toast.info("Select a store to book an appointment", {
        hideProgressBar: true,
      });
      return;
    }

    if (!token && !(guestName && guestPhone)) {
      event.preventDefault();
      toast.info("Please login to book an appointment", {
        hideProgressBar: true,
      });
      navigate("/sign-up-code");
    } else {
      navigate("/book-appointment");
    }
  };

  // Close the overlay and dropdown menu
  const closeOverlay = () => {
    setIsOverlayVisible(false);
    setStoreDropdownOpen(false);
  };

  // Set up event listener for clicking outside the dropdown
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {isOverlayVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeOverlay}
        ></div>
      )}
      <header className="bg-white flex flex-col w-full px-3 relative">
        {isOverlayVisible && (
          <div className="absolute inset-0 bg-black bg-opacity-0 z-40"></div>
        )}
        <div className="container min-w-full px-3 shadow-lg relative z-50">
          <div className="flex justify-between items-center mb-4">
            <Nav
              toggleDarkMode={toggleDarkMode}
              selectedStore={selectedTenantName}
              storeDropdownOpen={storeDropdownOpen}
              businessLogo={homePageData?.business?.logo}
              onBookAppointmentClick={handleBookAppointmentClick}
              tenants={tenants}
              handleStoreSelect={handleStoreSelect}
              selectedTenantId={selectedTenantId} // Pass selectedTenantId as a prop
            />
          </div>
          <div
            className={`container w-60 border-t border-r border-l border-black -ml-1 -mb-4 block rounded ${
              location.pathname !== "/" ? "hidden mb-12" : ""
            }`}
          >
            <div
              className={`relative mb-4 ${isOverlayVisible ? "z-50" : ""}`}
              ref={dropdownRef}
            >
              <button
                className="flex justify-between items-center rounded w-full bg-white px-2 py-1 text-left text-sm shadow-md"
                onClick={toggleStoreDropdown}
              >
                <span>{selectedTenantName}</span>
                <IoIosArrowDropdown className="h-4 w-4" />
              </button>
              {storeDropdownOpen && (
                <ul className="absolute w-full bg-white border border-black mt-1 shadow-md text-xs z-50">
                  {tenants.map((tenant) => (
                    <li
                      key={tenant.id}
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() =>
                        handleStoreSelect(tenant.name, tenant.id, tenant.color)
                      }
                    >
                      {tenant.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
