import { useState } from "react";
import EventDetailPopover from "./EventDetailPopover";
import { tutors } from "../data/mockTutors";
import { C } from "../data/theme";

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function pad(value) {
  return String(value).padStart(2, "0");
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return {
    year,
    month: month - 1,
    day,
  };
}

function toDateKey(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function getDateKey(dateTime) {
  return typeof dateTime === "string" ? dateTime.slice(0, 10) : "";
}

function getMonthDays(selectedDate) {
  const { year, month } = parseDateKey(selectedDate);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const firstDayMondayIndex = (firstDay.getDay() + 6) % 7;
  const days = [];

  for (let index = 0; index < firstDayMondayIndex; index += 1) {
    days.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push({
      day,
      date: toDateKey(year, month, day),
    });
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

function getMonthTitle(selectedDate) {
  const { year, month } = parseDateKey(selectedDate);

  return new Date(year, month, 1).toLocaleDateString([], {
    month: "long",
    year: "numeric",
  });
}

function addMonths(dateKey, amount) {
  const { year, month } = parseDateKey(dateKey);
  const nextDate = new Date(year, month + amount, 1);

  return toDateKey(nextDate.getFullYear(), nextDate.getMonth(), 1);
}

function formatTime(dateTime) {
  return new Date(dateTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTutor(tutorId) {
  return tutors.find((tutor) => tutor.id === tutorId) ?? null;
}

function getSessionType(tutor, sessionTypeId) {
  return tutor?.sessionTypes.find((session) => session.id === sessionTypeId) ?? null;
}

function getEventTitle(event) {
  const tutor = getTutor(event.tutorId);
  const sessionType = getSessionType(tutor, event.sessionTypeId);

  if (event.kind === "availability") return event.title;
  if (event.kind === "blocked") return event.title;
  if (event.kind === "group") return event.title;
  return sessionType?.title ?? "Session";
}

function statusColor(status) {
  if (status === "confirmed") return C.green;
  if (status === "pending") return C.spark;
  if (status === "advertised") return C.blue;
  if (status === "available") return C.green;
  if (status === "declined") return "#F87171";
  if (status === "cancelled") return "#F87171";
  if (status === "blocked") return C.muted;
  return C.muted;
}

function sortByStartTime(events) {
  return [...events].sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export default function MonthCalendar({
  selectedDate,
  onSelectedDateChange,
  onOpenDay,
  visibleEvents,
  currentUser,
  onUpdateBookingStatus,
  onRemoveAdvertisedSession,
  onUpdateAvailabilityWindow,
  onRemoveAvailabilityWindow,
  onUpdateBlockedTime,
  onRemoveBlockedTime,
}) {
  const [selectedEventInfo, setSelectedEventInfo] = useState(null);

  const monthDays = getMonthDays(selectedDate);
  const monthTitle = getMonthTitle(selectedDate);

  const goToPreviousMonth = () => {
    onSelectedDateChange(addMonths(selectedDate, -1));
  };

  const goToNextMonth = () => {
    onSelectedDateChange(addMonths(selectedDate, 1));
  };

  return (
    <div>
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: 14,
          marginBottom: 14,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h3 style={{ color: C.white, margin: 0 }}>{monthTitle}</h3>
          <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
            Month overview for {currentUser.name}. Click a day to open Day view.
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={goToPreviousMonth}
            style={{
              background: C.card,
              color: C.text,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: "9px 12px",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            ← Previous month
          </button>

          <button
            type="button"
            onClick={goToNextMonth}
            style={{
              background: C.card,
              color: C.text,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: "9px 12px",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Next month →
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          overflow: "hidden",
          background: C.bg,
        }}
      >
        {weekdayLabels.map((label) => (
          <div
            key={label}
            style={{
              background: C.surface,
              color: C.white,
              fontWeight: 950,
              fontSize: 13,
              padding: 10,
              borderRight: `1px solid ${C.border}`,
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            {label}
          </div>
        ))}

        {monthDays.map((day, index) => {
          if (!day) {
            return (
              <div
                key={`blank-${index}`}
                style={{
                  minHeight: 126,
                  background: "rgba(255,255,255,0.015)",
                  borderRight: `1px solid ${C.border}`,
                  borderBottom: `1px solid ${C.border}`,
                }}
              />
            );
          }

          const dayEvents = sortByStartTime(
            visibleEvents.filter((event) => getDateKey(event.startTime) === day.date)
          );

          const visibleDayEvents = dayEvents.slice(0, 3);
          const hiddenEventCount = Math.max(
            0,
            dayEvents.length - visibleDayEvents.length
          );
          const isSelectedDate = day.date === selectedDate;

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onOpenDay(day.date)}
              style={{
                minHeight: 126,
                background: isSelectedDate ? C.violet + "18" : C.bg,
                border: "none",
                borderRight: `1px solid ${C.border}`,
                borderBottom: `1px solid ${C.border}`,
                padding: 9,
                textAlign: "left",
                cursor: "pointer",
                fontFamily: "inherit",
                color: C.text,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    color: isSelectedDate ? C.white : C.text,
                    fontWeight: 950,
                    fontSize: 14,
                  }}
                >
                  {day.day}
                </span>

                {dayEvents.length > 0 && (
                  <span
                    style={{
                      color: C.muted,
                      fontSize: 11,
                      fontWeight: 900,
                    }}
                  >
                    {dayEvents.length}
                  </span>
                )}
              </div>

              <div style={{ display: "grid", gap: 5 }}>
                {visibleDayEvents.map((event) => {
                  const color = statusColor(event.status);
                  const title = getEventTitle(event);

                  return (
                    <button
                      key={event.id}
                      type="button"
                      title={`${formatTime(event.startTime)} · ${title}`}
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        setSelectedEventInfo({
                          event,
                          anchorRect:
                            clickEvent.currentTarget.getBoundingClientRect(),
                        });
                      }}
                      style={{
                        width: "100%",
                        background: C.surface,
                        color: C.text,
                        border: `1px solid ${C.border}`,
                        borderLeft: `4px solid ${color}`,
                        borderRadius: 8,
                        padding: "5px 6px",
                        fontFamily: "inherit",
                        textAlign: "left",
                        cursor: "pointer",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          color: C.white,
                          fontSize: 10,
                          fontWeight: 950,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {formatTime(event.startTime)}
                      </div>

                      <div
                        style={{
                          color: C.text,
                          fontSize: 10,
                          fontWeight: 800,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          marginTop: 2,
                        }}
                      >
                        {title}
                      </div>
                    </button>
                  );
                })}

                {hiddenEventCount > 0 && (
                  <div
                    style={{
                      color: C.muted,
                      fontSize: 11,
                      fontWeight: 900,
                      padding: "3px 2px",
                    }}
                  >
                    +{hiddenEventCount} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedEventInfo && (
        <EventDetailPopover
          event={selectedEventInfo.event}
          anchorRect={selectedEventInfo.anchorRect}
          currentUser={currentUser}
          onClose={() => setSelectedEventInfo(null)}
          onUpdateBookingStatus={onUpdateBookingStatus}
          onRemoveAdvertisedSession={onRemoveAdvertisedSession}
          onUpdateAvailabilityWindow={onUpdateAvailabilityWindow}
          onRemoveAvailabilityWindow={onRemoveAvailabilityWindow}
          onUpdateBlockedTime={onUpdateBlockedTime}
          onRemoveBlockedTime={onRemoveBlockedTime}
        />
      )}
    </div>
  );
}