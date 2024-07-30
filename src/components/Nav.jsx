/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { RiArrowDropDownLine } from "react-icons/ri";
import { IoMdArrowDropdownCircle } from "react-icons/io";
import { BiLogOutCircle } from "react-icons/bi";
import { IoPersonCircleOutline } from "react-icons/io5";
import {
  FaCalendarAlt,
  FaCut,
  FaPhoneAlt,
  FaSignInAlt,
  FaHome,
} from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import "./../styles/DarkModeAnimation.css";

const Nav = ({
  toggleDarkMode,
  selectedStore,
  tenantColor,
  storeDropdownOpen,
  businessLogo,
  onBookAppointmentClick,
  tenants,
  handleStoreSelect,
  selectedTenantId,
}) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isBurgerMenuOpen, setIsBurgerMenuOpen] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileProfileDropdownOpen, setIsMobileProfileDropdownOpen] =
    useState(false);

  const profileDropdownRef = useRef(null);
  const burgerMenuRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(location.pathname);

  // Check if the user is logged in by checking for an access token in local storage
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsUserLoggedIn(!!token);
  }, []);

  // Toggle the profile dropdown menu visibility
  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Toggle the mobile profile dropdown menu visibility
  const toggleMobileProfileDropdown = () => {
    setIsMobileProfileDropdownOpen(!isMobileProfileDropdownOpen);
  };

  // Toggle the burger menu visibility for mobile view
  const toggleBurgerMenu = () => {
    setIsBurgerMenuOpen(!isBurgerMenuOpen);
  };

  // Close all dropdown menus when clicking outside of them
  const handleClickOutside = (event) => {
    if (
      profileDropdownRef.current &&
      !profileDropdownRef.current.contains(event.target)
    ) {
      setIsProfileDropdownOpen(false);
    }
    if (
      burgerMenuRef.current &&
      !burgerMenuRef.current.contains(event.target)
    ) {
      setIsBurgerMenuOpen(false);
      setIsMobileProfileDropdownOpen(false);
    }
  };

  // Set up event listener for clicking outside dropdown menus
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update selected item based on the current location
  useEffect(() => {
    setSelectedItem(location.pathname);
  }, [location]);

  // Handle logout button click by showing the confirmation modal
  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  // Confirm the logout action by removing the access token and updating the state
  const handleLogoutConfirm = () => {
    localStorage.removeItem("access_token");
    setIsUserLoggedIn(false);
    setIsLogoutModalOpen(false);
    navigate("/");
  };

  // Cancel the logout action by closing the confirmation modal
  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false);
  };

  // If selected store or business logo is not available, return null
  if (!selectedStore || !businessLogo) {
    return null;
  }

  // Handle home button click to navigate to home and refresh the page
  const handleHomeClick = () => {
    navigate("/");
    window.location.reload();
  };

  return (
    <nav
      className="flex items-center justify-between w-full relative"
      style={{ color: tenantColor }}
    >
      {/* Logo and store name */}
      <div className="flex items-center space-x-4">
        <Link to="/" onClick={handleHomeClick}>
          <img src={businessLogo} alt="Business Logo" className="h-8" />
        </Link>
        <Link to="/" onClick={handleHomeClick}>
          <span
            className={`text-sm font-bold ${
              location.pathname !== "/" ? "text-2xl" : ""
            }`}
          >
            {selectedStore}
          </span>
        </Link>
      </div>

      {/* Desktop navigation links */}
      <div
        className={`hidden lg:flex items-center space-x-6 pt-8 ${
          location.pathname !== "/" ? "pb-8" : ""
        }`}
      >
        <button
          className={`text-sm ${
            selectedItem === "/" ? "text-gray-500" : "hover:text-gray-700"
          } flex items-center transition-colors duration-200`}
          onClick={handleHomeClick}
        >
          <FaHome className="mr-1" /> Home
        </button>
        <Link
          to={selectedTenantId ? "/book-appointment" : "#"}
          className={`text-sm ${
            selectedItem === "/book-appointment"
              ? "text-gray-500"
              : "hover:text-gray-700"
          } flex items-center transition-colors duration-200`}
          onClick={onBookAppointmentClick}
        >
          <FaCalendarAlt className="mr-1" /> Book Appointment
        </Link>
        <Link
          to="/view-more"
          className={`text-sm ${
            selectedItem === "/view-more"
              ? "text-gray-500"
              : "hover:text-gray-700"
          } flex items-center transition-colors duration-200`}
          onClick={() => setSelectedItem("/view-more")}
        >
          <FaCut className="mr-1" /> Our Services
        </Link>
        <Link
          to="/contact-us"
          className={`text-sm ${
            selectedItem === "/contact-us"
              ? "text-gray-500"
              : "hover:text-gray-700"
          } flex items-center transition-colors duration-200`}
          onClick={() => setSelectedItem("/contact-us")}
        >
          <FaPhoneAlt className="mr-1" /> Contact Us
        </Link>
        {!isUserLoggedIn && (
          <Link
            to="/sign-up-code"
            className={`text-sm ${
              selectedItem === "/sign-up-code"
                ? "text-gray-500"
                : "hover:text-gray-700"
            } flex items-center transition-colors duration-200`}
            onClick={() => setSelectedItem("/sign-up-code")}
          >
            <FaSignInAlt className="mr-1" /> Customer Sign In
          </Link>
        )}

        {/* Profile dropdown */}
        <div
          className="relative flex items-center space-x-2"
          ref={profileDropdownRef}
        >
          <button
            onClick={toggleProfileDropdown}
            className={`flex items-center text-sm ${
              selectedItem === "/profile-page"
                ? "text-gray-500"
                : "hover:text-gray-700"
            } transition-colors duration-200`}
          >
            <IoMdArrowDropdownCircle size={20} />
          </button>
          {isProfileDropdownOpen && (
            <div className="absolute right-0 top-6 mt-2 bg-white shadow-lg rounded-lg z-50">
              <Link to="/profile-page">
                <button
                  className="flex items-center px-3 py-1 text-sm hover:text-gray-700 transition-colors duration-200"
                  onClick={() => setSelectedItem("/profile-page")}
                >
                  <IoPersonCircleOutline className="mr-1" size={20} /> Profile
                </button>
              </Link>
              {isUserLoggedIn && (
                <button
                  className="flex items-center px-3 py-1 text-sm hover:text-gray-700 transition-colors duration-200"
                  onClick={handleLogoutClick}
                >
                  <BiLogOutCircle className="mr-1" size={20} /> Logout
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile burger menu */}
      <div className="relative lg:hidden" ref={burgerMenuRef}>
        <button
          onClick={toggleBurgerMenu}
          className="text-sm hover:text-gray-700 transition-colors duration-200"
        >
          <GiHamburgerMenu size={20} />
        </button>
        {isBurgerMenuOpen && (
          <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg z-50 w-48">
            <Link
              to={selectedTenantId ? "/book-appointment" : "#"}
              className={`block px-3 py-1 text-sm ${
                selectedItem === "/book-appointment"
                  ? "text-gray-700"
                  : "hover:text-gray-700"
              } transition-colors duration-200`}
              onClick={onBookAppointmentClick}
            >
              <FaCalendarAlt className="mr-1" /> Book Appointment
            </Link>
            <Link
              to="/view-more"
              className={`block px-3 py-1 text-sm ${
                selectedItem === "/view-more"
                  ? "text-gray-700"
                  : "hover:text-gray-700"
              } transition-colors duration-200`}
              onClick={() => setSelectedItem("/view-more")}
            >
              <FaCut className="mr-1" /> Our Services
            </Link>
            <Link
              to="/contact-us"
              className={`block px-3 py-1 text-sm ${
                selectedItem === "/contact-us"
                  ? "text-gray-700"
                  : "hover:text-gray-700"
              } transition-colors duration-200`}
              onClick={() => setSelectedItem("/contact-us")}
            >
              <FaPhoneAlt className="mr-1" /> Contact Us
            </Link>
            {!isUserLoggedIn && (
              <Link
                to="/sign-up-code"
                className={`block px-3 py-1 text-sm ${
                  selectedItem === "/sign-up-code"
                    ? "text-gray-700"
                    : "hover:text-gray-700"
                } transition-colors duration-200`}
                onClick={() => setSelectedItem("/sign-up-code")}
              >
                <FaSignInAlt className="mr-1" /> Customer Sign In
              </Link>
            )}
            <button
              onClick={toggleMobileProfileDropdown}
              className="block w-full text-left px-3 py-1 text-sm hover:text-gray-700 transition-colors duration-200"
            >
              <IoMdArrowDropdownCircle size={20} /> Profile
            </button>
            {isMobileProfileDropdownOpen && (
              <div className="mt-1 bg-white shadow-lg rounded-lg z-50 w-48">
                <Link to="/profile-page">
                  <button
                    className="flex items-center px-3 py-1 text-sm hover:text-gray-700 transition-colors duration-200"
                    onClick={() => setSelectedItem("/profile-page")}
                  >
                    <IoPersonCircleOutline className="mr-1" size={20} /> Profile
                  </button>
                </Link>
                {isUserLoggedIn && (
                  <button
                    className="flex items-center px-3 py-1 text-sm hover:text-gray-700 transition-colors duration-200"
                    onClick={handleLogoutClick}
                  >
                    <BiLogOutCircle className="mr-1" size={20} /> Logout
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Logout confirmation modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="text-lg mb-4">Do you want to log out?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleLogoutCancel}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors duration-200"
              >
                No
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Nav;
