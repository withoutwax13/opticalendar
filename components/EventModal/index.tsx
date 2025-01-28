"use client";
import { useEffect, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import EditModal from "./EditModal";
import AddModal from "./AddModal";
import { useSelector, useDispatch } from "react-redux";
import { deleteClientSchedule } from "@/store/reducers/clientSchedulesReducer";
import DeleteModal from "./DeleteModal";

const EventModal = (props: {
  modalType: "edit" | "add";
  addEvent?: any;
  modalIsOpen: boolean;
  closeModal: () => void;
  selectedEvent?: any | null;
  setOfflineUpdateList?: any;
  setOfflineInsertList?: any;
  setOfflineDeleteList?: any;
  editSelectedEvent?: (event: {
    title: string;
    start: string;
    end: string;
    type: string;
    isFullDay: boolean;
    isRecurring: boolean;
    taskData?: {
      status: string;
      priority: number;
    };
  }) => void;
}) => {
  const {
    modalIsOpen,
    closeModal,
    selectedEvent,
    editSelectedEvent,
    modalType,
    addEvent,
  } = props;
  if (modalType === "edit") {
    if (!editSelectedEvent) {
      throw new Error("editSelectedEvent is required when modalType is 'edit'");
    }
  }

  if (modalType === "add") {
    if (!props.addEvent) {
      throw new Error("addEvent is required when modalType is 'add'");
    }
  }

  const dispatch = useDispatch();
  const currentUser = useSelector((state: any) => state.userInfo.userInfo);
  const [editMode, setEditMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [editScheduleObject, setEditScheduleObject] = useState({
    title: selectedEvent?.title || "",
    start: selectedEvent?.start || "",
    end: selectedEvent?.end || "",
    status: selectedEvent?.taskData?.status || "not started",
    type: selectedEvent?.type || "event",
    priority: selectedEvent?.taskData?.priority || 5,
    isFullDay: selectedEvent?.isFullDay || false,
    isRecurring: selectedEvent?.isRecurring || false,
  });

  const [addScheduleObject, setAddScheduleObject] = useState({
    title: "",
    start: moment().format("YYYY-MM-DDTHH:mm"),
    end: moment().add(1, "hours").format("YYYY-MM-DDTHH:mm"),
    isTask: false,
    isTaskPriority: 5,
    isFullDay: false,
    isRecurring: false,
    recurringType: "daily",
    recurringEndType: "never",
    recurringEndAfter: 1,
    recurringEndOn: moment().add(5, "days").format("YYYY-MM-DD"),
  });

  useEffect(() => {
    console.log(currentUser);
    if (props.selectedEvent) {
      setEditScheduleObject({
        title: props.selectedEvent.title,
        start: props.selectedEvent.start,
        end: props.selectedEvent.end,
        status: props.selectedEvent.taskData?.status || "not started",
        type: props.selectedEvent.type || "event",
        priority: props.selectedEvent.taskData?.priority || 5,
        isFullDay: props.selectedEvent.isFullDay || false,
        isRecurring: props.selectedEvent.isRecurring || false,
      });
    }
  }, [props.selectedEvent, currentUser]);

  const handleCloseModal = () => {
    closeModal();
    setEditMode(false);
    setAddScheduleObject({
      title: "",
      start: moment().format("YYYY-MM-DDTHH:mm"),
      end: moment().add(1, "hours").format("YYYY-MM-DDTHH:mm"),
      isTask: false,
      isTaskPriority: 5,
      isFullDay: false,
      isRecurring: false,
      recurringType: "daily",
      recurringEndType: "never",
      recurringEndAfter: 1,
      recurringEndOn: moment().add(5, "days").format("YYYY-MM-DD"),
    });
  };
  const handleEditSave = () => {
    if (
      !editScheduleObject.title ||
      !editScheduleObject.start ||
      !editScheduleObject.end
    ) {
      toast.error("Please fill in all fields");
      return;
    } else {
      editSelectedEvent({
        title: editScheduleObject.title,
        start: editScheduleObject.start,
        end: editScheduleObject.end,
        type: editScheduleObject?.type === "task" ? "task" : "event",
        isFullDay: editScheduleObject.isFullDay,
        isRecurring: editScheduleObject.isRecurring,
        taskData: {
          status: editScheduleObject.status,
          priority: editScheduleObject.priority,
        },
      });

      // editSelectedEvent((prevEvents) => {
      //   const updatedEvents = prevEvents.map((evt) => {
      //     if (evt.id === selectedEvent.id) {
      //       setOfflineUpdateList((prevList) => [...prevList, evt.id]);
      //       return {
      //         ...evt,
      //         title: editScheduleObject.title,
      //         start: moment(editScheduleObject.start).toDate(),
      //         end: moment(editScheduleObject.end).toDate(),
      //         ...(evt.taskData
      //           ? {
      //               taskData: {
      //                 ...evt.taskData,
      //                 status: editScheduleObject.status,
      //               },
      //             }
      //           : {}),
      //       };
      //     } else return evt;
      //   });
      //   return updatedEvents;
      // });
      toast.success("Event updated successfully");
      setEditMode(false);
      closeModal();
    }
  };

  const handleDeleteEvent = (id: string, deleteType: string) => {
    dispatch(deleteClientSchedule({ id, deleteType }));
  };

  const handleAddEvent = () => {
    if (
      !addScheduleObject.title ||
      !addScheduleObject.start ||
      !addScheduleObject.end
    ) {
      toast.error("Please fill in all fields");
      return;
    } else {
      if (!addScheduleObject.isRecurring) {
        addEvent(currentUser?.id, {
          ...addScheduleObject,
          title: addScheduleObject.title,
          start: addScheduleObject.start,
          end: addScheduleObject.end,
          type: addScheduleObject.isTask ? "task" : "event",
          isFullDay: addScheduleObject.isFullDay,
          isRecurring: addScheduleObject.isRecurring,
          ...(addScheduleObject.isTask
            ? {
                taskData: {
                  status: "not started",
                  priority: addScheduleObject.isTaskPriority,
                },
              }
            : {}),
        });
      } else {
        switch (addScheduleObject.recurringEndType) {
          case "never":
            addNeverEndingRecurringEvent();
            break;
          case "after":
            addRecurringEventWithEndAfterNthInstance();
            break;
          case "on":
            addRecurringEventWithEndOnDate();
            break;
          default:
            break;
        }
      }
      handleCloseModal();
      toast.success("Event added successfully");
    }
  };

  const addNeverEndingRecurringEvent = () => {
    const maxInstances = 99;
    const groupRecurringId = uuidv4();
    let currentInstance = 0;
    let currentEventStart = moment(addScheduleObject.start);
    let currentEventEnd = moment(addScheduleObject.end);
    while (currentInstance < maxInstances) {
      addEvent(currentUser?.id, {
        ...addScheduleObject,
        title: addScheduleObject.title,
        start: currentEventStart.toDate(),
        end: currentEventEnd.toDate(),
        type: addScheduleObject.isTask ? "task" : "event",
        recurringGroupId: groupRecurringId,
        isFullDay: addScheduleObject.isFullDay,
        isRecurring: true,
        ...(addScheduleObject.isTask
          ? {
              taskData: {
                status: "not started",
                priority: addScheduleObject.isTaskPriority,
              },
            }
          : {}),
      });
      currentInstance++;
      switch (addScheduleObject.recurringType) {
        case "daily":
          currentEventStart = currentEventStart.add(1, "days");
          currentEventEnd = currentEventEnd.add(1, "days");
          break;
        case "weekly":
          currentEventStart = currentEventStart.add(1, "weeks");
          currentEventEnd = currentEventEnd.add(1, "weeks");
          break;
        case "monthly":
          currentEventStart = currentEventStart.add(1, "months");
          currentEventEnd = currentEventEnd.add(1, "months");
          break;
        default:
          break;
      }
    }
  };

  const addRecurringEventWithEndAfterNthInstance = () => {
    const maxInstances = addScheduleObject.recurringEndAfter;
    const groupRecurringId = uuidv4();
    let currentInstance = 0;
    let currentEventStart = moment(addScheduleObject.start);
    let currentEventEnd = moment(addScheduleObject.end);
    while (currentInstance < maxInstances) {
      addEvent(currentUser?.id, {
        ...addScheduleObject,
        title: addScheduleObject.title,
        start: currentEventStart.toDate(),
        end: currentEventEnd.toDate(),
        type: addScheduleObject.isTask ? "task" : "event",
        recurringGroupId: groupRecurringId,
        isFullDay: addScheduleObject.isFullDay,
        isRecurring: true,
        ...(addScheduleObject.isTask
          ? {
              taskData: {
                status: "not started",
                priority: addScheduleObject.isTaskPriority,
              },
            }
          : {}),
      });
      currentInstance++;
      switch (addScheduleObject.recurringType) {
        case "daily":
          currentEventStart = currentEventStart.add(1, "days");
          currentEventEnd = currentEventEnd.add(1, "days");
          break;
        case "weekly":
          currentEventStart = currentEventStart.add(1, "weeks");
          currentEventEnd = currentEventEnd.add(1, "weeks");
          break;
        case "monthly":
          currentEventStart = currentEventStart.add(1, "months");
          currentEventEnd = currentEventEnd.add(1, "months");
          break;
        default:
          break;
      }
    }
  };

  const addRecurringEventWithEndOnDate = () => {
    const groupRecurringId = uuidv4();
    let currentEventStart = moment(addScheduleObject.start);
    let currentEventEnd = moment(addScheduleObject.end);
    while (currentEventStart.isBefore(addScheduleObject.recurringEndOn)) {
      addEvent(currentUser?.id, {
        ...addScheduleObject,
        title: addScheduleObject.title,
        start: currentEventStart.toDate(),
        end: currentEventEnd.toDate(),
        type: addScheduleObject.isTask ? "task" : "event",
        recurringGroupId: groupRecurringId,
        isFullDay: addScheduleObject.isFullDay,
        isRecurring: true,
        ...(addScheduleObject.isTask
          ? {
              taskData: {
                status: "not started",
                priority: addScheduleObject.isTaskPriority,
              },
            }
          : {}),
      });
      switch (addScheduleObject.recurringType) {
        case "daily":
          currentEventStart = currentEventStart.add(1, "days");
          currentEventEnd = currentEventEnd.add(1, "days");
          break;
        case "weekly":
          currentEventStart = currentEventStart.add(1, "weeks");
          currentEventEnd = currentEventEnd.add(1, "weeks");
          break;
        case "monthly":
          currentEventStart = currentEventStart.add(1, "months");
          currentEventEnd = currentEventEnd.add(1, "months");
          break;
        default:
          break;
      }
    }
  };

  return (
    <div>
      {modalType === "edit" && modalIsOpen && !deleteMode && (
        <EditModal
          selectedEvent={selectedEvent}
          editMode={editMode}
          setEditMode={setEditMode}
          setEditScheduleObject={setEditScheduleObject}
          editScheduleObject={editScheduleObject}
          closeModal={closeModal}
          handleEditSave={handleEditSave}
          setShowDeleteModal={() => setDeleteMode(true)}
        />
      )}
      {modalType === "edit" && modalIsOpen && deleteMode && (
        <DeleteModal
          selectedEvent={selectedEvent}
          onHide={() => {
            setDeleteMode(false);
            closeModal();
          }}
          handleDeleteEvent={handleDeleteEvent}
          isRecurring={selectedEvent?.isRecurring}
        />
      )}
      {modalType === "add" && modalIsOpen && (
        <AddModal
          addScheduleObject={addScheduleObject}
          setAddScheduleObject={setAddScheduleObject}
          handleCloseModal={handleCloseModal}
          handleAddEvent={handleAddEvent}
        />
      )}
    </div>
  );
};

export default EventModal;
