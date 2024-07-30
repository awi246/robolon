/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";

const BookFooter = ({
  selectedServices,
  totalDuration,
  totalPrice,
  onNextClick,
}) => {
  // Determine if there are any selected services
  const hasSelectedServices = selectedServices.length > 0;

  return (
    <footer className="bg-gray-100 shadow py-4 overflow-auto w-[calc(100%-40px)] fixed bottom-0 z-10 rounded-lg m-5">
      <div className="container mx-auto px-4">
        {/* For screens greater than 768px */}
        <div className="hidden md:flex justify-between items-center">
          <Link to="/" className="block text-gray-600 hover:text-gray-900">
            <button className="px-6 py-2 bg-white rounded border-2 border-gray-500 shadow-lg hover:bg-gray-500 text-black hover:text-white duration-300 cursor-pointer active:scale-[0.98]">
              PREVIOUS
            </button>
          </Link>

          <div className="flex items-center space-x-4">
            {hasSelectedServices ? (
              <>
                <p className="font-bold">Duration: {totalDuration}</p>
                <p className="font-bold">Estimated cost: ${totalPrice}</p>
              </>
            ) : (
              <p className="font-bold">Please select a service</p>
            )}
          </div>

          <button
            onClick={onNextClick}
            className="px-6 py-2 bg-white rounded border-2 border-gray-500 shadow-lg hover:bg-gray-500 text-black hover:text-white duration-300 cursor-pointer active:scale-[0.98]"
          >
            SELECT STAFF
          </button>
        </div>

        {/* For screens less than 768px */}
        <div className="flex flex-col md:hidden space-y-4 items-center">
          <div className="flex items-center space-x-4">
            {hasSelectedServices ? (
              <>
                <p className="font-bold">Duration: {totalDuration}</p>
                <p className="font-bold">Estimated cost: ${totalPrice}</p>
              </>
            ) : (
              <p className="font-bold">Please select a service</p>
            )}
          </div>

          <div className="flex space-x-4 w-full justify-center">
            <Link
              to="/"
              className="block text-gray-600 hover:text-gray-900 w-full"
            >
              <button className="w-full px-6 py-2 bg-white rounded border-2 border-gray-500 shadow-lg hover:bg-gray-500 text-black hover:text-white duration-300 cursor-pointer active:scale-[0.98]">
                PREVIOUS
              </button>
            </Link>

            <button
              onClick={onNextClick}
              className="w-full px-6 py-2 bg-white rounded border-2 border-gray-500 shadow-lg hover:bg-gray-500 text-black hover:text-white duration-300 cursor-pointer active:scale-[0.98]"
            >
              SELECT STAFF
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BookFooter;
