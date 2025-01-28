import { v4 as uuidv4 } from "uuid";
import axios from "axios";
interface ScheduleData {
  type: string;
  id: number;
  newScheduleData?: any; // Optional: only for edit and add type
  deleteType?: string; // Optional: only for delete type
}

export const handleServerSync = async ({
  type,
  id,
  newScheduleData,
  deleteType,
}: ScheduleData) => {
  switch (type) {
    case "edit":
      return await axios.patch(`/api/schedule`, {
        id,
        schedule_data: newScheduleData,
      });
    case "add":
      return await axios.post(
        `/api/schedule`,
        {
          id: uuidv4(),
          user_id: newScheduleData.user_id || id,
          schedule_data: newScheduleData,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    case "delete":
      console.log("deleteType: ", deleteType);
      console.log("id: ", id);
      switch (deleteType) {
        case "single":
          return await axios.delete(`/api/schedule/?id=${id}&deleteType=single`);
        case "group": // delete whole group of recurring schedules
          return await axios.delete(`/api/schedule/?id=${id}&deleteType=group`);
        default:
          return;
      }
  }
};
