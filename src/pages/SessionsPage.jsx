import { useMemo, useState } from "react";
import CalendarViewToggle from "../components/CalendarViewToggle";
import DayCalendar from "../components/DayCalendar";
import MonthCalendar from "../components/MonthCalendar";
import TutorCalendarEditor from "../components/TutorCalendarEditor";
import TutorGroupClassCreator from "../components/TutorGroupClassCreator";
import WeekCalendar from "../components/WeekCalendar";
import { bookings, advertisedSessions } from "../data/mockBookings";
import { availabilityWindows, blockedTimes } from "../data/mockCalendar";
import {
  applyAdvertisedSessionBookingOverrides,
  applyBookingStatusOverrides,
} from "../data/scheduleUtils";
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

function formatDateTime(value) {
  if (!value) {
    return "No time set";
  }

  return value.replace("T", " ");
}

function SmallActionButton({ children, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: danger
          ? "1px solid rgba(248, 113, 113, 0.5)"
          : `1px solid ${C.border}`,
        background: danger ? "rgba(248, 113, 113, 0.08)" : C.bg,
        color: danger ? "#fecaca" : C.text,
        borderRadius: 999,
        padding: "6px 10px",
        fontWeight: 800,
        fontSize: 12,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function TutorDemoAvailabilityManager({
  currentUser,
  extraAvailabilityWindows,
  extraBlockedTimes,
  onUpdateAvailabilityWindow,
  onRemoveAvailabilityWindow,
  onUpdateBlockedTime,
  onRemoveBlockedTime,
}) {
  const tutorAvailabilityWindows = extraAvailabilityWindows.filter(
    (window) => window.tutorId === currentUser.tutorId
  );

  const tutorBlockedTimes = extraBlockedTimes.filter(
    (blocked) => blocked.tutorId === currentUser.tutorId
  );

  const editAvailabilityWindow = (availabilityWindow) => {
    const startTime = window.prompt(
      "Edit availability start time:",
      availabilityWindow.startTime
    );

    if (startTime === null) {
      return;
    }

    const endTime = window.prompt(
      "Edit availability end time:",
      availabilityWindow.endTime
    );

    if (endTime === null) {
      return;
    }

    onUpdateAvailabilityWindow(availabilityWindow.id, {
      startTime: startTime.trim(),
      endTime: endTime.trim(),
    });
  };

  const deleteAvailabilityWindow = (availabilityWindow) => {
    const confirmed = window.confirm(
      `Delete this availability window?\n\n${formatDateTime(
        availabilityWindow.startTime
      )} → ${formatDateTime(availabilityWindow.endTime)}`
    );

    if (!confirmed) {
      return;
    }

    onRemoveAvailabilityWindow(availabilityWindow.id);
  };

  const editBlockedTime = (blockedTime) => {
    const startTime = window.prompt(
      "Edit blocked time start:",
      blockedTime.startTime
    );

    if (startTime === null) {
      return;
    }

    const endTime = window.prompt(
      "Edit blocked time end:",
      blockedTime.endTime
    );

    if (endTime === null) {
      return;
    }

    const title = window.prompt(
      "Edit blocked time label/reason:",
      blockedTime.title ?? blockedTime.reason ?? "Unavailable"
    );

    if (title === null) {
      return;
    }

    onUpdateBlockedTime(blockedTime.id, {
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      title: title.trim() || "Unavailable",
      reason: title.trim() || "Unavailable",
    });
  };

  const deleteBlockedTime = (blockedTime) => {
    const confirmed = window.confirm(
      `Delete this blocked time?\n\n${formatDateTime(
        blockedTime.startTime
      )} → ${formatDateTime(blockedTime.endTime)}`
    );

    if (!confirmed) {
      return;
    }

    onRemoveBlockedTime(blockedTime.id);
  };

  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: 16,
        marginTop: 16,
        marginBottom: 18,
        display: "grid",
        gap: 16,
      }}
    >
      <div>
        <h2 style={{ color: C.white, margin: 0, fontSize: 18 }}>
          Tutor demo controls
        </h2>
        <p style={{ color: C.muted, marginBottom: 0, lineHeight: 1.5 }}>
          Manage availability and blocked times created during this demo. Seed
          demo data remains fixed.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        }}
      >
        <div
          style={{
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: 14,
            background: C.bg,
          }}
        >
          <h3 style={{ color: C.green, marginTop: 0, fontSize: 15 }}>
            Added availability
          </h3>

          {tutorAvailabilityWindows.length === 0 ? (
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 0 }}>
              No demo-created availability windows yet.
            </p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {tutorAvailabilityWindows.map((availabilityWindow) => (
                <div
                  key={availabilityWindow.id}
                  style={{
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: 12,
                    background: C.card,
                    display: "grid",
                    gap: 8,
                  }}
                >
                  <div style={{ color: C.white, fontWeight: 850 }}>
                    Available
                  </div>
                  <div style={{ color: C.muted, fontSize: 13 }}>
                    {formatDateTime(availabilityWindow.startTime)} →{" "}
                    {formatDateTime(availabilityWindow.endTime)}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <SmallActionButton
                      onClick={() => editAvailabilityWindow(availabilityWindow)}
                    >
                      Edit
                    </SmallActionButton>
                    <SmallActionButton
                      danger
                      onClick={() =>
                        deleteAvailabilityWindow(availabilityWindow)
                      }
                    >
                      Delete
                    </SmallActionButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: 14,
            background: C.bg,
          }}
        >
          <h3 style={{ color: "#F87171", marginTop: 0, fontSize: 15 }}>
            Added blocked times
          </h3>

          {tutorBlockedTimes.length === 0 ? (
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 0 }}>
              No demo-created blocked times yet.
            </p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {tutorBlockedTimes.map((blockedTime) => (
                <div
                  key={blockedTime.id}
                  style={{
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: 12,
                    background: C.card,
                    display: "grid",
                    gap: 8,
                  }}
                >
                  <div style={{ color: C.white, fontWeight: 850 }}>
                    {blockedTime.title ?? blockedTime.reason ?? "Unavailable"}
                  </div>
                  <div style={{ color: C.muted, fontSize: 13 }}>
                    {formatDateTime(blockedTime.startTime)} →{" "}
                    {formatDateTime(blockedTime.endTime)}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <SmallActionButton onClick={() => editBlockedTime(blockedTime)}>
                      Edit
                    </SmallActionButton>
                    <SmallActionButton
                      danger
                      onClick={() => deleteBlockedTime(blockedTime)}
                    >
                      Delete
                    </SmallActionButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
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
  onUpdateAvailabilityWindow,
  onRemoveAvailabilityWindow,
  onAddBlockedTime,
  onUpdateBlockedTime,
  onRemoveBlockedTime,
  onAddAdvertisedSession,
  onRemoveAdvertisedSession,
}) {
  const [calendarView, setCalendarView] = useState("week");
  const [selectedDate, setSelectedDate] = useState("2026-06-23");

  const allBookings = useMemo(
    () =>
      applyBookingStatusOverrides(
        [...bookings, ...extraBookings],
        bookingStatusOverrides
      ),
    [extraBookings, bookingStatusOverrides]
  );

  const allAvailabilityWindows = useMemo(
  () => [
    ...availabilityWindows.map((availabilityWindow) => ({
      ...availabilityWindow,
      isUserCreated: false,
    })),
    ...extraAvailabilityWindows.map((availabilityWindow) => ({
      ...availabilityWindow,
      isUserCreated: true,
    })),
  ],
  [extraAvailabilityWindows]
);

  const allBlockedTimes = useMemo(
    () => [
      ...blockedTimes.map((blockedTime) => ({
        ...blockedTime,
        isUserCreated: false,
      })),
      ...extraBlockedTimes.map((blockedTime) => ({
        ...blockedTime,
        isUserCreated: true,
      })),
    ],
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

          <TutorDemoAvailabilityManager
            currentUser={currentUser}
            extraAvailabilityWindows={extraAvailabilityWindows}
            extraBlockedTimes={extraBlockedTimes}
            onUpdateAvailabilityWindow={onUpdateAvailabilityWindow}
            onRemoveAvailabilityWindow={onRemoveAvailabilityWindow}
            onUpdateBlockedTime={onUpdateBlockedTime}
            onRemoveBlockedTime={onRemoveBlockedTime}
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
            <h2 style={{ color: C.white, margin: 0 }}>
              Week of 22–28 June 2026
            </h2>
            <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
              Viewing as {currentUser.name} · {currentUser.role}
            </div>
          </div>

          <div style={{ color: C.muted, fontSize: 13 }}>
            {visibleEvents.length} timetable item
            {visibleEvents.length === 1 ? "" : "s"}
          </div>
        </div>

        {calendarView === "week" && (
          <WeekCalendar
            weekDays={weekDays}
            visibleEvents={visibleEvents}
            currentUser={currentUser}
            onUpdateBookingStatus={onUpdateBookingStatus}
            onRemoveAdvertisedSession={onRemoveAdvertisedSession}
            onUpdateAvailabilityWindow={onUpdateAvailabilityWindow}
            onRemoveAvailabilityWindow={onRemoveAvailabilityWindow}
            onUpdateBlockedTime={onUpdateBlockedTime}
            onRemoveBlockedTime={onRemoveBlockedTime}
          />
        )}

        {calendarView === "day" && (
          <DayCalendar
            selectedDate={selectedDate}
            onSelectedDateChange={setSelectedDate}
            visibleEvents={visibleEvents}
            currentUser={currentUser}
            onUpdateBookingStatus={onUpdateBookingStatus}
            onRemoveAdvertisedSession={onRemoveAdvertisedSession}
            onUpdateAvailabilityWindow={onUpdateAvailabilityWindow}
            onRemoveAvailabilityWindow={onRemoveAvailabilityWindow}
            onUpdateBlockedTime={onUpdateBlockedTime}
            onRemoveBlockedTime={onRemoveBlockedTime}
          />
        )}

        {calendarView === "month" && (
          <MonthCalendar
            selectedDate={selectedDate}
            onSelectedDateChange={setSelectedDate}
            onOpenDay={(date) => {
              setSelectedDate(date);
              setCalendarView("day");
            }}
            visibleEvents={visibleEvents}
            currentUser={currentUser}
            onUpdateBookingStatus={onUpdateBookingStatus}
            onRemoveAdvertisedSession={onRemoveAdvertisedSession}
            onUpdateAvailabilityWindow={onUpdateAvailabilityWindow}
            onRemoveAvailabilityWindow={onRemoveAvailabilityWindow}
            onUpdateBlockedTime={onUpdateBlockedTime}
            onRemoveBlockedTime={onRemoveBlockedTime}
          />
        )}
      </div>
    </section>
  );
}