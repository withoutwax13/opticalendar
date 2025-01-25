import axios from "axios";
import { createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const getScheduleToClient = createAsyncThunk(
  "schedules/getScheduleToClient",
  async (data: { id: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/schedule/?id=${data.id}`);
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const clientScheduleSlice = createSlice({
  name: "clientSchedules",
  initialState: {
    scheduleData: null,
    changeLog: [],
    loading: false,
    error: null,
  },
  reducers: {
    editClientSchedule: (state, action) => {
      const { id, newScheduleData } = action.payload;
      const index = state.scheduleData.findIndex(
        (schedule) => schedule.id === id
      );
      state.scheduleData[index].schedule_data = newScheduleData;
      state.changeLog.push({
        type: "edit",
        id,
        newScheduleData,
      });
    },
    addClientSchedule: (state) => {
      state.scheduleData.push(action.payload);
      state.changeLog.push({
        type: "add",
        id: action.payload.id,
        newScheduleData: action.payload.schedule_data,
      });
    },
    deleteClientSchedule: (state) => {
      const { id } = action.payload;
      state.scheduleData = state.scheduleData.filter(
        (schedule) => schedule.id !== id
      );
      state.changeLog.push({
        type: "delete",
        id,
      });
    },
    clearChangeLog: (state) => {
      state.changeLog = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getScheduleToClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getScheduleToClient.fulfilled, (state, action) => {
        state.loading = false;
        state.scheduleData = action.payload;
      })
      .addCase(getScheduleToClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  editClientSchedule,
  addClientSchedule,
  deleteClientSchedule,
  clearChangeLog,
} = clientScheduleSlice.actions;
export default clientScheduleSlice.reducer;
