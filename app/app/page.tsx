"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearChangeLog,
  getScheduleToClient,
} from "@/store/reducers/clientSchedulesReducer";
import Header from "@/components/Header";
import MainCalendar from "@/components/MainCalendar";
import { toast, ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import storeProvider from "@/components/StoreProvider";
import Loader from "@/components/Loader";

import { handleServerSync } from "@/utils";

const App = (props) => {
  const { rehydrated } = props;
  const [isLoading, setIsLoading] = useState(true);

  const userInfo = useSelector((state) => state.userInfo.userInfo) || null;
  const clientSchedules =
    useSelector((state: RootState) => state.clientSchedules.scheduleData) || [];
  const changeLogs =
    useSelector((state: RootState) => state.clientSchedules.changeLog) || [];
  const dispatch: AppDispatch = useDispatch();

  const [previousChangeLogLength, setPreviousChangeLogLength] = useState(-1);

  useEffect(() => {
    const updateClientSchedules = async () => {
      try {
        dispatch(getScheduleToClient({ id: userInfo.id }));
      } catch (error: any) {
        toast.error(error.response.data.error);
      }
    };

    if (rehydrated) {
      if (!userInfo) {
        window.location.href = "/login";
      } else if (clientSchedules.length === 0) {
        updateClientSchedules();
      } else {
        setIsLoading(false);
      }
    }

    // Syncing strategy:
    // 1. If the changeLogs length is not equal to the previousChangeLogLength and the changeLogs length is divisible by 3, then sync the changes to the server.
    // 2. In case the user closed the browser before the changes were synced, the changes will be synced when the user loads the app again.
    //    This will be implemented by checking if the changeLogs has items, since each syncing will clear the changeLogs.

    const isAppJustLoaded =
        previousChangeLogLength === -1 && changeLogs.length > 0,
      isIncrementalConditionTrue =
        changeLogs.length !== previousChangeLogLength &&
        changeLogs.length % 3 === 0;

    if (isAppJustLoaded || isIncrementalConditionTrue) {
      setIsLoading(true);
      changeLogs.forEach((changeLog) => {
        handleServerSync(changeLog).catch((error) => {
          toast.error("Server sync failed");
          setIsLoading(false);
        });
      });
      setIsLoading(false);
      dispatch(clearChangeLog());
      setPreviousChangeLogLength(changeLogs.length);
      console.log(`Successfully synced ${changeLogs.length} changes!`);
    }
    console.log("changeLogs", changeLogs);
  }, [
    rehydrated,
    userInfo,
    clientSchedules,
    changeLogs,
    changeLogs.length,
    previousChangeLogLength,
    dispatch,
  ]);

  return isLoading ? (
    <Loader />
  ) : (
    <div className="app">
      <Header user={userInfo} />
      <div className="calendar px-5">
        <MainCalendar
          events={clientSchedules.map((schedule) => {
            return {
              ...schedule.schedule_data,
              id: schedule.id,
              user_id: schedule.user_id,
            };
          })}
        />
      </div>
      <ToastContainer />
    </div>
  );
};

export default storeProvider(App);
