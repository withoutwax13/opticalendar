import moment from "moment";
interface TaskData {
  priority: number;
  status: string;
}

interface Event {
  title: string;
  type: string;
  isRecurring: boolean;
  isFullDay: boolean;
  start: Date;
  end: Date;
  taskData?: TaskData;
}

interface EditScheduleObject {
  title: string;
  start: string;
  end: string;
  status: string;
}

const EditModal = (props: {
  selectedEvent: Event | null;
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  setEditScheduleObject: (editScheduleObject: EditScheduleObject) => void;
  editScheduleObject: EditScheduleObject;
  closeModal: () => void;
  handleEditSave: () => void;
  setShowDeleteModal: () => void;
}) => {
  const {
    selectedEvent,
    editMode,
    setEditMode,
    setEditScheduleObject,
    editScheduleObject,
    closeModal,
    handleEditSave,
    setShowDeleteModal
  } = props;

  return (
    <div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-96">
          {selectedEvent && !editMode && (
            <div>
              <h2 className="text-xl font-bold mb-4">{selectedEvent.title}</h2>
              <div className="flex space-x-2 mb-2 chips">
                <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-semibold">
                  {selectedEvent?.type.toUpperCase()}
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
                    {moment(selectedEvent.start).format("MMMM Do YYYY, h:mm a")}
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
                    onClick={setShowDeleteModal}
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
                  value={editScheduleObject.title}
                  onChange={(e) =>
                    setEditScheduleObject((prev) => ({
                      ...prev,
                      title: (e.target as HTMLInputElement).value,
                    }))
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
                  value={moment(editScheduleObject.start).format(
                    "YYYY-MM-DDTHH:mm"
                  )}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  onChange={(e) =>
                    setEditScheduleObject((prev) => ({
                      ...prev,
                      start: e.target.value,
                    }))
                  }
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
                  value={moment(editScheduleObject.end).format(
                    "YYYY-MM-DDTHH:mm"
                  )}
                  onChange={(e) =>
                    setEditScheduleObject((prev) => ({
                      ...prev,
                      end: e.target.value,
                    }))
                  }
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
                  value={editScheduleObject.status}
                  onChange={(e) =>
                    setEditScheduleObject((prev) => ({
                      ...prev,
                      status: (e.target as HTMLSelectElement).value,
                    }))
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
    </div>
  );
};

export default EditModal;
