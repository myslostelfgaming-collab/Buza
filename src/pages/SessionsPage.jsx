import { useEffect, useMemo, useState } from "react";
import CalendarViewToggle from "../components/CalendarViewToggle";
import DayCalendar from "../components/DayCalendar";
import EventDetailPopover from "../components/EventDetailPopover";
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

export default function SessionsPage({
  currentUser,
  extraBookings = [],
  extraAvailabilityWindows = [],
  extraBlockedTimes = [],
  extraAdvertisedSessions = [],
  advertisedSessionBookingOverrides = {},
  bookingStatusOverrides = {},
  timetableFocus = null,
  onTimetableFocusHandled,
  onUpdateBookingStatus,
  onAddAvailabilityWindow,
  onUpdateAvailabilityWindow,
  onRemoveAvailabilityWindow,
  onAddBlockedTime,
  onUpdateBlockedTime,
  onRemoveBlockedTime,
  onAddAdvertisedSession,
  onUpdateAdvertisedSession,
  onRemoveAdvertisedSession,
}) {
  const [calendarView, setCalendarView] = useState("week");
  const [selectedDate, setSelectedDate] = useState("2026-06-23");
  const [focusedPopoverInfo, setFocusedPopoverInfo] = useState(null);

  useEffect(() => {
    if (!timetableFocus) {
      return;
    }

    setCalendarView("week");

    if (timetableFocus.eventDate) {
      setSelectedDate(timetableFocus.eventDate);
    }
  }, [timetableFocus]);

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
        [
          ...advertisedSessions.map((session) => ({
            ...session,
            isUserCreated: false,
          })),
          ...extraAdvertisedSessions.map((session) => ({
            ...session,
            isUserCreated: true,
          })),
        ],
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

  const handleFocusedEventReady = ({ event, anchorRect }) => {
    setFocusedPopoverInfo({
      event,
      anchorRect,
    });

    if (typeof onTimetableFocusHandled === "function") {
      onTimetableFocusHandled();
    }
  };

  const handleFocusedEventMissing = () => {
    if (typeof onTimetableFocusHandled === "function") {
      onTimetableFocusHandled();
    }
  };

  return (
    <section>
      <h1 style={{ color: C.white, marginTop: 0 }}>My Timetable</h1>

      <p style={{ color: C.muted, lineHeight: 1.6 }}>
        This page is personal to the signed-in user. Students see sessions they
        have booked or joined. Tutors see their teaching timetable, advertised
        group classes, availability, and blocked times.
      </p>

      {focusedPopoverInfo && (
        <div
          style={{
            background: C.spark + "18",
            border: `1px solid ${C.spark}`,
            borderRadius: 14,
            padding: 14,
            color: C.text,
            lineHeight: 1.6,
            marginTop: 16,
            marginBottom: 18,
          }}
        >
          Opened the timetable item linked to your notification.
        </div>
      )}

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
          onChange={(nextView) => {
            setCalendarView(nextView);
            setFocusedPopoverInfo(null);

            if (timetableFocus && typeof onTimetableFocusHandled === "function") {
              onTimetableFocusHandled();
            }
          }}
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
            validationEvents={visibleEvents}
            onAddAvailabilityWindow={onAddAvailabilityWindow}
            onAddBlockedTime={onAddBlockedTime}
          />

          <TutorGroupClassCreator
            currentUser={currentUser}
            validationEvents={visibleEvents}
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
            validationEvents={visibleEvents}
            currentUser={currentUser}
            timetableFocus={timetableFocus}
            onFocusedEventReady={handleFocusedEventReady}
            onFocusedEventMissing={handleFocusedEventMissing}
            onUpdateBookingStatus={onUpdateBookingStatus}
            onUpdateAdvertisedSession={onUpdateAdvertisedSession}
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
            onUpdateAdvertisedSession={onUpdateAdvertisedSession}
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
              setFocusedPopoverInfo(null);

              if (
                timetableFocus &&
                typeof onTimetableFocusHandled === "function"
              ) {
                onTimetableFocusHandled();
              }
            }}
            visibleEvents={visibleEvents}
            currentUser={currentUser}
            onUpdateBookingStatus={onUpdateBookingStatus}
            onUpdateAdvertisedSession={onUpdateAdvertisedSession}
            onRemoveAdvertisedSession={onRemoveAdvertisedSession}
            onUpdateAvailabilityWindow={onUpdateAvailabilityWindow}
            onRemoveAvailabilityWindow={onRemoveAvailabilityWindow}
            onUpdateBlockedTime={onUpdateBlockedTime}
            onRemoveBlockedTime={onRemoveBlockedTime}
          />
        )}
      </div>

      {focusedPopoverInfo && (
        <EventDetailPopover
          event={focusedPopoverInfo.event}
          anchorRect={focusedPopoverInfo.anchorRect}
          currentUser={currentUser}
          allEvents={visibleEvents}
          onClose={() => setFocusedPopoverInfo(null)}
          onUpdateBookingStatus={onUpdateBookingStatus}
          onUpdateAdvertisedSession={onUpdateAdvertisedSession}
          onRemoveAdvertisedSession={onRemoveAdvertisedSession}
          onUpdateAvailabilityWindow={onUpdateAvailabilityWindow}
          onRemoveAvailabilityWindow={onRemoveAvailabilityWindow}
          onUpdateBlockedTime={onUpdateBlockedTime}
          onRemoveBlockedTime={onRemoveBlockedTime}
        />
      )}
    </section>
  );
}