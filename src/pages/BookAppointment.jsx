import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Category from "../components/Category";
import BookFooter from "../components/BookFooter";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import {
  fetchHomePageData,
  setServicesToShow,
  fetchFooterData,
  setTenantCategories,
  fetchTenantSpecificData,
  setSelectedServicesForBooking,
} from "../store/slices/appSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BookAppointment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    homePageData,
    homePageStatus,
    tenantCategories,
    selectedTenantId,
    servicesToShow: storeServicesToShow,
    selectedServicesForBooking,
  } = useSelector((state) => state.app);

  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState(
    selectedServicesForBooking || []
  );
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const servicesRef = useRef(null);

  const parseDuration = (duration) => {
    const [minutes] = duration.split(" ").map(Number);
    return minutes;
  };

  const parsePrice = (price) => {
    return parseFloat(price.replace("$", ""));
  };

  useEffect(() => {
    if (homePageStatus === "idle") {
      dispatch(fetchHomePageData());
    }
  }, [dispatch, homePageStatus]);

  useEffect(() => {
    if (homePageData) {
      dispatch(setTenantCategories(homePageData.categories || []));
      setServices(homePageData.services || []);
    }
  }, [homePageData, dispatch]);

  useEffect(() => {
    if (selectedTenantId) {
      dispatch(fetchTenantSpecificData(selectedTenantId)).then((response) => {
        const categories = response.payload.data || [];
        dispatch(setTenantCategories(categories));
        dispatch(fetchFooterData(selectedTenantId));
      });
    }
  }, [selectedTenantId, dispatch]);

  const currentCategories = Array.isArray(tenantCategories)
    ? tenantCategories
    : [];
  const currentServices = Array.isArray(services) ? services : [];

  const tenantCategoryIds = currentCategories.map((category) => category.id);

  const filteredVisibleServices =
    selectedCategoryId === "all"
      ? currentServices.filter((service) =>
          tenantCategoryIds.includes(service.category_id)
        )
      : currentServices.filter(
          (service) =>
            service.category_id === selectedCategoryId &&
            tenantCategoryIds.includes(service.category_id)
        );

  useEffect(() => {
    if (
      JSON.stringify(storeServicesToShow) !==
      JSON.stringify(filteredVisibleServices)
    ) {
      dispatch(setServicesToShow(filteredVisibleServices));
    }
  }, [dispatch, filteredVisibleServices, storeServicesToShow]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategoryId(categoryId ? categoryId : "all");
  };

  const handleServiceSelect = (serviceId) => {
    setSelectedServices((prevSelectedServices) =>
      prevSelectedServices.includes(serviceId)
        ? prevSelectedServices.filter((id) => id !== serviceId)
        : [...prevSelectedServices, serviceId]
    );
  };

  const selectedServiceDetails = selectedServices
    .map((id) => currentServices.find((service) => service.id === id))
    .filter((service) => service !== undefined);

  const totalDuration = selectedServiceDetails.reduce(
    (sum, service) => sum + parseDuration(service.duration),
    0
  );
  const totalPrice = selectedServiceDetails.reduce(
    (sum, service) => sum + parsePrice(service.price),
    0
  );

  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}hr ${mins}min`;
  };

  const handleNextClick = () => {
    if (selectedServices.length === 0) {
      toast.error("Please select at least one service to continue");
    } else {
      dispatch(
        setSelectedServicesForBooking({
          services: selectedServices,
          duration: totalDuration,
          cost: totalPrice,
        })
      );
      navigate("/select-staff");
    }
  };

  const checkScroll = () => {
    if (servicesRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = servicesRef.current;
      setCanScrollUp(scrollTop > 0);
      setCanScrollDown(scrollTop + clientHeight < scrollHeight);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // 1 second delay
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && homePageStatus !== "loading") {
      checkScroll();
    }
  }, [isLoading, homePageStatus]);

  useEffect(() => {
    const ref = servicesRef.current;
    if (ref) {
      ref.addEventListener("scroll", checkScroll);
    }
    return () => {
      if (ref) {
        ref.removeEventListener("scroll", checkScroll);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSkeleton />
      </div>
    );
  }

  if (homePageStatus === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <ToastContainer />
      <main className="flex-grow container mx-auto px-4 py-4 flex flex-col">
        <Category
          items={currentCategories}
          onCategorySelect={handleCategorySelect}
          selectedCategoryId={selectedCategoryId}
        />
        <div
          className="mt-4 flex-grow relative"
          style={{ maxHeight: "calc(100vh - 330px)" }}
        >
          <div className="sticky top-0 bg-white z-10 shadow-md">
            <div className="flex justify-between px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="flex-1 flex justify-center items-center">
                Service
              </div>
              <div className="flex-1 flex justify-center items-center">
                Duration
              </div>
              <div className="flex-1 flex justify-center items-center">
                Price
              </div>
              <div className="flex-1 flex justify-center items-center relative">
                Select
              </div>
            </div>
          </div>
          <div
            className="overflow-y-auto flex-grow border-t"
            ref={servicesRef}
            style={{ maxHeight: "calc(100vh - 370px)" }}
          >
            <div className="min-w-full divide-y divide-gray-200">
              {filteredVisibleServices.map((service) => (
                <div
                  key={service.id}
                  className="flex justify-between items-center bg-white px-6 py-5 text-sm lg:text-base"
                >
                  <div className="flex-1 flex justify-center items-center text-center">
                    {service.name}
                  </div>
                  <div className="flex-1 flex justify-center items-center text-center">
                    {service.duration}
                  </div>
                  <div className="flex-1 flex justify-center items-center text-center">
                    ${parsePrice(service.price).toFixed(2)}
                  </div>
                  <div className="flex-1 flex justify-center items-center text-center">
                    <input
                      type="checkbox"
                      className="form-checkbox w-5 h-5"
                      onChange={() => handleServiceSelect(service.id)}
                      checked={selectedServices.includes(service.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {(canScrollUp || canScrollDown) && (
            <div className="flex justify-center mt-4 absolute bottom-0 left-0 right-0">
              {canScrollUp && (
                <FaArrowUp
                  className="text-gray-400 cursor-pointer mx-2"
                  onClick={() => {
                    if (servicesRef.current) {
                      servicesRef.current.scrollBy({
                        top: -servicesRef.current.clientHeight,
                        behavior: "smooth",
                      });
                    }
                  }}
                />
              )}
              {canScrollDown && (
                <FaArrowDown
                  className="text-gray-400 cursor-pointer mx-2"
                  onClick={() => {
                    if (servicesRef.current) {
                      servicesRef.current.scrollBy({
                        top: servicesRef.current.clientHeight,
                        behavior: "smooth",
                      });
                    }
                  }}
                />
              )}
            </div>
          )}
        </div>
      </main>
      <BookFooter
        selectedServices={selectedServices}
        totalDuration={formatDuration(totalDuration)}
        totalPrice={totalPrice.toFixed(2)}
        onNextClick={handleNextClick}
      />
    </div>
  );
};

export default BookAppointment;
