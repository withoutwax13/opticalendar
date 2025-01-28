import moment from "moment";

const AddModal = (props) => {
  const {
    handleCloseModal,
    addScheduleObject,
    setAddScheduleObject,
    handleAddEvent,
  } = props;
  return (
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
            value={addScheduleObject.isTask ? "task" : "event"}
            onChange={(e) => {
              setAddScheduleObject((prev) => ({
                ...prev,
                isTask: (e.target as HTMLSelectElement).value === "task",
              }));
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
            {addScheduleObject.isTask ? "Task" : "Event"} Title
          </label>
          <input
            placeholder={`${addScheduleObject.isTask ? "Task" : "Event"} Title`}
            id="event-title"
            type="text"
            value={addScheduleObject.title}
            onChange={(e) =>
              setAddScheduleObject((prev) => ({
                ...prev,
                title: (e.target as HTMLInputElement).value,
              }))
            }
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        {addScheduleObject.isTask && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Priority:{" "}
              {addScheduleObject.isTaskPriority > 9
                ? "Highest"
                : addScheduleObject.isTaskPriority > 7
                ? "High"
                : addScheduleObject.isTaskPriority > 4
                ? "Medium"
                : addScheduleObject.isTaskPriority > 2
                ? "Low"
                : "Lowest"}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={addScheduleObject.isTaskPriority}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              onChange={(e) =>
                setAddScheduleObject((prev) => ({
                  ...prev,
                  isTaskPriority: parseInt(
                    (e.target as HTMLInputElement).value
                  ),
                }))
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
            value={moment(addScheduleObject.start).format("YYYY-MM-DDTHH:mm")}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            onChange={(e) =>
              setAddScheduleObject((prev) => ({
                ...prev,
                start: e.target.value,
              }))
            }
          />
        </div>
        {!addScheduleObject.isFullDay && (
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
              value={moment(addScheduleObject.end).format("YYYY-MM-DDTHH:mm")}
              onChange={(e) =>
                setAddScheduleObject((prev) => ({
                  ...prev,
                  end: e.target.value,
                }))
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        )}

        <div className="mb-4 flex items-center">
          <input
            id="event-full-day"
            type="checkbox"
            checked={addScheduleObject.isFullDay}
            onChange={(e) => {
              setAddScheduleObject((prev) => ({
                ...prev,
                isFullDay: e.target.checked,
              }));
              if (e.target.checked) {
                setAddScheduleObject((prev) => ({
                  ...prev,
                  start: moment().format("YYYY-MM-DD"),
                }));
                setAddScheduleObject((prev) => ({
                  ...prev,
                  end: moment().add(1, "day").format("YYYY-MM-DD"),
                }));
              } else {
                setAddScheduleObject((prev) => ({
                  ...prev,
                  start: moment().format("YYYY-MM-DD"),
                }));
                setAddScheduleObject((prev) => ({
                  ...prev,
                  end: moment().add(1, "hour").format("YYYY-MM-DDTHH:mm"),
                }));
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
            checked={addScheduleObject.isRecurring}
            onChange={(e) =>
              setAddScheduleObject((prev) => ({
                ...prev,
                isRecurring: e.target.checked,
              }))
            }
            className="mt-1"
          />
          <label
            htmlFor="event-recurring"
            className="block text-sm font-medium text-gray-700 ml-2"
          >
            Recurring
          </label>
        </div>
        {addScheduleObject.isRecurring && (
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
                value={addScheduleObject.recurringType}
                onChange={(e) =>
                  setAddScheduleObject((prev) => ({
                    ...prev,
                    recurringType: (e.target as HTMLSelectElement).value,
                  }))
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
                value={addScheduleObject.recurringEndType}
                onChange={(e) => {
                  setAddScheduleObject((prev) => ({
                    ...prev,
                    recurringEndType: (e.target as HTMLSelectElement).value,
                  }));
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
        {addScheduleObject.isRecurring &&
          addScheduleObject.recurringEndType === "after" && (
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
                value={addScheduleObject.recurringEndAfter}
                onChange={(e) => {
                  setAddScheduleObject((prev) => ({
                    ...prev,
                    recurringEndAfter: parseInt(
                      (e.target as HTMLInputElement).value
                    ),
                  }));
                }}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          )}
        {addScheduleObject.isRecurring &&
          addScheduleObject.recurringEndType === "on" && (
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
                value={addScheduleObject.recurringEndOn}
                onChange={(e) =>
                  setAddScheduleObject((prev) => ({
                    ...prev,
                    recurringEndOn: (e.target as HTMLInputElement).value,
                  }))
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

export default AddModal;
