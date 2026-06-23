import { useEffect, useMemo, useState } from "react";
import BookingCalendar from "../components/BookingCalendar";
import BookingDetailsForm from "../components/BookingDetailsForm";
import BookingSessionSelector from "../components/BookingSessionSelector";
import BookingTutorSummary from "../components/BookingTutorSummary";
import TutorPicker from "../components/TutorPicker";
import { getAvailableSlotsForTutor } from "../data/calendarUtils";
import { advertisedSessions, bookings } from "../data/mockBookings";
import { tutors } from "../data/mockTutors";
import { C } from "../data/theme";

function applyAdvertisedSessionBookingOverrides(sessions, overrides) {
  return sessions.map((session) => {
    const extraStudentIds = overrides[session.id] ?? [];

    return {
      ...session,
      bookedStudentIds: Array.from(
        new Set([...(session.bookedStudentIds ?? []), ...extraStudentIds])
      ),
    };
  });
}

function applyBookingStatusOverrides(bookingsToUpdate, bookingStatusOverrides) {
  return bookingsToUpdate.map((booking) => ({
    ...booking,
    status: bookingStatusOverrides[booking.id] ?? booking.status,
  }));
}

function isBlockingBooking(booking) {
  return booking.status !== "declined" && booking.status !== "cancelled";
}

function eventsOverlap(startA, endA, startB, endB) {
  return new Date(startA) < new Date(endB) && new Date(endA) > new Date(startB);
}

function hasTimeClash(event, busyEvents) {
  return busyEvents.some((busyEvent) =>
    eventsOverlap(
      event.startTime,
      event.endTime,
      busyEvent.startTime,
      busyEvent.endTime
    )
  );
}

function getGroupBookingState(session, currentUser, studentBusyEvents) {
  const alreadyJoined = session.bookedStudentIds.includes(currentUser.id);
  const isFull = session.bookedStudentIds.length >= session.capacity;

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

function addBookingStateToSlot(slot, studentBusyEvents) {
  const clashes = hasTimeClash(slot, studentBusyEvents);

  return {
    ...slot,
    bookingState: clashes ? "clashes" : "bookable",
    isBookable: !clashes,
  };
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
      .filter(isBlockingBooking);

    const joinedGroupSessions = allAdvertisedSessions.filter((session) =>
      session.bookedStudentIds.includes(currentUser.id)
    );

    return [...studentBookings, ...joinedGroupSessions];
  }, [allAdvertisedSessions, allBookings, currentUser.id, isStudent]);

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

  const canRequestOneOnOne =
    isStudent &&
    tutor &&
    selectedSession &&
    selectedSlot &&
    selectedSlot.isBookable &&
    !selectedGroupSession;

  const canJoinGroupClass =
    isStudent &&
    tutor &&
    selectedGroupSession &&
    selectedGroupSession.isBookable;

  const canSubmit = canRequestOneOnOne || canJoinGroupClass;

  const handleSubmit = () => {
    if (canJoinGroupClass) {
      onJoinAdvertisedSession(selectedGroupSession.id);
      setSelectedGroupSessionId("");
      return;
    }

    if (!canRequestOneOnOne) {
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
  };

  const selectOneOnOneSlot = (slotId) => {
    const slot = oneOnOneCalendarSlots.find((item) => item.id === slotId);

    if (!slot?.isBookable) {
      return;
    }

    setSelectedSlotId(slotId);
    setSelectedGroupSessionId("");
  };

  const selectGroupSession = (sessionId) => {
    const session = visibleGroupSessions.find((item) => item.id === sessionId);

    if (!session?.isBookable) {
      return;
    }

    setSelectedGroupSessionId(sessionId);
    setSelectedSlotId("");
  };

  useEffect(() => {
    setSelectedSessionId("");
    setSelectedSlotId("");
    setSelectedGroupSessionId("");
  }, [tutorId]);

  useEffect(() => {
    setSelectedSlotId("");
  }, [selectedSessionId]);

  return (
    <section>
      <button
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
              onSelectSession={setSelectedSessionId}
            />

            <BookingCalendar
              selectedSession={selectedSession}
              oneOnOneSlots={oneOnOneCalendarSlots}
              groupSessions={visibleGroupSessions}
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
            onTopicChange={setTopic}
            onNotesChange={setNotes}
          />
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
          <button
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