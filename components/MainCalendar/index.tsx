"use client";
import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import EventModal from "../EventModal";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const MainCalendar = (props) => {
  const {
    events,
    setEvents,
    setOfflineUpdateList,
    setOfflineInsertList,
    setOfflineDeleteList,
  } = props;

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const onEventResize = ({
    event,
    start,
    end,
  }: {
    event: any;
    start: string | Date;
    end: string | Date;
  }) => {
    setEvents((prevEvents: any[]) => {
      const updatedEvents = prevEvents.map((evt) =>
        evt.id === event.id ? { ...evt, start, end } : evt
      );
      console.log(updatedEvents);
      return updatedEvents;
    });
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
    setEvents((prevEvents) => {
      const updatedEvents = prevEvents.map((evt) => {
        if (evt.id === event.id) {
          setOfflineUpdateList((prevList) => [...prevList, event.id]);
          return { ...evt, start, end };
        } else {
          return evt;
        }
      });
      console.log(updatedEvents);
      return updatedEvents;
    });
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
          events={events}
          localizer={localizer}
          onEventDrop={onEventDrop}
          onEventResize={onEventResize}
          onSelectEvent={onSelectEvent}
          resizable
          style={{ height: "90vh" }}
          eventPropGetter={(event) => {
            const backgroundColor =
              event.type === "event" ? "gray" : "bluegray";
            return { style: { backgroundColor } };
          }}
        />
      </div>
      <div className="modal">
        <EventModal
          modalIsOpen={modalIsOpen}
          closeModal={closeModal}
          selectedEvent={selectedEvent}
          editSelectedEvent={setEvents}
          modalType={"edit"}
          setOfflineUpdateList={setOfflineUpdateList}
          setOfflineInsertList={setOfflineInsertList}
          setOfflineDeleteList={setOfflineDeleteList}
        />
      </div>
    </div>
  );
};

export default MainCalendar;
