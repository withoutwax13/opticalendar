"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Header from "@/components/Header";
import MainCalendar from "@/components/MainCalendar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import supabase from "@/services/supabaseClient";

const AppDemo = () => {
  const [schedules, setSchedules] = useState([]);
  const [scheduleOfflineCopy, setScheduleOfflineCopy] = useState([]);
  const [offlineUpdateList, setOfflineUpdateList] = useState([]);
  const [offlineInsertList, setOfflineInsertList] = useState([]);
  const [offlineDeleteList, setOfflineDeleteList] = useState([]);
  const [hasDeletion, setHasDeletion] = useState(false);
  const [hasUpdates, setHasUpdates] = useState(false);
  const [hasInserts, setHasInserts] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
    } else {
      setUserData(user);
    }
  };
  const fetchSchedules = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/schedule");
      setSchedules(
        response.data.map((schedule) => {
          const {
            start,
            end,
            type,
            title,
            taskData,
            isFullDay,
            isRecurring,
            recurringGroupId,
          } = schedule.schedule_data;
          return {
            id: schedule.id,
            title: title,
            start: start,
            type: type,
            end: end,
            isFullDay: isFullDay,
            isRecurring: isRecurring,
            recurringGroupId: recurringGroupId,
            taskData: taskData,
          };
        })
      );
      setScheduleOfflineCopy(schedules);
      setIsLoading(false);
    } catch (error) {
      setError(error.response.data.error);
      toast.error(error.response.data.error);
    }
  };

  const syncLocalCopyToServer = async () => {
    setHasDeletion(offlineDeleteList.length > 0);
    setHasInserts(offlineInsertList.length > 0);
    setHasUpdates(offlineUpdateList.length > 0);

    console.log(offlineDeleteList);
    console.log(offlineUpdateList);
    console.log(offlineInsertList);
    console.log(scheduleOfflineCopy);

    if (hasDeletion) {
      offlineDeleteList.forEach(async (id) => {
        try {
          await axios.delete(`http://localhost:3000/api/schedule/${id}`);
        } catch (error) {
          setError(error.response.data.error);
          toast.error(error.response.data.error);
        }
      });
      if (hasInserts) {
        offlineInsertList.forEach(async (schedule) => {
          try {
            await axios.post("http://localhost:3000/api/schedule", {
              id: schedule.id,
              schedule_data: {
                start: schedule.start,
                end: schedule.end,
                type: schedule.type,
                title: schedule.title,
                taskData: schedule.taskData,
                isFullDay: schedule.isFullDay,
                isRecurring: schedule.isRecurring,
                recurringGroupId: schedule.recurringGroupId,
              },
              user_id: userData.id,
            });
          } catch (error) {
            setError(error.response.data.error);
            toast.error(error.response.data.error);
          }
        });
        setOfflineInsertList([]);
        setHasInserts(false);
      }
      if (hasUpdates) {
        offlineUpdateList.forEach(async (id) => {
          const schedule = scheduleOfflineCopy.find(
            (schedule) => schedule.id === id
          );
          try {
            await axios.put(
              `http://localhost:3000/api/schedule/${id}`,
              schedule
            );
          } catch (error) {
            setError(error.response.data.error);
            toast.error(error.response.data.error);
          }
        });
      }
    }
  };

  useEffect(() => {
    fetchSchedules();
    getUser();
    syncLocalCopyToServer();
  }, [
    fetchSchedules,
    syncLocalCopyToServer,
    setHasInserts,
    setHasUpdates,
    setHasDeletion,
  ]);

  // const initialCalendarData = [
  //   {
  //     id: 1,
  //     type: "event",
  //     title: "Event 1",
  //     start: new Date("2025-01-01T08:00:00.000+08:00"),
  //     end: new Date("2025-01-01T12:00:00.000+08:00"),
  //     isFullDay: false,
  //     isRecurring: false,
  //     recurringGroupId: null,
  //   },
  //   {
  //     id: 2,
  //     type: "event",
  //     title: "Event 2",
  //     start: new Date("2025-01-05T08:00:00.000+08:00"),
  //     end: new Date("2025-01-05T12:00:00.000+08:00"),
  //     isFullDay: false,
  //     isRecurring: false,
  //     recurringGroupId: null,
  //   },
  //   {
  //     id: 3,
  //     type: "task",
  //     title: "Task 3 with a very long title ",
  //     start: new Date("2025-01-10T08:00:00.000+08:00"),
  //     end: new Date("2025-01-10T12:00:00.000+08:00"),
  //     isFullDay: false,
  //     isRecurring: false,
  //     recurringGroupId: null,
  //     taskData: {
  //       priority: 10,
  //       status: "not started",
  //     },
  //   },
  //   {
  //     id: 4,
  //     type: "event",
  //     title: "Event 4",
  //     start: new Date("2025-01-01T13:00:00.000+08:00"),
  //     end: new Date("2025-01-01T15:00:00.000+08:00"),
  //     isFullDay: false,
  //     isRecurring: false,
  //     recurringGroupId: null,
  //   },
  //   {
  //     id: 5,
  //     type: "event",
  //     title: "Event 5",
  //     start: new Date("2025-01-01T13:00:00.000+08:00"),
  //     end: new Date("2025-01-01T14:00:00.000+08:00"),
  //     isFullDay: false,
  //     isRecurring: false,
  //     recurringGroupId: null,
  //   },
  // ];

  return (
    !isLoading && (
      <div className="app">
        <Header
          events={scheduleOfflineCopy}
          setEvents={setScheduleOfflineCopy}
          user={userData}
          setOfflineInsertList={setOfflineInsertList}
        />
        <div className="calendar px-5">
          <MainCalendar
            events={scheduleOfflineCopy}
            setEvents={setScheduleOfflineCopy}
            setOfflineUpdateList={setOfflineUpdateList}
            setOfflineInsertList={setOfflineInsertList}
            setOfflineDeleteList={setOfflineDeleteList}
          />
        </div>
        <ToastContainer />
      </div>
    )
  );
};

export default AppDemo;
