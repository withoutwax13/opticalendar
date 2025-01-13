"use client";
import React from "react";
import EventModal from "../EventModal";
import supabase from "../../services/supabaseClient";
import { toast } from "react-toastify";

const Header = (props) => {
  const { setEvents, user, setOfflineInsertList } = props;
  const [modalIsOpen, setModalIsOpen] = React.useState(false);
  const closeModal = () => {
    setModalIsOpen(false);
  };
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      window.location.href = "/login";
    }
  };
  return (
    <div>
      <div className="modal">
        <EventModal
          modalType="add"
          closeModal={closeModal}
          modalIsOpen={modalIsOpen}
          addEvent={setEvents}
          setOfflineInsertList={setOfflineInsertList}
        />
      </div>
      <header className="h-20vh w-full flex justify-between items-center px-5 py-3 box-border">
        <div>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded mr-2"
            onClick={() => setModalIsOpen(true)}
          >
            Add Event
          </button>
          <button className="bg-gray-500 text-white py-2 px-4 rounded">
            Recalculate Schedule
          </button>
        </div>
        <div className="flex items-center">
            <div className="text-lg font-semibold text-gray-700 mr-2">{user?.email.split("@")[0]}</div>
          <button className="bg-gray-500 text-white py-2 px-4 rounded mr-2">
            Settings
          </button>
          <button className="bg-red-500 text-white py-2 px-4 rounded" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
    </div>
  );
};

export default Header;
