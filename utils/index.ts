import supabase from "@/services/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
interface ScheduleData {
  type: string;
  id: number;
  newScheduleData: any; // Replace 'any' with the appropriate type if known
}

export const handleServerSync = async ({
  type,
  id,
  newScheduleData,
}: ScheduleData) => {
  switch (type) {
    case "edit":
      return await axios.patch(`/api/schedule`, {
        id,
        schedule_data: newScheduleData,
      });
    case "add":
      return await axios.post(`/api/schedule`, {
        id: uuidv4(),
        user_id: supabase.auth.user()?.id,
        schedule_data: newScheduleData,
      });
    case "delete":
      return await axios.delete(`/api/schedule`, {
        data: { id },
      });
  }
};
