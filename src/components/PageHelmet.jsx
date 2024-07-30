/* eslint-disable react/prop-types */
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const PageHelmet = () => {
  const location = useLocation();
  const pathName = location.pathname;

  // Determine page title based on the current path
  let pageTitle = "Home";
  if (pathName === "/view-more") {
    pageTitle = "Our Services";
  }
  if (pathName === "/book-appointment") {
    pageTitle = "Book Appointment";
  }
  if (pathName === "/contact-us") {
    pageTitle = "Contact Us";
  }
  if (pathName === "/select-staff") {
    pageTitle = "Select Staff";
  }
  if (pathName === "/auth-page") {
    pageTitle = "Login or Signup";
  }
  if (pathName === "/profile-page") {
    pageTitle = "Profile";
  }

  return (
    <Helmet>
      <title>{pageTitle} | Robolon</title>
    </Helmet>
  );
};

const PageHelmetProvider = ({ children }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

export { PageHelmet, PageHelmetProvider };
