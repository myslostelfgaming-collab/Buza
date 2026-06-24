import WeekCalendar from "./WeekCalendar";
import { C, inputStyle } from "../data/theme";

function getDateKey(dateTime) {
  return typeof dateTime === "string" ? dateTime.slice(0, 10) : "";
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function toDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

function addDays(dateKey, amount) {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + amount);

  return toDateKey(date);
}

function getDayLabel(dateKey) {
  return parseDateKey(dateKey).toLocaleDateString([], {
    weekday: "short",
  });
}

function getReadableDate(dateKey) {
  return parseDateKey(dateKey).toLocaleDateString([], {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function DayCalendar({
  selectedDate,
  onSelectedDateChange,
  visibleEvents,
  currentUser,
  onUpdateBookingStatus,
  onRemoveAdvertisedSession,
  onUpdateAvailabilityWindow,
  onRemoveAvailabilityWindow,
  onUpdateBlockedTime,
  onRemoveBlockedTime,
}) {
  const selectedDay = {
    label: getDayLabel(selectedDate),
    date: selectedDate,
  };

  const dayEvents = visibleEvents.filter(
    (event) => getDateKey(event.startTime) === selectedDate
  );

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
          alignItems: "end",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              color: C.white,
              fontWeight: 900,
              fontSize: 13,
              marginBottom: 6,
            }}
          >
            Day
          </label>

          <input
            type="date"
            value={selectedDate}
            onChange={(event) => onSelectedDateChange(event.target.value)}
            style={{
              ...inputStyle,
              padding: "9px 10px",
              cursor: "pointer",
            }}
          />
        </div>

        <button
          type="button"
          onClick={() => onSelectedDateChange(addDays(selectedDate, -1))}
          style={{
            background: C.card,
            color: C.text,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: "10px 12px",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          ← Previous
        </button>

        <button
          type="button"
          onClick={() => onSelectedDateChange(addDays(selectedDate, 1))}
          style={{
            background: C.card,
            color: C.text,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: "10px 12px",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          Next →
        </button>

        <div
          style={{
            color: C.muted,
            fontSize: 13,
            lineHeight: 1.5,
            maxWidth: 390,
          }}
        >
          Showing {getReadableDate(selectedDate)}. {dayEvents.length} item
          {dayEvents.length === 1 ? "" : "s"} for {currentUser.name}.
        </div>
      </div>

      <WeekCalendar
        weekDays={[selectedDay]}
        visibleEvents={dayEvents}
        currentUser={currentUser}
        onUpdateBookingStatus={onUpdateBookingStatus}
        onRemoveAdvertisedSession={onRemoveAdvertisedSession}
        onUpdateAvailabilityWindow={onUpdateAvailabilityWindow}
        onRemoveAvailabilityWindow={onRemoveAvailabilityWindow}
        onUpdateBlockedTime={onUpdateBlockedTime}
        onRemoveBlockedTime={onRemoveBlockedTime}
      />
    </div>
  );
}