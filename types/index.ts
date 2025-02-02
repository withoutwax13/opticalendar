export interface ChangeLogType {
  type: string;
  id: string;
  deleteType: string;
  logId: string;
}

export interface ScheduleData {
  type: string;
  id: string;
  newScheduleData?: any;
  deleteType?: string;
  user_id?: string;
  schedule_data?: any;
}
