import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import userInfoReducer from "./userInfoReducers";
import schedulesReducer from "./schedulesReducers";
import clientSchedulesReducer from "./clientSchedulesReducer";

const clientSchedulesPersistConfig = {
  key: "clientSchedules",
  storage,
};

const userInfoPersistConfig = {
  key: "userInfo",
  storage,
};

const rootReducer = combineReducers({
  userInfo: persistReducer(userInfoPersistConfig, userInfoReducer),
  schedules: schedulesReducer,
  clientSchedules: persistReducer(
    clientSchedulesPersistConfig,
    clientSchedulesReducer
  ),
});

export default rootReducer;
