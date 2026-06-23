import { useMemo, useState } from "react";
import CalendarViewToggle from "../components/CalendarViewToggle";
import TutorCalendarEditor from "../components/TutorCalendarEditor";
import TutorGroupClassCreator from "../components/TutorGroupClassCreator";
import WeekCalendar from "../components/WeekCalendar";
import { bookings, advertisedSessions } from "../data/mockBookings";
import { availabilityWindows, blockedTimes } from "../data/mockCalendar";
import { C } from "../data/theme";

const weekDays = [
  { label: "Mon", date: "2026-06-22" },
  { label: "Tue", date: "2026-06-23" },
  { label: "Wed", date: "2026-06-24" },
  { label: "Thu", date: "2026-06-25" },
  { label: "Fri", date: "2026-06-26" },
  { label: "Sat", date: "2026-06-27" },
  { label: "Sun", date: "2026-06-28" },
];

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

export default function SessionsPage({
  currentUser,
  extraBookings = [],
  extraAvailabilityWindows = [],
  extraBlockedTimes = [],
  extraAdvertisedSessions = [],
  advertisedSessionBookingOverrides = {},
  bookingStatusOverrides = {},
  onUpdateBookingStatus,
  onAddAvailabilityWindow,
  onAddBlockedTime,
  onAddAdvertisedSession,
  onRemoveAdvertisedSession,
}) {
  const [calendarView, setCalendarView] = useState("week");

  const allBookings = useMemo(
    () =>
      [...bookings, ...extraBookings].map((booking) => ({
        ...booking,
        status: bookingStatusOverrides[booking.id] ?? booking.status,
      })),
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

  const visibleEvents = useMemo(() => {
    if (currentUser.role === "student") {
      const personalBookings = allBookings
        .filter((booking) => booking.studentId === currentUser.id)
        .map((booking) => ({
          ...booking,
          kind: "booking",
        }));

      const bookedGroupSessions = allAdvertisedSessions
        .filter((session) => session.bookedStudentIds.includes(currentUser.id))
        .map((session) => ({
          ...session,
          kind: "group",
        }));

      return [...personalBookings, ...bookedGroupSessions].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );
    }

    if (currentUser.role === "tutor") {
      const tutorBookings = allBookings
        .filter((booking) => booking.tutorId === currentUser.tutorId)
        .map((booking) => ({
          ...booking,
          kind: "booking",
        }));

      const tutorGroupSessions = allAdvertisedSessions
        .filter((session) => session.tutorId === currentUser.tutorId)
        .map((session) => ({
          ...session,
          kind: "group",
        }));

      const tutorAvailability = allAvailabilityWindows
        .filter((window) => window.tutorId === currentUser.tutorId)
        .map((window) => ({
          ...window,
          kind: "availability",
        }));

      const tutorBlockedTimes = allBlockedTimes
        .filter((blocked) => blocked.tutorId === currentUser.tutorId)
        .map((blocked) => ({
          ...blocked,
          kind: "blocked",
        }));

      return [
        ...tutorAvailability,
        ...tutorBlockedTimes,
        ...tutorBookings,
        ...tutorGroupSessions,
      ].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    return [];
  }, [
    currentUser,
    allBookings,
    allAvailabilityWindows,
    allBlockedTimes,
    allAdvertisedSessions,
  ]);

  return (
    <section>
      <h1 style={{ color: C.white, marginTop: 0 }}>My Timetable</h1>

      <p style={{ color: C.muted, lineHeight: 1.6 }}>
        This page is personal to the signed-in user. Students see sessions they
        have booked or joined. Tutors see their teaching timetable, advertised
        group classes, availability, and blocked times.
      </p>

      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 16,
          marginTop: 20,
          marginBottom: 18,
          display: "grid",
          gap: 14,
        }}
      >
        <div>
          <div style={{ color: C.white, fontWeight: 900, marginBottom: 4 }}>
            Signed in as
          </div>
          <div style={{ color: C.muted, fontSize: 14 }}>
            {currentUser.name} · {currentUser.role}
          </div>
        </div>

        <CalendarViewToggle
          calendarView={calendarView}
          onChange={setCalendarView}
        />

        {currentUser.role === "tutor" && (
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              color: C.muted,
              fontSize: 13,
            }}
          >
            <span>Legend:</span>
            <span style={{ color: C.green }}>● Available</span>
            <span style={{ color: C.blue }}>● Group class</span>
            <span style={{ color: C.spark }}>● Pending</span>
            <span style={{ color: "#F87171" }}>● Declined</span>
            <span style={{ color: C.muted }}>● Blocked</span>
          </div>
        )}
      </div>

      {currentUser.role === "tutor" && (
        <>
          <TutorCalendarEditor
            currentUser={currentUser}
            onAddAvailabilityWindow={onAddAvailabilityWindow}
            onAddBlockedTime={onAddBlockedTime}
          />

          <TutorGroupClassCreator
            currentUser={currentUser}
            onAddAdvertisedSession={onAddAdvertisedSession}
          />
        </>
      )}

      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          padding: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 14,
          }}
        >
          <div>
            <h2 style={{ color: C.white, margin: 0 }}>Week of 22–28 June 2026</h2>
            <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
              Viewing as {currentUser.name} · {currentUser.role}
            </div>
          </div>

          <div style={{ color: C.muted, fontSize: 13 }}>
            {visibleEvents.length} timetable item
            {visibleEvents.length === 1 ? "" : "s"}
          </div>
        </div>

        {calendarView !== "week" && (
          <div
            style={{
              background: C.surface,
              border: `1px dashed ${C.border}`,
              borderRadius: 14,
              padding: 16,
              color: C.muted,
              marginBottom: 16,
              lineHeight: 1.6,
            }}
          >
            {calendarView.charAt(0).toUpperCase() + calendarView.slice(1)} view
            is planned. The week view is functional first because it is the most
            useful for tutoring.
          </div>
        )}

        <WeekCalendar
          weekDays={weekDays}
          visibleEvents={visibleEvents}
          currentUser={currentUser}
          onUpdateBookingStatus={onUpdateBookingStatus}
          onRemoveAdvertisedSession={onRemoveAdvertisedSession}
        />
      </div>
    </section>
  );
}