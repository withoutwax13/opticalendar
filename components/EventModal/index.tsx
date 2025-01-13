"use client";
import { useEffect, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

const EventModal = (props: {
  modalType: "edit" | "add";
  addEvent?: (callback: (prevEvents: any[]) => any[]) => void;
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
  }) => void;
}) => {
  const {
    modalIsOpen,
    closeModal,
    selectedEvent,
    editSelectedEvent,
    modalType,
    addEvent,
    setOfflineUpdateList,
    setOfflineInsertList,
    setOfflineDeleteList,
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

  const [editMode, setEditMode] = useState(false);
  const [eventTitle, setEventTitle] = useState(selectedEvent?.title || "");
  const [eventStart, setEventStart] = useState(selectedEvent?.start || "");
  const [eventEnd, setEventEnd] = useState(selectedEvent?.end || "");
  const [taskStatus, setTaskStatus] = useState(
    selectedEvent?.taskData?.status || "not started"
  );

  const [addEventTitle, setAddEventTitle] = useState("");
  const [addEventStart, setAddEventStart] = useState(
    moment().format("YYYY-MM-DDTHH:mm")
  );
  const [addEventEnd, setAddEventEnd] = useState(
    moment().add(1, "hours").format("YYYY-MM-DDTHH:mm")
  );
  const [addEventIsTask, setAddEventIsTask] = useState(false);
  const [addEventIsTaskPriority, setAddEventIsTaskPriority] = useState(5);

  const [addEventIsFullDay, setAddEventIsFullDay] = useState(false);
  const [addEventIsRecurring, setAddEventIsRecurring] = useState(false);
  const [addEventRecurringType, setAddEventRecurringType] = useState("daily");
  const [addEventRecurringEndType, setAddEventRecurringEndType] =
    useState("never");
  const [addEventRecurringEndAfter, setAddEventRecurringEndAfter] = useState(1);
  const [addEventRecurringEndOn, setAddEventRecurringEndOn] = useState(
    moment().add(5, "days").format("YYYY-MM-DD")
  );

  useEffect(() => {
    if (props.selectedEvent) {
      setEventTitle(props.selectedEvent.title);
      setEventStart(props.selectedEvent.start);
      setEventEnd(props.selectedEvent.end);
    }
  }, [props.selectedEvent]);

  const handleCloseModal = () => {
    closeModal();
    setEditMode(false);
    setAddEventIsTask(false);
    setAddEventIsTaskPriority(5);
    setAddEventIsFullDay(false);
    setAddEventIsRecurring(false);
    setAddEventRecurringType("daily");
    setAddEventRecurringEndType("never");
    setAddEventRecurringEndAfter(1);
    setAddEventRecurringEndOn(moment().add(5, "days").format("YYYY-MM-DD"));
    setAddEventTitle("");
    setAddEventStart(moment().format("YYYY-MM-DDTHH:mm"));
    setAddEventEnd(moment().add(1, "hours").format("YYYY-MM-DDTHH:mm"));
  };
  const handleEditSave = () => {
    if (!eventTitle || !eventStart || !eventEnd) {
      toast.error("Please fill in all fields");
      return;
    } else {
      editSelectedEvent((prevEvents) => {
        const updatedEvents = prevEvents.map((evt) => {
          if (evt.id === selectedEvent.id) {
            setOfflineUpdateList((prevList) => [...prevList, evt.id]);
            return {
              ...evt,
              title: eventTitle,
              start: moment(eventStart).toDate(),
              end: moment(eventEnd).toDate(),
              ...(evt.taskData
                ? {
                    taskData: {
                      ...evt.taskData,
                      status: taskStatus,
                    },
                  }
                : {}),
            };
          } else return evt;
        });
        return updatedEvents;
      });
      toast.success("Event updated successfully");
      setEditMode(false);
      closeModal();
    }
  };

  const handleDeleteEvent = () => {
    editSelectedEvent((prevEvents) => {
      if (selectedEvent.isRecurring) {
        const updatedEvents = prevEvents.filter((evt) => {
          if (evt.recurringGroupId === selectedEvent.recurringGroupId) {
            setOfflineDeleteList((prevList) => [...prevList, evt.id]);
            return false;
          } else {
            return true;
          }
        });
        return updatedEvents;
      } else {
        const updatedEvents = prevEvents.filter(
          (evt) => evt.id !== selectedEvent.id
        );
        return updatedEvents;
      }
    });
    closeModal();
    toast.success("Event deleted successfully");
  };

  const handleAddEvent = () => {
    if (!addEventTitle || !addEventStart || !addEventEnd) {
      toast.error("Please fill in all fields");
      return;
    } else {
      if (!addEventIsRecurring) {
        addEvent((prevEvents) => {
          const newId = uuidv4();
          // TODO: this is buggy, need to fix
          // currently, it adds 2 IDs even though it should only add 1
          setOfflineInsertList((prevList: string[]) => [...prevList, newId]);
          const updatedEvents = [
            ...prevEvents,
            {
              id: newId,
              title: addEventTitle,
              start: moment(addEventStart).toDate(),
              end: moment(addEventEnd).toDate(),
              type: addEventIsTask ? "task" : "event",
              ...(addEventIsTask
                ? {
                    taskData: {
                      status: "not started",
                      priority: addEventIsTaskPriority,
                    },
                  }
                : {}),
            },
          ];
          return updatedEvents;
        });
      } else {
        switch (addEventRecurringEndType) {
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
    const maxInstances = 9999;
    const recurringEvents = [];
    const groupRecurringId = uuidv4();
    let currentInstance = 0;
    let currentEventStart = moment(addEventStart);
    let currentEventEnd = moment(addEventEnd);
    while (currentInstance < maxInstances) {
      const newId = uuidv4();
      setOfflineInsertList((prevList) => [...prevList, newId]);
      recurringEvents.push({
        id: newId,
        title: addEventTitle,
        start: currentEventStart.toDate(),
        end: currentEventEnd.toDate(),
        isRecurring: true,
        recurringGroupId: groupRecurringId,
        type: addEventIsTask ? "task" : "event",
        ...(addEventIsTask
          ? {
              taskData: {
                status: "not started",
                priority: addEventIsTaskPriority,
              },
            }
          : {}),
      });
      currentInstance++;
      switch (addEventRecurringType) {
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
    addEvent((prevEvents) => {
      const updatedEvents = [...prevEvents, ...recurringEvents];
      return updatedEvents;
    });
  };

  const addRecurringEventWithEndAfterNthInstance = () => {
    const maxInstances = addEventRecurringEndAfter;
    const recurringEvents = [];
    const groupRecurringId = uuidv4();
    let currentInstance = 0;
    let currentEventStart = moment(addEventStart);
    let currentEventEnd = moment(addEventEnd);
    while (currentInstance < maxInstances) {
      const newId = uuidv4();
      setOfflineInsertList((prevList) => [...prevList, newId]);
      recurringEvents.push({
        id: newId,
        title: addEventTitle,
        start: currentEventStart.toDate(),
        end: currentEventEnd.toDate(),
        isRecurring: true,
        recurringGroupId: groupRecurringId,
        type: addEventIsTask ? "task" : "event",
        ...(addEventIsTask
          ? {
              taskData: {
                status: "not started",
                priority: addEventIsTaskPriority,
              },
            }
          : {}),
      });
      currentInstance++;
      switch (addEventRecurringType) {
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
    addEvent((prevEvents) => {
      const updatedEvents = [...prevEvents, ...recurringEvents];
      return updatedEvents;
    });
  };

  const addRecurringEventWithEndOnDate = () => {
    const recurringEvents = [];
    const groupRecurringId = uuidv4();
    let currentEventStart = moment(addEventStart);
    let currentEventEnd = moment(addEventEnd);
    while (currentEventStart.isBefore(addEventRecurringEndOn)) {
      const newId = uuidv4();
      setOfflineInsertList((prevList) => [...prevList, newId]);
      recurringEvents.push({
        id: newId,
        title: addEventTitle,
        start: currentEventStart.toDate(),
        end: currentEventEnd.toDate(),
        isRecurring: true,
        recurringGroupId: groupRecurringId,
        type: addEventIsTask ? "task" : "event",
        ...(addEventIsTask
          ? {
              taskData: {
                status: "not started",
                priority: addEventIsTaskPriority,
              },
            }
          : {}),
      });
      switch (addEventRecurringType) {
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
    addEvent((prevEvents) => {
      const updatedEvents = [...prevEvents, ...recurringEvents];
      return updatedEvents;
    });
  };

  return modalType === "edit"
    ? modalIsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            {selectedEvent && !editMode && (
              <div>
                <h2 className="text-xl font-bold mb-4">
                  {selectedEvent.title}
                </h2>
                <div className="flex space-x-2 mb-2 chips">
                  <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-semibold">
                    {selectedEvent.type.toUpperCase()}
                  </span>
                  {selectedEvent.isRecurring && (
                    <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-semibold">
                      Recurring
                    </span>
                  )}
                  {selectedEvent.isFullDay && (
                    <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-semibold">
                      Full Day
                    </span>
                  )}
                  {selectedEvent.taskData && (
                    <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-semibold">
                      {selectedEvent.taskData.priority > 7
                        ? "High"
                        : selectedEvent.taskData.priority > 4
                        ? "Medium"
                        : "Low"}{" "}
                      Priority
                    </span>
                  )}
                </div>
                <div className="my-4">
                  <p className="mb-2">
                    Start:{" "}
                    <b>
                      {moment(selectedEvent.start).format(
                        "MMMM Do YYYY, h:mm a"
                      )}
                    </b>{" "}
                  </p>
                  <p className="mb-2">
                    End:{" "}
                    <b>
                      {moment(selectedEvent.end).format("MMMM Do YYYY, h:mm a")}
                    </b>{" "}
                  </p>
                </div>
                {selectedEvent.taskData && (
                  <div className="mb-4 flex items-center">
                    <label className="mr-2 text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-semibold">
                      {selectedEvent.taskData.status}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      closeModal();
                      setEditMode(false);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Close
                  </button>
                  <div>
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mr-2"
                    >
                      Update Event
                    </button>
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                      onClick={handleDeleteEvent}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
            {selectedEvent && editMode && (
              <div>
                <div className="mb-4">
                  <label
                    htmlFor="event-title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Event
                  </label>
                  <input
                    id="event-title"
                    type="text"
                    value={eventTitle}
                    onChange={(e) =>
                      setEventTitle((e.target as HTMLInputElement).value)
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="event-start"
                  >
                    Start date & time
                  </label>
                  <input
                    id="event-start"
                    type="datetime-local"
                    value={moment(eventStart).format("YYYY-MM-DDTHH:mm")}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    onChange={(e) => setEventStart(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="event-end"
                  >
                    End date & time
                  </label>
                  <input
                    id="event-end"
                    type="datetime-local"
                    value={moment(eventEnd).format("YYYY-MM-DDTHH:mm")}
                    onChange={(e) => setEventEnd(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="event-status"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Status
                  </label>
                  <select
                    id="event-status"
                    value={taskStatus}
                    onChange={(e) =>
                      setTaskStatus((e.target as HTMLSelectElement).value)
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="not started">Not Started</option>
                    <option value="in progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      closeModal();
                      setEditMode(false);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleEditSave}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    : modalIsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <div className="mb-4">
              <label
                htmlFor="event-type"
                className="block text-sm font-medium text-gray-700"
              >
                Schedule Type
              </label>
              <select
                id="event-type"
                value={addEventIsTask ? "task" : "event"}
                onChange={(e) => {
                  setAddEventIsTask(
                    (e.target as HTMLSelectElement).value === "task"
                  );
                }}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="event">Event</option>
                <option value="task">Task</option>
              </select>
            </div>
            <div className="mb-4">
              <label
                htmlFor="event-title"
                className="block text-sm font-medium text-gray-700"
              >
                {addEventIsTask ? "Task" : "Event"} Title
              </label>
              <input
                placeholder={`${addEventIsTask ? "Task" : "Event"} Title`}
                id="event-title"
                type="text"
                value={addEventTitle}
                onChange={(e) =>
                  setAddEventTitle((e.target as HTMLInputElement).value)
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            {addEventIsTask && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Priority:{" "}
                  {addEventIsTaskPriority > 9
                    ? "Highest"
                    : addEventIsTaskPriority > 7
                    ? "High"
                    : addEventIsTaskPriority > 4
                    ? "Medium"
                    : addEventIsTaskPriority > 2
                    ? "Low"
                    : "Lowest"}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={addEventIsTaskPriority}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  onChange={(e) =>
                    setAddEventIsTaskPriority(
                      parseInt((e.target as HTMLInputElement).value)
                    )
                  }
                />
              </div>
            )}
            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="event-start"
              >
                Start date & time
              </label>
              <input
                id="event-start"
                type="datetime-local"
                value={moment(addEventStart).format("YYYY-MM-DDTHH:mm")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                onChange={(e) => setAddEventStart(e.target.value)}
              />
            </div>
            {!addEventIsFullDay && (
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="event-end"
                >
                  End date & time
                </label>
                <input
                  id="event-end"
                  type="datetime-local"
                  value={moment(addEventEnd).format("YYYY-MM-DDTHH:mm")}
                  onChange={(e) => setAddEventEnd(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            )}

            <div className="mb-4 flex items-center">
              <input
                id="event-full-day"
                type="checkbox"
                checked={addEventIsFullDay}
                onChange={(e) => {
                  setAddEventIsFullDay(e.target.checked);
                  if (e.target.checked) {
                    setAddEventStart(moment().format("YYYY-MM-DD"));
                    setAddEventEnd(
                      moment().add(1, "days").format("YYYY-MM-DD")
                    );
                  } else {
                    setAddEventStart(moment().format("YYYY-MM-DDTHH:mm"));
                    setAddEventEnd(
                      moment().add(1, "hour").format("YYYY-MM-DDTHH:mm")
                    );
                  }
                }}
                className="mt-1"
              />
              <label
                className="block text-sm font-medium text-gray-700 ml-2"
                htmlFor="event-full-day"
              >
                Full day
              </label>
            </div>
            <div className="mb-4 flex items-center">
              <input
                id="event-recurring"
                type="checkbox"
                checked={addEventIsRecurring}
                onChange={(e) => setAddEventIsRecurring(e.target.checked)}
                className="mt-1"
              />
              <label
                htmlFor="event-recurring"
                className="block text-sm font-medium text-gray-700 ml-2"
              >
                Recurring
              </label>
            </div>
            {addEventIsRecurring && (
              <div>
                <div className="mb-4">
                  <label
                    htmlFor="event-recurring-type"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Recurring Type
                  </label>
                  <select
                    id="event-recurring-type"
                    value={addEventRecurringType}
                    onChange={(e) =>
                      setAddEventRecurringType(
                        (e.target as HTMLSelectElement).value
                      )
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="event-recurring-end-type"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Recurring End Type
                  </label>
                  <select
                    id="event-recurring-end-type"
                    value={addEventRecurringEndType}
                    onChange={(e) => {
                      setAddEventRecurringEndType(
                        (e.target as HTMLSelectElement).value
                      );
                    }}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="never">Never</option>
                    <option value="after">After</option>
                    <option value="on">On</option>
                  </select>
                </div>
              </div>
            )}
            {addEventIsRecurring && addEventRecurringEndType === "after" && (
              <div className="mb-4">
                <label
                  htmlFor="event-recurring-end-after"
                  className="block text-sm font-medium text-gray-700"
                >
                  Recurring End After
                </label>
                <input
                  id="event-recurring-end-after"
                  type="number"
                  value={addEventRecurringEndAfter}
                  onChange={(e) => {
                    setAddEventRecurringEndAfter(
                      parseInt((e.target as HTMLInputElement).value)
                    );
                  }}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            )}
            {addEventIsRecurring && addEventRecurringEndType === "on" && (
              <div className="mb-4">
                <label
                  htmlFor="event-recurring-end-on"
                  className="block text-sm font-medium text-gray-700"
                >
                  Recurring End On
                </label>
                <input
                  id="event-recurring-end-on"
                  type="date"
                  value={addEventRecurringEndOn}
                  onChange={(e) =>
                    setAddEventRecurringEndOn(
                      (e.target as HTMLInputElement).value
                    )
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            )}
            <div className="flex justify-between">
              <button
                onClick={() => {
                  handleCloseModal();
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add To Schedule
              </button>
            </div>
          </div>
        </div>
      );
};

export default EventModal;
