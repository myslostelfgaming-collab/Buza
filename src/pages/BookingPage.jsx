import { useEffect, useMemo, useState } from "react";
import BookingCalendar from "../components/BookingCalendar";
import BookingDetailsForm from "../components/BookingDetailsForm";
import BookingSessionSelector from "../components/BookingSessionSelector";
import BookingTutorSummary from "../components/BookingTutorSummary";
import TutorPicker from "../components/TutorPicker";
import { getAvailableSlotsForTutor } from "../data/calendarUtils";
import { advertisedSessions, bookings } from "../data/mockBookings";
import { availabilityWindows, blockedTimes } from "../data/mockCalendar";
import { tutors } from "../data/mockTutors";
import {
  applyAdvertisedSessionBookingOverrides,
  applyBookingStatusOverrides,
  getBookedStudentIds,
  getCapacity,
  hasTimeClash,
  isBlockingBooking,
} from "../data/scheduleUtils";
import { C } from "../data/theme";

function formatDateTime(dateTime) {
  return new Date(dateTime).toLocaleString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function eventsOverlap(startTimeA, endTimeA, startTimeB, endTimeB) {
  const startA = new Date(startTimeA);
  const endA = new Date(endTimeA);
  const startB = new Date(startTimeB);
  const endB = new Date(endTimeB);

  if (
    Number.isNaN(startA.getTime()) ||
    Number.isNaN(endA.getTime()) ||
    Number.isNaN(startB.getTime()) ||
    Number.isNaN(endB.getTime())
  ) {
    return false;
  }

  return startA < endB && endA > startB;
}

function eventContainsTimeRange(containerEvent, startTime, endTime) {
  const containerStart = new Date(containerEvent.startTime);
  const containerEnd = new Date(containerEvent.endTime);
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (
    Number.isNaN(containerStart.getTime()) ||
    Number.isNaN(containerEnd.getTime()) ||
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return false;
  }

  return containerStart <= start && containerEnd >= end;
}

function getEventTitle(event) {
  return (
    event.title ??
    event.topic ??
    event.reason ??
    event.kind ??
    "another timetable item"
  );
}

function getConflictMessage(conflictEvent) {
  if (!conflictEvent) {
    return "";
  }

  return `This time clashes with ${getEventTitle(conflictEvent)} from ${formatDateTime(
    conflictEvent.startTime
  )} to ${formatDateTime(conflictEvent.endTime)}.`;
}

function getGroupBookingState(session, currentUser, studentBusyEvents) {
  const bookedStudentIds = getBookedStudentIds(session);
  const capacity = getCapacity(session);

  const alreadyJoined = bookedStudentIds.includes(currentUser.id);
  const isFull = capacity > 0 && bookedStudentIds.length >= capacity;

  if (alreadyJoined) {
    return "joined";
  }

  if (isFull) {
    return "full";
  }

  if (hasTimeClash(session, studentBusyEvents)) {
    return "clashes";
  }

  return "bookable";
}

function getGroupBookingError(session, currentUser, studentBusyEvents) {
  if (!session) {
    return "Please select a group class.";
  }

  const bookedStudentIds = getBookedStudentIds(session);
  const capacity = getCapacity(session);

  if (bookedStudentIds.includes(currentUser.id)) {
    return "You have already joined this group class.";
  }

  if (capacity > 0 && bookedStudentIds.length >= capacity) {
    return "This group class is already full.";
  }

  const conflictEvent = studentBusyEvents.find((event) =>
    eventsOverlap(
      session.startTime,
      session.endTime,
      event.startTime,
      event.endTime
    )
  );

  if (conflictEvent) {
    return getConflictMessage(conflictEvent);
  }

  return "";
}

function addBookingStateToSlot(slot, studentBusyEvents) {
  const clashes = hasTimeClash(slot, studentBusyEvents);

  return {
    ...slot,
    bookingState: clashes ? "clashes" : "bookable",
    isBookable: !clashes,
  };
}

function getOneOnOneBookingError({
  slot,
  tutorAvailabilityWindows,
  tutorBusyEvents,
  studentBusyEvents,
}) {
  if (!slot) {
    return "Please select a 1-on-1 booking slot.";
  }

  const slotStart = new Date(slot.startTime);
  const slotEnd = new Date(slot.endTime);

  if (
    Number.isNaN(slotStart.getTime()) ||
    Number.isNaN(slotEnd.getTime()) ||
    slotEnd <= slotStart
  ) {
    return "Please select a valid booking slot.";
  }

  const fitsAvailability = tutorAvailabilityWindows.some((availabilityWindow) =>
    eventContainsTimeRange(availabilityWindow, slot.startTime, slot.endTime)
  );

  if (!fitsAvailability) {
    return "This slot is no longer inside the tutor's available teaching window. Please choose another slot.";
  }

  const tutorConflict = tutorBusyEvents.find((event) =>
    eventsOverlap(slot.startTime, slot.endTime, event.startTime, event.endTime)
  );

  if (tutorConflict) {
    return getConflictMessage(tutorConflict);
  }

  const studentConflict = studentBusyEvents.find((event) =>
    eventsOverlap(slot.startTime, slot.endTime, event.startTime, event.endTime)
  );

  if (studentConflict) {
    return `This slot clashes with your timetable: ${getConflictMessage(
      studentConflict
    )}`;
  }

  return "";
}

function ValidationError({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div
      style={{
        marginTop: 16,
        background: "rgba(248, 113, 113, 0.08)",
        border: "1px solid rgba(248, 113, 113, 0.35)",
        color: "#fecaca",
        borderRadius: 14,
        padding: 12,
        fontSize: 13,
        lineHeight: 1.5,
        fontWeight: 800,
      }}
    >
      {message}
    </div>
  );
}

export default function BookingPage({
  currentUser,
  tutorId,
  onSelectTutor,
  setPage,
  extraBookings = [],
  extraAvailabilityWindows = [],
  extraBlockedTimes = [],
  extraAdvertisedSessions = [],
  advertisedSessionBookingOverrides = {},
  bookingStatusOverrides = {},
  onRequestBooking,
  onJoinAdvertisedSession,
}) {
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [selectedGroupSessionId, setSelectedGroupSessionId] = useState("");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingError, setBookingError] = useState("");

  const isStudent = currentUser.role === "student";

  const tutor = tutors.find((item) => item.id === tutorId) ?? null;

  const tutorSessionTypes = Array.isArray(tutor?.sessionTypes)
    ? tutor.sessionTypes
    : [];

  const selectedSession =
    tutorSessionTypes.find((session) => session.id === selectedSessionId) ?? null;

  const allBookings = useMemo(
    () =>
      applyBookingStatusOverrides(
        [...bookings, ...extraBookings],
        bookingStatusOverrides
      ),
    [extraBookings, bookingStatusOverrides]
  );

  const allAvailabilityWindows = useMemo(
    () => [...availabilityWindows, ...extraAvailabilityWindows],
    [extraAvailabilityWindows]
  );

  const allBlockedTimes = useMemo(
    () => [...blockedTimes, ...extraBlockedTimes],
    [extraBlockedTimes]
  );

  const allAdvertisedSessions = useMemo(
    () =>
      applyAdvertisedSessionBookingOverrides(
        [...advertisedSessions, ...extraAdvertisedSessions],
        advertisedSessionBookingOverrides
      ),
    [extraAdvertisedSessions, advertisedSessionBookingOverrides]
  );

  const studentBusyEvents = useMemo(() => {
    if (!isStudent) {
      return [];
    }

    const studentBookings = allBookings
      .filter((booking) => booking.studentId === currentUser.id)
      .filter(isBlockingBooking)
      .map((booking) => ({
        ...booking,
        kind: "booking",
      }));

    const joinedGroupSessions = allAdvertisedSessions
      .filter((session) => getBookedStudentIds(session).includes(currentUser.id))
      .map((session) => ({
        ...session,
        kind: "group",
      }));

    return [...studentBookings, ...joinedGroupSessions];
  }, [allAdvertisedSessions, allBookings, currentUser.id, isStudent]);

  const tutorAvailabilityWindows = useMemo(() => {
    if (!tutor) {
      return [];
    }

    return allAvailabilityWindows
      .filter((availabilityWindow) => availabilityWindow.tutorId === tutor.id)
      .map((availabilityWindow) => ({
        ...availabilityWindow,
        kind: "availability",
      }));
  }, [allAvailabilityWindows, tutor]);

  const tutorBusyEvents = useMemo(() => {
    if (!tutor) {
      return [];
    }

    const tutorBookings = allBookings
      .filter((booking) => booking.tutorId === tutor.id)
      .filter(isBlockingBooking)
      .map((booking) => ({
        ...booking,
        kind: "booking",
      }));

    const tutorGroupSessions = allAdvertisedSessions
      .filter((session) => session.tutorId === tutor.id)
      .map((session) => ({
        ...session,
        kind: "group",
      }));

    const tutorBlockedTimes = allBlockedTimes
      .filter((blocked) => blocked.tutorId === tutor.id)
      .map((blocked) => ({
        ...blocked,
        kind: "blocked",
      }));

    return [...tutorBookings, ...tutorGroupSessions, ...tutorBlockedTimes];
  }, [allAdvertisedSessions, allBlockedTimes, allBookings, tutor]);

  const visibleGroupSessions = useMemo(() => {
    if (!tutor || !isStudent) {
      return [];
    }

    return allAdvertisedSessions
      .filter((session) => session.tutorId === tutor.id)
      .map((session) => {
        const bookingState = getGroupBookingState(
          session,
          currentUser,
          studentBusyEvents
        );

        return {
          ...session,
          bookingState,
          isBookable: bookingState === "bookable",
        };
      });
  }, [allAdvertisedSessions, currentUser, isStudent, studentBusyEvents, tutor]);

  const availableSlots = useMemo(() => {
    if (!tutor || !selectedSession) {
      return [];
    }

    return getAvailableSlotsForTutor({
      tutorId: tutor.id,
      durationMinutes: selectedSession.durationMinutes,
      extraBookings,
      extraAvailabilityWindows,
      extraBlockedTimes,
      extraAdvertisedSessions,
      bookingStatusOverrides,
    });
  }, [
    tutor,
    selectedSession,
    extraBookings,
    extraAvailabilityWindows,
    extraBlockedTimes,
    extraAdvertisedSessions,
    bookingStatusOverrides,
  ]);

  const oneOnOneCalendarSlots = useMemo(
    () =>
      availableSlots.map((slot) => addBookingStateToSlot(slot, studentBusyEvents)),
    [availableSlots, studentBusyEvents]
  );

  const selectedSlot =
    oneOnOneCalendarSlots.find((slot) => slot.id === selectedSlotId) ?? null;

  const selectedGroupSession =
    visibleGroupSessions.find((session) => session.id === selectedGroupSessionId) ??
    null;

  const selectedSlotError = useMemo(() => {
    if (!selectedSlot) {
      return "";
    }

    return getOneOnOneBookingError({
      slot: selectedSlot,
      tutorAvailabilityWindows,
      tutorBusyEvents,
      studentBusyEvents,
    });
  }, [selectedSlot, studentBusyEvents, tutorAvailabilityWindows, tutorBusyEvents]);

  const selectedGroupError = useMemo(() => {
    if (!selectedGroupSession) {
      return "";
    }

    return getGroupBookingError(
      selectedGroupSession,
      currentUser,
      studentBusyEvents
    );
  }, [currentUser, selectedGroupSession, studentBusyEvents]);

  const visibleBookingError =
    bookingError || selectedSlotError || selectedGroupError;

  const canRequestOneOnOne =
    isStudent &&
    tutor &&
    selectedSession &&
    selectedSlot &&
    selectedSlot.isBookable &&
    !selectedSlotError &&
    !selectedGroupSession;

  const canJoinGroupClass =
    isStudent &&
    tutor &&
    selectedGroupSession &&
    selectedGroupSession.isBookable &&
    !selectedGroupError;

  const canSubmit = canRequestOneOnOne || canJoinGroupClass;

  const clearBookingError = () => {
    setBookingError("");
  };

  const handleSubmit = () => {
    clearBookingError();

    if (selectedGroupSession) {
      const groupError = getGroupBookingError(
        selectedGroupSession,
        currentUser,
        studentBusyEvents
      );

      if (groupError) {
        setBookingError(groupError);
        return;
      }

      onJoinAdvertisedSession(selectedGroupSession.id);
      setSelectedGroupSessionId("");
      return;
    }

    if (!selectedSession) {
      setBookingError("Please choose a session type.");
      return;
    }

    if (!selectedSlot) {
      setBookingError("Please choose an available 1-on-1 slot.");
      return;
    }

    const oneOnOneError = getOneOnOneBookingError({
      slot: selectedSlot,
      tutorAvailabilityWindows,
      tutorBusyEvents,
      studentBusyEvents,
    });

    if (oneOnOneError) {
      setBookingError(oneOnOneError);
      return;
    }

    if (!canRequestOneOnOne) {
      setBookingError("This booking can no longer be requested. Please choose another slot.");
      return;
    }

    onRequestBooking({
      tutorId: tutor.id,
      sessionTypeId: selectedSession.id,
      slot: selectedSlot,
      topic,
      notes,
    });

    setSelectedSessionId("");
    setSelectedSlotId("");
    setSelectedGroupSessionId("");
    setTopic("");
    setNotes("");
    setBookingError("");
  };

  const selectOneOnOneSlot = (slotId) => {
    const slot = oneOnOneCalendarSlots.find((item) => item.id === slotId);

    if (!slot?.isBookable) {
      setBookingError("This slot clashes with your timetable. Please choose another slot.");
      return;
    }

    setSelectedSlotId(slotId);
    setSelectedGroupSessionId("");
    setBookingError("");
  };

  const selectGroupSession = (sessionId) => {
    const session = visibleGroupSessions.find((item) => item.id === sessionId);

    if (!session?.isBookable) {
      setBookingError("This group class is not currently bookable.");
      return;
    }

    setSelectedGroupSessionId(sessionId);
    setSelectedSlotId("");
    setBookingError("");
  };

  useEffect(() => {
    setSelectedSessionId("");
    setSelectedSlotId("");
    setSelectedGroupSessionId("");
    setBookingError("");
  }, [tutorId]);

  useEffect(() => {
    setSelectedSlotId("");
    setBookingError("");
  }, [selectedSessionId]);

  return (
    <section>
      <button
        type="button"
        onClick={() => (tutor ? setPage("profile") : setPage("home"))}
        style={{
          background: "transparent",
          border: `1px solid ${C.border}`,
          color: C.muted,
          borderRadius: 10,
          padding: "8px 12px",
          fontWeight: 700,
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        {tutor ? "← Back to tutor profile" : "← Back to home"}
      </button>

      <h1 style={{ color: C.white, marginTop: 0 }}>Book a Session</h1>

      {!isStudent && (
        <div
          style={{
            background: C.spark + "18",
            border: `1px solid ${C.spark}`,
            borderRadius: 14,
            padding: 14,
            color: C.text,
            lineHeight: 1.6,
            marginBottom: 16,
            maxWidth: 960,
          }}
        >
          You are currently signed in as a tutor. In this prototype, booking
          requests can only be made by student accounts. Switch to a student user
          in the header to test the student booking flow.
        </div>
      )}

      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          padding: 22,
          maxWidth: 1080,
        }}
      >
        <div style={{ marginBottom: 18 }}>
          <TutorPicker
            tutors={tutors}
            selectedTutorId={tutorId}
            onSelectTutor={onSelectTutor}
          />
        </div>

        {tutor ? (
          <>
            <BookingTutorSummary tutor={tutor} />

            <BookingSessionSelector
              tutor={tutor}
              selectedSessionId={selectedSessionId}
              selectedSession={selectedSession}
              onSelectSession={(sessionId) => {
                clearBookingError();
                setSelectedSessionId(sessionId);
              }}
            />

            <BookingCalendar
              selectedSession={selectedSession}
              oneOnOneSlots={oneOnOneCalendarSlots}
              groupSessions={visibleGroupSessions}
              studentBusyEvents={studentBusyEvents}
              selectedSlotId={selectedSlotId}
              selectedGroupSessionId={selectedGroupSessionId}
              onSelectOneOnOneSlot={selectOneOnOneSlot}
              onSelectGroupSession={selectGroupSession}
            />

            {selectedGroupSession && (
              <div
                style={{
                  marginTop: 16,
                  background: C.blue + "18",
                  border: `1px solid ${C.blue}`,
                  borderRadius: 14,
                  padding: 14,
                  color: C.text,
                  lineHeight: 1.6,
                }}
              >
                <strong style={{ color: C.white }}>Selected group class:</strong>{" "}
                {selectedGroupSession.title}
              </div>
            )}

            {selectedSlot && (
              <div
                style={{
                  marginTop: 16,
                  background: C.spark + "18",
                  border: `1px solid ${C.spark}`,
                  borderRadius: 14,
                  padding: 14,
                  color: C.text,
                  lineHeight: 1.6,
                }}
              >
                <strong style={{ color: C.white }}>Selected 1-on-1 slot:</strong>{" "}
                {selectedSlot.startTime.replace("T", " ")} –{" "}
                {selectedSlot.endTime.slice(11, 16)}
              </div>
            )}

            <ValidationError message={visibleBookingError} />
          </>
        ) : (
          <div
            style={{
              background: C.surface,
              border: `1px dashed ${C.border}`,
              borderRadius: 14,
              padding: 16,
              color: C.muted,
              lineHeight: 1.6,
            }}
          >
            No tutor selected yet. Search above or browse tutor profiles first if
            you want more detail before booking.
          </div>
        )}

        {!selectedGroupSession && (
          <BookingDetailsForm
            currentUser={currentUser}
            isStudent={isStudent}
            topic={topic}
            notes={notes}
            onTopicChange={(value) => {
              clearBookingError();
              setTopic(value);
            }}
            onNotesChange={(value) => {
              clearBookingError();
              setNotes(value);
            }}
          />
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              background: selectedGroupSession ? C.blue : C.spark,
              color: "#000",
              border: "none",
              borderRadius: 12,
              padding: "12px 18px",
              fontWeight: 900,
              cursor: canSubmit ? "pointer" : "not-allowed",
              opacity: canSubmit ? 1 : 0.45,
            }}
          >
            {selectedGroupSession ? "Join group class" : "Request booking"}
          </button>

          <button
            type="button"
            onClick={() => setPage("discover")}
            style={{
              background: C.card,
              color: C.text,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "12px 18px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Browse tutors
          </button>
        </div>
      </div>
    </section>
  );
}