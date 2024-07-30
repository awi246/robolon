/* eslint-disable react/prop-types */
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({
  element: Element,
  condition,
  redirectPath,
  ...rest
}) => {
  // Use the provided condition to determine if the route is valid
  const isValid = useSelector(condition);

  // If the condition is met, render the provided element with the rest of the props
  // Otherwise, redirect to the specified path
  return isValid ? <Element {...rest} /> : <Navigate to={redirectPath} />;
};

export default PrivateRoute;
