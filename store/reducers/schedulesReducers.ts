import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const getSchedules = createAsyncThunk(
  "schedules/getSchedules",
  async (data: { id: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/schedule/id=${data.id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const editSchedule = createAsyncThunk(
  "schedules/editSchedule",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/schedule`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const scheduleSlice = createSlice({
  name: "schedules",
  initialState: {
    scheduleData: [],
    loading: false,
    error: null,
  },
  reducers: {
    setSchedules: (state, action) => {
      state.scheduleData = action.payload;
    },
    addSchedule: (state, action) => {
      state.scheduleData.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.scheduleData = action.payload;
      })
      .addCase(getSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(editSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editSchedule.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(editSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSchedules, addSchedule } = scheduleSlice.actions;
export default scheduleSlice.reducer;
