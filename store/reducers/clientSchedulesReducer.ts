import axios from "axios";
import { createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ChangeLogType } from "@/types";
import { v4 as uuidv4 } from "uuid";

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
        logId: uuidv4(),
        newScheduleData,
      });
    },
    addClientSchedule: (state, action) => {
      state.scheduleData.push(action.payload);
      state.changeLog.push({
        type: "add",
        id: action.payload.id,
        newScheduleData: action.payload.schedule_data,
        logId: uuidv4(),
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
      // check first if the id is already in the changeLog
      // if it is, system must not this delete type if the same id
      // and also delete the add/edit type of the same id
      const hasSameId = state.changeLog.some(
        (changeLog: ChangeLogType) =>
          changeLog.id === id && changeLog.type !== "delete"
      );
      if (hasSameId) {
        console.log("hasSameId: ", hasSameId);
        console.log(
          "hasSameId: ",
          state.changeLog.find(
            (changeLog: ChangeLogType) => changeLog.id === id
          )
        );
        state.changeLog = state.changeLog.filter(
          (changeLog: ChangeLogType) => changeLog.id !== id
        );
        console.log("new changeLog: ", state.changeLog);
      } else {
        state.changeLog.push({
          type: "delete",
          id,
          logId: uuidv4(),
          deleteType,
        });
      }
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
