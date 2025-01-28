import React, { useState } from "react";

const DeleteModal = (props) => {
  const { onHide, isRecurring, handleDeleteEvent, selectedEvent } = props;
  const [deleteType, setDeleteType] = useState("single");

  const handleConfirmDelete = () => {
    handleDeleteEvent(
      deleteType == "single"
        ? selectedEvent.id
        : selectedEvent.recurringGroupId,
      deleteType
    );
    onHide();
  };
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 99999 }}
    >
      <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Confirm Deletion
          </h3>
          <button
            className="text-gray-400 hover:text-gray-500"
            onClick={onHide}
          >
            <span className="sr-only">Close</span>
            &times;
          </button>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {isRecurring ? (
            <>
              <p className="mb-4">
                Do you want to delete the whole group or just the selected
                event?
              </p>
              <div className="flex space-x-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="deleteType"
                    value="single"
                    checked={deleteType === "single"}
                    onChange={() => setDeleteType("single")}
                    className="form-radio"
                  />
                  <span>Delete Single Event</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="deleteType"
                    value="group"
                    checked={deleteType === "group"}
                    onChange={() => setDeleteType("group")}
                    className="form-radio"
                  />
                  <span>Delete All Events</span>
                </label>
              </div>
            </>
          ) : (
            <p>Do you want to delete this event?</p>
          )}
        </div>
        <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={handleConfirmDelete}
          >
            Delete
          </button>
          <button
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
            onClick={onHide}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
