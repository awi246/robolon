import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance, ENDPOINTS } from "../../apiService";

// Async thunk for fetching home page data
export const fetchHomePageData = createAsyncThunk(
  "app/fetchHomePageData",
  async () => {
    const response = await axiosInstance.get(ENDPOINTS.HOME_PAGE, {
      headers: { source: "web" },
    });
    return response.data;
  }
);

// Async thunk for fetching tenant-specific data
export const fetchTenantSpecificData = createAsyncThunk(
  "app/fetchTenantSpecificData",
  async (tenantId) => {
    const response = await axiosInstance.get(
      ENDPOINTS.TENANT_SPECIFIC(tenantId),
      { headers: { source: "web" } }
    );
    return response.data;
  }
);

// Async thunk for fetching footer data with caching
export const fetchFooterData = createAsyncThunk(
  "app/fetchFooterData",
  async (tenantId) => {
    const localStorageKey = tenantId ? `footerData_${tenantId}` : "footerData";
    const storedFooterData = localStorage.getItem(localStorageKey);

    if (storedFooterData) {
      return JSON.parse(storedFooterData);
    } else {
      const url = ENDPOINTS.FOOTER(tenantId);
      const response = await axiosInstance.get(url, {
        headers: { source: "web" },
      });
      localStorage.setItem(localStorageKey, JSON.stringify(response.data.data));
      return response.data;
    }
  }
);

// Async thunk for sending OTP
export const sendOtp = createAsyncThunk(
  "app/sendOtp",
  async (phone, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.OTP,
        { phone },
        { headers: { source: "web" } }
      );
      return response.data;
    } catch (err) {
      if (err.response) {
        return rejectWithValue(err.response.data);
      }
      throw err;
    }
  }
);

// Async thunk for validating OTP
export const validateOtp = createAsyncThunk(
  "app/validateOtp",
  async ({ phone, otp }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.VALIDATE_OTP,
        { phone, otp },
        { headers: { source: "web" } }
      );
      return response.data;
    } catch (err) {
      if (err.response) {
        return rejectWithValue(err.response.data);
      }
      throw err;
    }
  }
);

// Async thunk for fetching profile data
export const fetchProfile = createAsyncThunk("app/fetchProfile", async () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No access token found");
  }
  const response = await axiosInstance.get(ENDPOINTS.PROFILE, {
    headers: {
      Authorization: `Bearer ${token}`,
      source: "web",
    },
  });
  return response.data;
});

// Async thunk for updating profile data (POST request)
export const updateProfile = createAsyncThunk(
  "app/updateProfile",
  async (profileData, { rejectWithValue }) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No access token found");
    }
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.UPDATE_PROFILE,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            source: "web",
          },
        }
      );
      return response.data;
    } catch (err) {
      if (err.response) {
        return rejectWithValue(err.response.data);
      }
      throw err;
    }
  }
);

// Async thunk for fetching tenant staff data with token
export const fetchTenantStaffs = createAsyncThunk(
  "app/fetchTenantStaffs",
  async (tenantId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No access token found");
      }
      const response = await axiosInstance.get(
        ENDPOINTS.TENANT_STAFFS(tenantId),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            source: "web",
          },
        }
      );
      return response.data;
    } catch (err) {
      if (err.response) {
        return rejectWithValue(err.response.data);
      }
      throw err;
    }
  }
);

// Async thunk for booking an appointment
export const bookAppointment = createAsyncThunk(
  "app/bookAppointment",
  async ({ datetime, tenant_id, staff_id, services }, { rejectWithValue }) => {
    const token = localStorage.getItem("access_token");
    const headers = {
      source: "web",
      "Content-Type": "application/json",
    };

    const payload = {
      datetime,
      tenant_id,
      staff_id,
      services,
    };

    if (!token) {
      const guestName = localStorage.getItem("guestName");
      const guestPhone = localStorage.getItem("guestPhone");

      if (!guestName || !guestPhone) {
        throw new Error("Guest name or phone not found in local storage");
      }

      payload.name = guestName;
      payload.phone = guestPhone;
      payload.is_guest = 1;
    } else {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await axiosInstance.post(
        ENDPOINTS.BOOK_APPOINTMENT,
        payload,
        { headers }
      );
      return response.data;
    } catch (err) {
      if (err.response) {
        return rejectWithValue(err.response.data);
      }
      throw err;
    }
  }
);

// Async thunk for fetching user appointments
export const fetchAppointments = createAsyncThunk(
  "app/fetchAppointments",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No access token found");
      }
      const response = await axiosInstance.get(ENDPOINTS.APPOINTMENTS, {
        headers: {
          Authorization: `Bearer ${token}`,
          source: "web",
        },
      });
      return response.data;
    } catch (err) {
      if (err.response) {
        return rejectWithValue(err.response.data);
      }
      throw err;
    }
  }
);

// Async thunk for canceling an appointment
export const cancelAppointment = createAsyncThunk(
  "app/cancelAppointment",
  async ({ appointmentId, token }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.CANCEL_APPOINTMENT(appointmentId),
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            source: "web",
          },
        }
      );
      return response.data;
    } catch (err) {
      if (err.response) {
        return rejectWithValue(err.response.data);
      }
      throw err;
    }
  }
);

// Async thunk for fetching terms and conditions
export const fetchTermsConditions = createAsyncThunk(
  "app/fetchTermsConditions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.TERMS_CONDITIONS, {
        headers: { source: "web" },
      });
      return response.data;
    } catch (err) {
      if (err.response) {
        return rejectWithValue(err.response.data);
      }
      throw err;
    }
  }
);

const appSlice = createSlice({
  name: "app",
  initialState: {
    homePageData: null,
    tenantCategories: [],
    tenantServices: [],
    footerData: null,
    homePageStatus: "idle",
    homePageError: null,
    footerStatus: "idle",
    footerError: null,
    selectedTenantId: null,
    selectedTenantName: "Select Store",
    selectedTenantColor: null,
    servicesToShow: [],
    selectedServicesForBooking: [],
    selectedDuration: 0,
    selectedCost: 0,
    otpStatus: "idle",
    otpError: null,
    validateOtpStatus: "idle",
    validateOtpError: null,
    phoneNumber: "",
    profileData: null,
    profileStatus: "idle",
    profileError: null,
    updateProfileStatus: "idle",
    updateProfileError: null,
    tenantStaffs: [],
    tenantStaffsStatus: "idle",
    tenantStaffsError: null,
    selectedStaff: null,
    bookAppointmentStatus: "idle",
    bookAppointmentError: null,
    appointments: [],
    appointmentsStatus: "idle",
    appointmentsError: null,
    cancelAppointmentStatus: "idle",
    cancelAppointmentError: null,
    termsConditions: null,
    termsConditionsStatus: "idle",
    termsConditionsError: null,
  },
  reducers: {
    setTenantCategories: (state, action) => {
      state.tenantCategories = action.payload;
    },
    setTenantServices: (state, action) => {
      state.tenantServices = action.payload;
    },
    setSelectedTenantId: (state, action) => {
      state.selectedTenantId = action.payload;
    },
    setSelectedTenantName: (state, action) => {
      state.selectedTenantName = action.payload;
    },
    setSelectedTenantColor: (state, action) => {
      state.selectedTenantColor = action.payload;
    },
    setServicesToShow: (state, action) => {
      state.servicesToShow = action.payload;
    },
    setPhoneNumber: (state, action) => {
      state.phoneNumber = action.payload;
    },
    setSelectedServicesForBooking: (state, action) => {
      state.selectedServicesForBooking = action.payload.services;
      state.selectedDuration = action.payload.duration;
      state.selectedCost = action.payload.cost;
    },
    setSelectedStaff: (state, action) => {
      state.selectedStaff = action.payload;
      console.log(state.selectedStaff);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomePageData.pending, (state) => {
        state.homePageStatus = "loading";
      })
      .addCase(fetchHomePageData.fulfilled, (state, action) => {
        state.homePageStatus = "succeeded";
        const data = action.payload.data;
        if (data) {
          state.homePageData = data;
          state.selectedTenantName = data.business?.name || "Select Store";
          state.selectedTenantColor = data.business?.color || "#000";
          state.tenantCategories = data.categories || [];
          state.tenantServices = data.services || [];
        }
      })
      .addCase(fetchHomePageData.rejected, (state, action) => {
        state.homePageStatus = "failed";
        state.homePageError = action.error.message;
      })
      .addCase(fetchFooterData.pending, (state) => {
        state.footerStatus = "loading";
      })
      .addCase(fetchFooterData.fulfilled, (state, action) => {
        state.footerStatus = "succeeded";
        state.footerData = action.payload.data;
      })
      .addCase(fetchFooterData.rejected, (state, action) => {
        state.footerStatus = "failed";
        state.footerError = action.error.message;
      })
      .addCase(fetchTenantSpecificData.pending, (state) => {
        state.tenantSpecificStatus = "loading";
      })
      .addCase(fetchTenantSpecificData.fulfilled, (state, action) => {
        state.tenantSpecificStatus = "succeeded";
        state.tenantCategories = action.payload.data;
      })
      .addCase(fetchTenantSpecificData.rejected, (state, action) => {
        state.tenantSpecificStatus = "failed";
        state.tenantSpecificError = action.error.message;
      })
      .addCase(sendOtp.pending, (state) => {
        state.otpStatus = "loading";
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.otpStatus = "succeeded";
        state.otpError = null;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.otpStatus = "failed";
        state.otpError = action.payload || action.error.message;
      })
      .addCase(validateOtp.pending, (state) => {
        state.validateOtpStatus = "loading";
        state.validateOtpError = null;
      })
      .addCase(validateOtp.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.validateOtpStatus = "succeeded";
          state.accessToken = action.payload.data.access_token;
          state.userData = action.payload.data;
        } else {
          state.validateOtpStatus = "failed";
          state.validateOtpError = action.payload.message;
        }
      })
      .addCase(validateOtp.rejected, (state, action) => {
        state.validateOtpStatus = "failed";
        state.validateOtpError = action.payload.message || action.error.message;
      })
      .addCase(fetchProfile.pending, (state) => {
        state.profileStatus = "loading";
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.profileStatus = "succeeded";
        state.profileData = action.payload.data;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.profileStatus = "failed";
        state.profileError = action.error.message;
      })
      .addCase(updateProfile.pending, (state) => {
        state.updateProfileStatus = "loading";
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updateProfileStatus = "succeeded";
        state.profileData = action.payload.data;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updateProfileStatus = "failed";
        state.updateProfileError = action.error.message;
      })
      .addCase(fetchTenantStaffs.pending, (state) => {
        state.tenantStaffsStatus = "loading";
      })
      .addCase(fetchTenantStaffs.fulfilled, (state, action) => {
        state.tenantStaffsStatus = "succeeded";
        state.tenantStaffs = action.payload.data;
      })
      .addCase(fetchTenantStaffs.rejected, (state, action) => {
        state.tenantStaffsStatus = "failed";
        state.tenantStaffsError = action.error.message;
      })
      .addCase(bookAppointment.pending, (state) => {
        state.bookAppointmentStatus = "loading";
      })
      .addCase(bookAppointment.fulfilled, (state) => {
        state.bookAppointmentStatus = "succeeded";
        state.bookAppointmentError = null;
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.bookAppointmentStatus = "failed";
        state.bookAppointmentError = action.payload || action.error.message;
      })
      .addCase(fetchAppointments.pending, (state) => {
        state.appointmentsStatus = "loading";
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.appointmentsStatus = "succeeded";
        state.appointments = action.payload.data;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.appointmentsStatus = "failed";
        state.appointmentsError = action.error.message;
      })
      .addCase(cancelAppointment.pending, (state) => {
        state.cancelAppointmentStatus = "loading";
      })
      .addCase(cancelAppointment.fulfilled, (state) => {
        state.cancelAppointmentStatus = "succeeded";
        state.cancelAppointmentError = null;
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.cancelAppointmentStatus = "failed";
        state.cancelAppointmentError = action.payload || action.error.message;
      })
      .addCase(fetchTermsConditions.pending, (state) => {
        state.termsConditionsStatus = "loading";
      })
      .addCase(fetchTermsConditions.fulfilled, (state, action) => {
        state.termsConditionsStatus = "succeeded";
        state.termsConditions = action.payload.data;
      })
      .addCase(fetchTermsConditions.rejected, (state, action) => {
        state.termsConditionsStatus = "failed";
        state.termsConditionsError = action.error.message;
      });
  },
});

export const {
  setTenantCategories,
  setTenantServices,
  setSelectedTenantId,
  setSelectedTenantName,
  setSelectedTenantColor,
  setServicesToShow,
  setPhoneNumber,
  setSelectedServicesForBooking,
  setSelectedStaff,
} = appSlice.actions;

export default appSlice.reducer;
