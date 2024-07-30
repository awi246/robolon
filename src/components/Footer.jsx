/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Footer = ({ tenantId }) => {
  // State variables to manage footer data, loading state, and error
  const [footerData, setFooterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect to fetch footer data based on the tenantId
  useEffect(() => {
    setLoading(true); // Set loading to true whenever tenantId changes
    const localStorageKey = tenantId ? `footerData_${tenantId}` : "footerData";

    const fetchData = () => {
      const storedFooterData = localStorage.getItem(localStorageKey);

      if (storedFooterData) {
        try {
          const parsedFooterData = JSON.parse(storedFooterData);
          if (parsedFooterData) {
            console.log("Loaded data from localStorage:", parsedFooterData);
            setFooterData(parsedFooterData);
          } else {
            setError("No footer data available");
          }
        } catch (error) {
          console.error("Invalid JSON in localStorage:", error);
          localStorage.removeItem(localStorageKey);
          setError("Failed to load footer data");
        }
      } else {
        setError("No footer data found in localStorage");
      }
      setLoading(false);
    };

    // Simulate a delay before fetching the data
    const timer = setTimeout(fetchData, 1000); // Wait for 1 second before fetching the data

    return () => clearTimeout(timer); // Clear the timeout if the component unmounts or tenantId changes
  }, [tenantId]);

  // Small loader component for loading states
  const SmallLoader = () => (
    <div className="relative flex animate-pulse gap-2 p-2">
      <div className="flex-1">
        <div className="mb-1 h-3 w-3/5 rounded-lg bg-slate-400"></div>
        <div className="h-3 w-[90%] rounded-lg bg-slate-400"></div>
      </div>
    </div>
  );

  // Display error message using toast if an error occurs
  if (error) {
    toast.error(`Error: ${error}`);
  }

  return (
    <footer className="bg-white p-4 mt-8 shadow border-t border-black">
      <div className="container mx-auto flex flex-col lg:flex-row justify-around space-y-4 lg:space-y-0 lg:space-x-4">
        {/* About Us section */}
        <div className="bg-[#EFEFEF] p-4 rounded-lg w-full lg:w-1/4 shadow-lg">
          <h3 className="font-bold">About Us</h3>
          {loading ? (
            <>
              <SmallLoader />
              <SmallLoader />
            </>
          ) : (
            <p>{footerData?.about_us || "No information available"}</p>
          )}
        </div>
        {/* Working Hours section */}
        <div className="bg-[#EFEFEF] p-4 rounded-lg w-full lg:w-1/4 shadow-lg">
          <h3 className="font-bold">Working Hours</h3>
          {loading ? (
            <>
              <SmallLoader />
              <SmallLoader />
            </>
          ) : footerData?.working_hours &&
            footerData.working_hours.length > 0 ? (
            footerData.working_hours.map((hours, index) => (
              <p key={index}>
                {`${hours.day.charAt(0).toUpperCase() + hours.day.slice(1)}: ${
                  hours.start
                } - ${hours.end}`}
              </p>
            ))
          ) : (
            <p>No working hours available</p>
          )}
        </div>
        {/* Address section */}
        <div className="bg-[#EFEFEF] p-4 rounded-lg w-full lg:w-1/4 shadow-lg">
          <h3 className="font-bold">Address</h3>
          {loading ? (
            <>
              <SmallLoader />
              <SmallLoader />
            </>
          ) : (
            <p>{footerData?.address || "No address available"}</p>
          )}
        </div>
        {/* Contact Us section */}
        <div className="bg-[#EFEFEF] p-4 rounded-lg w-full lg:w-1/4 shadow-lg">
          <h3 className="font-bold">Contact Us</h3>
          {loading ? (
            <>
              <SmallLoader />
              <SmallLoader />
            </>
          ) : (
            <>
              <p>
                Email: {footerData?.contact_us?.email || "No email available"}
              </p>
              <p>
                Phone:{" "}
                {footerData?.contact_us?.phone_number ||
                  "No phone number available"}
              </p>
            </>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
