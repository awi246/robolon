import { useEffect, useState } from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import LoadingSkeleton from "../components/LoadingSkeleton";

const ContactUs = () => {
  const [footerData, setFooterData] = useState({});
  const [footerStatus, setFooterStatus] = useState("loading");

  useEffect(() => {
    try {
      // Retrieve and parse all keys from local storage
      const storedData = {};
      for (const key in localStorage) {
        if (key.startsWith("footerData")) {
          storedData[key] = JSON.parse(localStorage.getItem(key));
        }
      }
      console.log("Stored data from localStorage:", storedData);

      setFooterData(storedData);
      setFooterStatus("loaded");
    } catch (error) {
      console.error("Error retrieving data from local storage:", error);
      setFooterStatus("error");
    }
  }, []);

  if (footerStatus === "loading")
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSkeleton />
      </div>
    );

  // Separate data into primary and other footer data
  const primaryFooterData = footerData["footerData"];
  const otherFooterData = Object.keys(footerData).filter(
    (key) => key !== "footerData"
  );

  return (
    <div className="flex flex-col min-h-screen">
      <main className="container mx-auto px-4 py-4 flex-grow">
        <div className="container mx-auto px-4 py-8 border border-stone-700 mt-[1%] rounded">
          <h1 className="text-3xl font-bold text-center mb-8">Contact Us</h1>
          <div className="flex flex-col items-center space-y-8 mt-14">
            {primaryFooterData && (
              <div className="flex flex-col items-center bg-white p-6 shadow-lg rounded-lg w-full max-w-md mb-8">
                <h2 className="text-xl font-semibold mb-4">
                  Primary Contact Information
                </h2>
                <div className="flex flex-col items-start">
                  {primaryFooterData.contact_us && (
                    <>
                      <p className="flex items-center mb-2">
                        <FaEnvelope className="mr-3" /> Email:{" "}
                        {primaryFooterData.contact_us.email}
                      </p>
                      <p className="flex items-center mb-2">
                        <FaPhone className="mr-3" /> Phone:{" "}
                        {primaryFooterData.contact_us.phone_number}
                      </p>
                    </>
                  )}
                  {primaryFooterData.address && (
                    <p className="flex items-center mb-2">
                      <FaMapMarkerAlt className="mr-4" /> Address:{" "}
                      {primaryFooterData.address}
                    </p>
                  )}
                </div>
              </div>
            )}
            <div
              className={`grid gap-8 ${
                otherFooterData.length === 1
                  ? "grid-cols-1"
                  : "grid-cols-1 sm:grid-cols-2"
              }`}
            >
              {otherFooterData.map((key, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center bg-white p-6 shadow-lg rounded-lg w-full"
                >
                  <h2 className="text-xl font-semibold mb-4">
                    Contact Information {index + 2}
                  </h2>
                  <div className="flex flex-col items-start">
                    {footerData[key].contact_us && (
                      <>
                        <p className="flex items-center mb-2">
                          <FaEnvelope className="mr-3" /> Email:{" "}
                          {footerData[key].contact_us.email}
                        </p>
                        <p className="flex items-center mb-2">
                          <FaPhone className="mr-3" /> Phone:{" "}
                          {footerData[key].contact_us.phone_number}
                        </p>
                      </>
                    )}
                    {footerData[key].address && (
                      <p className="flex items-center mb-2">
                        <FaMapMarkerAlt className="mr-4" /> Address:{" "}
                        {footerData[key].address}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactUs;
