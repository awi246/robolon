import { Route, Routes, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import Header from "./components/Header";
import { PageHelmet } from "./components/PageHelmet";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "./components/LoadingSkeleton";
import PrivateRoute from "./components/PrivateRoute";

// Lazy loading the components for better performance and code splitting
const Home = lazy(() => import("./pages/Home"));
const ViewMore = lazy(() => import("./pages/ViewMore"));
const BookAppointment = lazy(() => import("./pages/BookAppointment"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const SelectStaff = lazy(() => import("./pages/SelectStaff"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const Calendar = lazy(() => import("./pages/Calendar"));
const SignUpCode = lazy(() => import("./pages/SignUpCode"));
const SignUpCodeConfirm = lazy(() => import("./pages/SignUpCodeConfirm"));

const RoutesConfig = () => {
  const location = useLocation();

  const isBookAppointmentAllowed = () => {
    const token = localStorage.getItem("access_token");
    const guestName = localStorage.getItem("guestName");
    const guestNumber = localStorage.getItem("guestPhone");
    return token || (guestName && guestNumber);
  };

  return (
    <>
      <PageHelmet />
      {/* Render the header on all pages except the home page */}
      {location.pathname !== "/" && <Header />}
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="view-more" element={<ViewMore />} />
          <Route
            path="book-appointment"
            element={
              <PrivateRoute
                element={BookAppointment}
                condition={isBookAppointmentAllowed}
                redirectPath="/sign-up-code"
              />
            }
          />
          <Route path="contact-us" element={<ContactUs />} />
          <Route
            path="select-staff"
            element={
              <PrivateRoute
                element={SelectStaff}
                condition={(state) =>
                  state.app.selectedServicesForBooking.length > 0
                }
                redirectPath="/book-appointment"
              />
            }
          />
          <Route
            path="select-date"
            element={
              <PrivateRoute
                element={Calendar}
                condition={(state) =>
                  state.app.selectedServicesForBooking.length > 0
                }
                redirectPath="/book-appointment"
              />
            }
          />
          <Route path="profile-page" element={<ProfilePage />} />
          <Route path="sign-up-code" element={<SignUpCode />} />
          <Route
            path="sign-up-code-confirm"
            element={
              <PrivateRoute
                element={SignUpCodeConfirm}
                condition={(state) => state.app.phoneNumber}
                redirectPath="/"
              />
            }
          />
          {/* Fallback route for undefined paths */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Suspense>
      <ToastContainer />
    </>
  );
};

export default RoutesConfig;
