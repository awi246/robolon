import { useState } from "react";

const BookingComponent = () => {
  const [isGuest, setIsGuest] = useState(true);

  return (
    <div className="container mx-auto p-4 bg-white rounded-lg shadow-lg h-screen flex flex-col">
      <div className="flex justify-center mb-4 border-b">
        <div
          onClick={() => setIsGuest(true)}
          className={`flex-1 p-4 text-center font-bold cursor-pointer ${
            isGuest ? "bg-gray-200" : "bg-white"
          }`}
        >
          Book as Guest
        </div>
        <div
          onClick={() => setIsGuest(false)}
          className={`flex-1 p-4 text-center font-bold cursor-pointer ${
            !isGuest ? "bg-gray-200" : "bg-white"
          }`}
        >
          Login
        </div>
      </div>
      {isGuest ? (
        <div className="p-4 h-full flex flex-col justify-center">
          <div className="mb-4 p-4 border rounded text-center mx-auto">
            Full Name
          </div>
          <div className="mb-4 p-4 border rounded text-center mx-auto">
            Phone Mobile
          </div>
          <div className="mb-4 p-4 border rounded text-center mx-auto">
            Email Address
          </div>
          <div className="p-4 bg-gray-200 border rounded text-center font-bold mx-auto">
            Confirm My Appointment
          </div>
        </div>
      ) : (
        <div className="p-4 h-full flex flex-col justify-center">
          <div className="grid grid-rows-4 gap-4">
            <div className="p-4 border rounded text-center mx-auto">
              Phone Number
            </div>
            <div className="p-4 border rounded text-center mx-auto">
              OPT Code
            </div>
            <div className="p-4 border rounded text-center mx-auto">
              Send Code
            </div>
            <div className="p-4 bg-gray-200 border rounded text-center font-bold mx-auto">
              Login and Confirm
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingComponent;
