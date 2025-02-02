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
import { ChangeLogType, ScheduleData } from "@/types";

const App = (props) => {
  const { rehydrated } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [initialSyncToServer, setInitialSyncToServer] = useState(false);

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

    // Syncing strategy:
    // 1. Sync changes to the server if the changeLogs length is different from the previousChangeLogLength and is divisible by 5.
    // 2. If the user closed the browser before syncing, sync the changes when the app loads again by checking if changeLogs has items.
    // 3. If the changeLogs has a delete type of change, sync the changes to the server without waiting fo the isIncrementalConditionTrue to be true.
    // 4. Check if changeLogs has a delete type and other types of the same ID, do not execute the add/edit type of change, since it will be deleted anyway.

    const isReloadedWithoutLogout =
      previousChangeLogLength === -1 && changeLogs.length > 0;
    const isIncrementalConditionTrue =
      changeLogs.length !== previousChangeLogLength &&
      changeLogs.length % 5 === 0;
    const hasDeleteChange = changeLogs.some(
      (changeLog: ChangeLogType) => changeLog.type === "delete"
    );

    if (rehydrated) {
      if (!userInfo) {
        window.location.href = "/login";
      } else if (clientSchedules.length === 0 && !initialSyncToServer) {
        setInitialSyncToServer(true);
        updateClientSchedules();
      } else {
        setIsLoading(false);
      }
    }

    // if (hasDeleteChange) {
    //   const isDeleteItemHasOtherTypes = changeLogs.some(
    //     (changeLog: ChangeLogType) => {
    //       return changeLog.type !== "delete" && changeLog.id === changeLog.id;
    //     }
    //   );
    //   console.log("isDeleteItemHasOtherTypes: ", isDeleteItemHasOtherTypes);
    //   setIsLoading(true);
    //   try {
    //     if (!isDeleteItemHasOtherTypes) {
    //       changeLogs.forEach((changeLog: ChangeLogType) => {
    //         handleServerSync(changeLog).catch(() => {
    //           toast.error("Server sync failed");
    //           setIsLoading(false);
    //         });
    //       });
    //     } else {
    //       changeLogs.forEach((changeLog: ChangeLogType) => {
    //         if (changeLog.type !== "delete") {
    //           handleServerSync(changeLog).catch(() => {
    //             toast.error("Server sync failed");
    //             setIsLoading(false);
    //           });
    //         }
    //       });
    //     }
    //   } catch (error: any) {
    //     toast.error("Server sync failed");
    //     setIsLoading(false);
    //   } finally {
    //     dispatch(clearChangeLog());
    //     setPreviousChangeLogLength(changeLogs.length);
    //     updateClientSchedules();
    //     setIsLoading(false);
    //   }
    // }
    console.log("changeLogs -> ", changeLogs);

    if (isReloadedWithoutLogout || isIncrementalConditionTrue) {
      setIsLoading(true);
      try {
        changeLogs.forEach((changeLog: ChangeLogType) => {
          handleServerSync(changeLog).catch(() => {
            toast.error("Server sync failed");
            setIsLoading(false);
          });
        });
      } catch (error: any) {
        toast.error("Server sync failed");
        setIsLoading(false);
      } finally {
        dispatch(clearChangeLog());
        setPreviousChangeLogLength(changeLogs.length);
        updateClientSchedules();
        setIsLoading(false);
      }
    }
  }, [
    rehydrated,
    userInfo,
    clientSchedules,
    clientSchedules.length,
    changeLogs,
    changeLogs.length,
    previousChangeLogLength,
    initialSyncToServer,
    dispatch,
  ]);

  return isLoading ? (
    <Loader />
  ) : (
    <div className="app">
      <Header user={userInfo} />
      <div className="calendar px-5">
        <MainCalendar
          events={clientSchedules.map((schedule: ScheduleData) => {
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
