import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Category from "../components/Category";
import Services from "../components/Services";
import Offers from "../components/Offers";
import { Link } from "react-router-dom";
import {
  fetchHomePageData,
  setTenantCategories,
  setTenantServices,
  fetchTenantSpecificData,
  fetchFooterData,
  setSelectedTenantId,
  setSelectedTenantName,
  setServicesToShow,
} from "../store/slices/appSlice";
import notFoundImage from "../assets/notFound1.gif";
import Footer from "../components/Footer";
import LoadingSkeleton from "../components/LoadingSkeleton";
import Header from "../components/Header";

const Home = () => {
  const dispatch = useDispatch();
  const {
    homePageData,
    tenantCategories,
    homePageStatus,
    homePageError,
    footerStatus,
    selectedTenantId,
    servicesToShow: storeServicesToShow,
  } = useSelector((state) => state.app);

  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [numServicesToShow, setNumServicesToShow] = useState(8);

  // Fetch home page data on initial load
  useEffect(() => {
    if (homePageStatus === "idle") {
      dispatch(fetchHomePageData());
    }
  }, [dispatch, homePageStatus]);

  // Fetch footer data when selected tenant changes
  useEffect(() => {
    if (footerStatus === "idle") {
      dispatch(fetchFooterData(selectedTenantId));
    }
  }, [dispatch, footerStatus, selectedTenantId]);

  // Process home page data when it's available and setting up default tenant settings
  useEffect(() => {
    if (homePageData) {
      const defaultTenant = homePageData.tenants?.[0];
      if (defaultTenant) {
        dispatch(setSelectedTenantId(defaultTenant.id));
        dispatch(setSelectedTenantName(defaultTenant.name));
        dispatch(fetchTenantSpecificData(defaultTenant.id));
        dispatch(fetchFooterData(defaultTenant.id));
      }
      dispatch(setTenantCategories(homePageData.categories || []));
      setServices(homePageData.services || []);
    }
  }, [homePageData, dispatch]);

  // Show error toast if home page data fetch fails
  useEffect(() => {
    if (homePageStatus === "failed") {
      toast.error(`Error: ${homePageError}`);
    }
  }, [homePageStatus, homePageError]);

  // Handle store selection and fetch relevant data of that selected tenant
  const handleStoreSelect = async (tenantId) => {
    dispatch(setSelectedTenantId(tenantId));
    if (tenantId) {
      const categories = await dispatch(
        fetchTenantSpecificData(tenantId)
      ).unwrap();
      dispatch(setTenantCategories(categories.data || []));
      dispatch(fetchFooterData(tenantId));
    } else {
      dispatch(setTenantCategories([]));
      dispatch(setTenantServices([]));
    }
  };

  // Prepare categories and services
  const currentCategories = Array.isArray(tenantCategories)
    ? tenantCategories
    : [];
  const currentServices = Array.isArray(services) ? services : [];

  const tenantCategoryIds = currentCategories.map((category) => category.id);

  // Filter services based on selected category
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

  // Determine number of services to show based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setNumServicesToShow(2);
      } else if (window.innerWidth < 768) {
        setNumServicesToShow(4);
      } else if (window.innerWidth < 1024) {
        setNumServicesToShow(3);
      } else {
        setNumServicesToShow(8);
      }
    };

    window.addEventListener("resize", handleResize);

    // Initial check
    handleResize();

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Show the services filtered by filtering
  const servicesToShow = filteredVisibleServices.slice(0, numServicesToShow);

  // Update visible services if they change
  useEffect(() => {
    if (
      JSON.stringify(storeServicesToShow) !==
      JSON.stringify(filteredVisibleServices)
    ) {
      dispatch(setServicesToShow(filteredVisibleServices));
    }
  }, [dispatch, filteredVisibleServices, storeServicesToShow]);

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategoryId(categoryId ? categoryId : "all");
  };

  // Initial loading state with delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // 1 second delay
    return () => clearTimeout(timer);
  }, []);

  // Display loading skeleton if data is still loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSkeleton />
      </div>
    );
  }

  // Display loading skeleton if home page data is still loading
  if (homePageStatus === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSkeleton />
      </div>
    );
  }

  // Main component rendering
  return (
    <div className="flex flex-col min-h-screen">
      <Header onStoreSelect={handleStoreSelect} />
      <Offers />
      <main className="container mx-auto p-4 flex-grow flex flex-col">
        <Category
          items={currentCategories}
          onCategorySelect={handleCategorySelect}
        />
        <div className="border p-4 pb-8 w-full flex flex-col relative flex-grow shadow-lg">
          {servicesToShow.length > 0 ? (
            <Services items={servicesToShow} />
          ) : (
            <div className="flex justify-center items-center flex-grow">
              <img src={notFoundImage} alt="Not Found" className="" />
            </div>
          )}
          {filteredVisibleServices.length > numServicesToShow && (
            <Link
              to="/view-more"
              className="text-blue-500 absolute bottom-2 right-4"
            >
              View More
            </Link>
          )}
        </div>
      </main>
      <Footer tenantId={selectedTenantId} />
    </div>
  );
};

export default Home;
