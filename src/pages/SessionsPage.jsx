import { useMemo, useState } from "react";
import { bookings, advertisedSessions } from "../data/mockBookings";
import { availabilityWindows, blockedTimes } from "../data/mockCalendar";
import { tutors } from "../data/mockTutors";
import { users } from "../data/mockUsers";
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

function getTutor(tutorId) {
  return tutors.find((tutor) => tutor.id === tutorId) ?? null;
}

function getUser(userId) {
  return users.find((user) => user.id === userId) ?? null;
}

function getSessionType(tutor, sessionTypeId) {
  return tutor?.sessionTypes.find((session) => session.id === sessionTypeId) ?? null;
}

function getDateKey(dateTime) {
  return dateTime.slice(0, 10);
}

function formatTime(dateTime) {
  return new Date(dateTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusColor(status) {
  if (status === "confirmed") return C.green;
  if (status === "pending") return C.spark;
  if (status === "advertised") return C.blue;
  if (status === "available") return C.green;
  if (status === "blocked") return C.muted;
  return C.muted;
}

function getEventTitle(event, sessionType) {
  if (event.kind === "availability") return event.title;
  if (event.kind === "blocked") return event.title;
  if (event.kind === "group") return event.title;
  return sessionType?.title ?? "Session";
}

function TimetableEventCard({ event, currentUser }) {
  const tutor = getTutor(event.tutorId);
  const sessionType = getSessionType(tutor, event.sessionTypeId);
  const student = event.studentId ? getUser(event.studentId) : null;

  const isGroupSession = event.kind === "group";
  const isAvailability = event.kind === "availability";
  const isBlocked = event.kind === "blocked";
  const isBooking = event.kind === "booking";

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderLeft: `4px solid ${statusColor(event.status)}`,
        borderRadius: 12,
        padding: 12,
        marginTop: 10,
        opacity: isBlocked ? 0.75 : 1,
      }}
    >
      <div style={{ color: C.white, fontWeight: 900, fontSize: 14 }}>
        {formatTime(event.startTime)} – {formatTime(event.endTime)}
      </div>

      <div style={{ color: C.text, fontWeight: 800, marginTop: 6 }}>
        {getEventTitle(event, sessionType)}
      </div>

      {currentUser.role === "student" && isBooking && (
        <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
          1-on-1 with {tutor?.name}
        </div>
      )}

      {currentUser.role === "student" && isGroupSession && (
        <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
          Group class with {tutor?.name}
        </div>
      )}

      {currentUser.role === "tutor" && isBooking && (
        <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
          Student: {student?.name ?? event.learnerName ?? "Unknown student"}
        </div>
      )}

      {currentUser.role === "tutor" && isGroupSession && (
        <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
          {event.bookedStudentIds.length}/{event.capacity} learners booked
        </div>
      )}

      {isAvailability && (
        <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
          Open teaching window for future bookings
        </div>
      )}

      {isBlocked && (
        <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
          {event.reason}
        </div>
      )}

      {event.topic && (
        <div style={{ color: C.muted, fontSize: 13, marginTop: 6 }}>
          Topic: {event.topic}
        </div>
      )}

      <div
        style={{
          display: "inline-flex",
          color: statusColor(event.status),
          background: statusColor(event.status) + "22",
          borderRadius: 999,
          padding: "3px 8px",
          fontSize: 11,
          fontWeight: 900,
          marginTop: 8,
          textTransform: "capitalize",
        }}
      >
        {event.status}
      </div>
    </div>
  );
}

export default function SessionsPage({ currentUser, extraBookings = [] }) {
  const [calendarView, setCalendarView] = useState("week");

  const allBookings = useMemo(
    () => [...bookings, ...extraBookings],
    [extraBookings]
  );

  const visibleEvents = useMemo(() => {
    if (currentUser.role === "student") {
      const personalBookings = allBookings
        .filter((booking) => booking.studentId === currentUser.id)
        .map((booking) => ({
          ...booking,
          kind: "booking",
        }));

      const bookedGroupSessions = advertisedSessions
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

      const tutorGroupSessions = advertisedSessions
        .filter((session) => session.tutorId === currentUser.tutorId)
        .map((session) => ({
          ...session,
          kind: "group",
        }));

      const tutorAvailability = availabilityWindows
        .filter((window) => window.tutorId === currentUser.tutorId)
        .map((window) => ({
          ...window,
          kind: "availability",
        }));

      const tutorBlockedTimes = blockedTimes
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
  }, [currentUser, allBookings]);

  return (
    <section>
      <h1 style={{ color: C.white, marginTop: 0 }}>My Timetable</h1>

      <p style={{ color: C.muted, lineHeight: 1.6 }}>
        This page is personal to the signed-in user. Students see their booked
        sessions. Tutors see their teaching timetable, advertised group classes,
        availability, and blocked times.
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

        <div>
          <div style={{ color: C.white, fontWeight: 900, marginBottom: 8 }}>
            Calendar view
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["month", "week", "day"].map((view) => (
              <button
                key={view}
                onClick={() => setCalendarView(view)}
                style={{
                  background: calendarView === view ? C.spark : C.surface,
                  color: calendarView === view ? "#000" : C.text,
                  border: `1px solid ${
                    calendarView === view ? C.spark : C.border
                  }`,
                  borderRadius: 10,
                  padding: "9px 12px",
                  fontWeight: 900,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

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
            <span style={{ color: C.muted }}>● Blocked</span>
          </div>
        )}
      </div>

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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 12,
          }}
        >
          {weekDays.map((day) => {
            const dayEvents = visibleEvents.filter(
              (event) => getDateKey(event.startTime) === day.date
            );

            return (
              <div
                key={day.date}
                style={{
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  padding: 12,
                  minHeight: 180,
                }}
              >
                <div style={{ color: C.white, fontWeight: 950 }}>
                  {day.label}
                </div>
                <div style={{ color: C.muted, fontSize: 12 }}>{day.date}</div>

                {dayEvents.length > 0 ? (
                  dayEvents.map((event) => (
                    <TimetableEventCard
                      key={event.id}
                      event={event}
                      currentUser={currentUser}
                    />
                  ))
                ) : (
                  <div
                    style={{
                      color: C.muted,
                      fontSize: 13,
                      marginTop: 14,
                      lineHeight: 1.5,
                    }}
                  >
                    No sessions
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}