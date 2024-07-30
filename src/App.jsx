import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { toast } from "react-toastify";
import RoutesConfig from "./RoutesConfig";
import "./index.css";
import {
  fetchHomePageData,
  fetchFooterData,
  setSelectedTenantId,
  setSelectedTenantName,
  fetchTenantSpecificData,
  setTenantCategories,
  setTenantServices,
} from "./store/slices/appSlice";

const App = () => {
  const dispatch = useDispatch();
  const {
    homePageData,
    homePageStatus,
    homePageError,
    footerStatus,
    selectedTenantId,
  } = useSelector((state) => state.app);

  useEffect(() => {
    if (homePageStatus === "idle") {
      dispatch(fetchHomePageData());
    }
  }, [dispatch, homePageStatus]);

  useEffect(() => {
    if (footerStatus === "idle" && selectedTenantId) {
      dispatch(fetchFooterData(selectedTenantId));
    }
  }, [dispatch, footerStatus, selectedTenantId]);

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
      dispatch(setTenantServices(homePageData.services || []));
    }
  }, [homePageData, dispatch]);

  useEffect(() => {
    if (homePageStatus === "failed") {
      toast.error(`Error: ${homePageError}`);
    }
  }, [homePageStatus, homePageError]);

  return (
    <HelmetProvider>
      <Router>
        <RoutesConfig />
      </Router>
    </HelmetProvider>
  );
};

export default App;
