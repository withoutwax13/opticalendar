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
    addClientSchedule: (state, action) => {
      state.scheduleData.push(action.payload);
      state.changeLog.push({
        type: "add",
        id: action.payload.id,
        newScheduleData: action.payload.schedule_data,
      });
    },
    deleteClientSchedule: (state, action) => {
      const { id, deleteType } = action.payload;
      if (state.scheduleData) {
        if (deleteType === "single") {
          const index = state.scheduleData.findIndex(
            (schedule: any) => schedule.id === id
          );
          if (index !== -1) {
            state.scheduleData.splice(index, 1);
          }
        } else if (deleteType === "group") {
          const indexesToDelete = state.scheduleData.findIndex(
            (schedule: any) => schedule.recurringGroupId === id
          );
          if (indexesToDelete.length > 0) {
            indexesToDelete.forEach((index: number) => {
              state.scheduleData.splice(index, 1);
            });
          }
        }
      }
      state.changeLog.push({
        type: "delete",
        id,
        deleteType,
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
