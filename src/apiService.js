import axios from "axios";

const MAIN_URL = import.meta.env.VITE_MAIN_URL;

const APP_BASE_URL = `${MAIN_URL}/api`;

const axiosInstance = axios.create({
  baseURL: APP_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const ENDPOINTS = {
  HOME_PAGE: `${APP_BASE_URL}/home-page/et.robolons.com`,
  TENANT_SPECIFIC: (tenantId) =>
    `${APP_BASE_URL}/tenant-categories/${tenantId}`,
  FOOTER: (tenantId) =>
    tenantId
      ? `${APP_BASE_URL}/footer/et.robolons.com?tenant_id=${tenantId}`
      : `${APP_BASE_URL}/footer/et.robolons.com`,
  OTP: `${APP_BASE_URL}/otp`,
  VALIDATE_OTP: `${APP_BASE_URL}/validate-otp`,
  PROFILE: `${APP_BASE_URL}/profile`,
  UPDATE_PROFILE: `${APP_BASE_URL}/update-profile`,
  TENANT_STAFFS: (tenantId) => `${APP_BASE_URL}/tenant-staffs/${tenantId}`,
  BOOK_APPOINTMENT: `${APP_BASE_URL}/book-appointment`,
  APPOINTMENTS: `${APP_BASE_URL}/user-appointments`,
  CANCEL_APPOINTMENT: (appointmentId) =>
    `${APP_BASE_URL}/cancel-appointment/${appointmentId}`,
  TERMS_CONDITIONS: `${APP_BASE_URL}/terms-conditions`,
};

export { axiosInstance };
