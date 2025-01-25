"use client";
import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import EventModal from "../EventModal";

import { editClientSchedule } from "@/store/reducers/clientSchedulesReducer";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useDispatch, useSelector } from "react-redux";

const DnDCalendar = withDragAndDrop(Calendar);

const MainCalendar = (props) => {
  const { events } = props;

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const dispatch = useDispatch();

  const onEventResize = ({
    event,
    start,
    end,
  }: {
    event: any;
    start: string | Date;
    end: string | Date;
  }) => {
    const newSchedule = {
      ...event,
      start,
      end,
    };
    const filteredScheduleData = Object.fromEntries(
      Object.entries(newSchedule).filter(
        ([key]) => key !== "id" && key !== "user_id"
      )
    );
    dispatch(
      editClientSchedule({
        id: event.id,
        newScheduleData: filteredScheduleData,
      })
    );
  };

  const onEventDrop = ({
    event,
    start,
    end,
  }: {
    event: any;
    start: string | Date;
    end: string | Date;
  }) => {
    const newSchedule = {
      ...event,
      start,
      end,
    };
    const filteredScheduleData = Object.fromEntries(
      Object.entries(newSchedule).filter(
        ([key]) => key !== "id" && key !== "user_id"
      )
    );
    dispatch(
      editClientSchedule({
        id: event.id,
        newScheduleData: filteredScheduleData,
      })
    );
  };

  const onSelectEvent = (event: any) => {
    setSelectedEvent(event);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="app">
      <div className="calendar">
        <DnDCalendar
          defaultDate={moment().toDate()}
          defaultView="month"
          startAccessor={(event) => new Date(event.start)}
          events={events}
          localizer={momentLocalizer(moment)}
          onEventDrop={onEventDrop}
          onEventResize={onEventResize}
          onSelectEvent={onSelectEvent}
          resizable
          toolbar
          style={{ height: "90vh" }}
          eventPropGetter={(event) => {
            const backgroundColor =
              event?.type === "event" ? "gray" : "bluegray";
            return { style: { backgroundColor } };
          }}
        />
      </div>
      <div className="modal">
        <EventModal
          modalIsOpen={modalIsOpen}
          closeModal={closeModal}
          selectedEvent={selectedEvent}
          editSelectedEvent={editClientSchedule}
          modalType={"edit"}
        />
      </div>
    </div>
  );
};

export default MainCalendar;
