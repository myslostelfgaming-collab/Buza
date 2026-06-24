import { useState } from "react";
import EventDetailPopover from "./EventDetailPopover";
import TimetableEventCard from "./TimetableEventCard";
import { C, inputStyle } from "../data/theme";

const DEFAULT_START_TIME = "13:00";
const DEFAULT_END_TIME = "20:00";
const TIME_STEP_MINUTES = 30;

const zoomSettings = {
  compact: {
    label: "Compact",
    rowHeight: 44,
  },
  normal: {
    label: "Normal",
    rowHeight: 64,
  },
  spacious: {
    label: "Spacious",
    rowHeight: 92,
  },
};

function pad(value) {
  return String(value).padStart(2, "0");
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${pad(hours)}:${pad(minutes)}`;
}

function generateTimeOptions() {
  const options = [];

  for (let minutes = 6 * 60; minutes <= 22 * 60 + 30; minutes += 30) {
    options.push(minutesToTime(minutes));
  }

  return options;
}

function generateTimeSlots(startTime, endTime) {
  const slots = [];
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  for (let minutes = start; minutes < end; minutes += TIME_STEP_MINUTES) {
    slots.push(minutesToTime(minutes));
  }

  return slots;
}

function getDateKey(dateTime) {
  return typeof dateTime === "string" ? dateTime.slice(0, 10) : "";
}

function getMinutesFromDateTime(dateTime) {
  const date = new Date(dateTime);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.getHours() * 60 + date.getMinutes();
}

function sortEventsForLayering(events) {
  return [...events].sort((a, b) => {
    const layerDifference = getEventLayer(a) - getEventLayer(b);

    if (layerDifference !== 0) {
      return layerDifference;
    }

    return a.startTime.localeCompare(b.startTime);
  });
}

function getEventLayer(event) {
  if (event.kind === "availability") return 1;
  if (event.kind === "blocked") return 2;
  if (event.kind === "group") return 3;
  if (event.kind === "booking") return 4;
  return 2;
}

function eventOverlapsWindow(event, startTime, endTime) {
  const eventStart = getMinutesFromDateTime(event.startTime);
  const eventEnd = getMinutesFromDateTime(event.endTime);
  const windowStart = timeToMinutes(startTime);
  const windowEnd = timeToMinutes(endTime);

  if (eventStart === null || eventEnd === null) {
    return false;
  }

  return eventStart < windowEnd && eventEnd > windowStart;
}

function getEventGridPosition(event, startTime, endTime) {
  const eventStart = getMinutesFromDateTime(event.startTime);
  const eventEnd = getMinutesFromDateTime(event.endTime);
  const windowStart = timeToMinutes(startTime);
  const windowEnd = timeToMinutes(endTime);

  if (eventStart === null || eventEnd === null) {
    return null;
  }

  const clippedStart = Math.max(eventStart, windowStart);
  const clippedEnd = Math.min(eventEnd, windowEnd);

  const startOffset = clippedStart - windowStart;
  const duration = Math.max(clippedEnd - clippedStart, TIME_STEP_MINUTES);

  const rowStart = Math.floor(startOffset / TIME_STEP_MINUTES) + 2;
  const rowSpan = Math.max(1, Math.ceil(duration / TIME_STEP_MINUTES));

  return {
    rowStart,
    rowSpan,
  };
}

export default function WeekCalendar({
  weekDays,
  visibleEvents,
  validationEvents = visibleEvents,
  currentUser,
  onUpdateBookingStatus,
  onUpdateAdvertisedSession,
  onRemoveAdvertisedSession,
  onUpdateAvailabilityWindow,
  onRemoveAvailabilityWindow,
  onUpdateBlockedTime,
  onRemoveBlockedTime,
}) {
  const [startTime, setStartTime] = useState(DEFAULT_START_TIME);
  const [endTime, setEndTime] = useState(DEFAULT_END_TIME);
  const [zoom, setZoom] = useState("compact");
  const [selectedEventInfo, setSelectedEventInfo] = useState(null);

  const timeOptions = generateTimeOptions();
  const timeSlots = generateTimeSlots(startTime, endTime);
  const rowHeight = zoomSettings[zoom].rowHeight;

  const eventsInsideWindow = sortEventsForLayering(
    visibleEvents.filter((event) => eventOverlapsWindow(event, startTime, endTime))
  );

  const eventsOutsideWindow = visibleEvents.filter(
    (event) => !eventOverlapsWindow(event, startTime, endTime)
  );

  const updateStartTime = (value) => {
    setStartTime(value);

    if (timeToMinutes(endTime) <= timeToMinutes(value)) {
      setEndTime(minutesToTime(timeToMinutes(value) + 60));
    }
  };

  const updateEndTime = (value) => {
    if (timeToMinutes(value) > timeToMinutes(startTime)) {
      setEndTime(value);
    }
  };

  const endTimeOptions = timeOptions.filter(
    (option) => timeToMinutes(option) > timeToMinutes(startTime)
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "end",
          marginBottom: 14,
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: 14,
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
            Start time
          </label>

          <select
            value={startTime}
            onChange={(event) => updateStartTime(event.target.value)}
            style={{
              ...inputStyle,
              padding: "9px 10px",
              cursor: "pointer",
            }}
          >
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

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
            End time
          </label>

          <select
            value={endTime}
            onChange={(event) => updateEndTime(event.target.value)}
            style={{
              ...inputStyle,
              padding: "9px 10px",
              cursor: "pointer",
            }}
          >
            {endTimeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

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
            Zoom
          </label>

          <select
            value={zoom}
            onChange={(event) => setZoom(event.target.value)}
            style={{
              ...inputStyle,
              padding: "9px 10px",
              cursor: "pointer",
            }}
          >
            {Object.entries(zoomSettings).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            color: C.muted,
            fontSize: 13,
            lineHeight: 1.5,
            maxWidth: 420,
          }}
        >
          Showing {startTime}–{endTime} in 30-minute blocks.
          {eventsOutsideWindow.length > 0 && (
            <>
              {" "}
              {eventsOutsideWindow.length} item
              {eventsOutsideWindow.length === 1 ? "" : "s"} outside this window.
            </>
          )}
        </div>
      </div>

      <div
        style={{
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          background: C.bg,
          overflow: "visible",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `76px repeat(${weekDays.length}, minmax(0, 1fr))`,
            gridTemplateRows: `58px repeat(${timeSlots.length}, ${rowHeight}px)`,
            width: "100%",
          }}
        >
          <div
            style={{
              gridColumn: 1,
              gridRow: 1,
              background: C.bg,
              borderRight: `1px solid ${C.border}`,
              borderBottom: `1px solid ${C.border}`,
              padding: 12,
              color: C.muted,
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            Time
          </div>

          {weekDays.map((day, dayIndex) => (
            <div
              key={day.date}
              style={{
                gridColumn: dayIndex + 2,
                gridRow: 1,
                background: C.surface,
                borderBottom: `1px solid ${C.border}`,
                borderRight: `1px solid ${C.border}`,
                padding: 12,
                minWidth: 0,
              }}
            >
              <div style={{ color: C.white, fontWeight: 950 }}>{day.label}</div>
              <div style={{ color: C.muted, fontSize: 12 }}>{day.date}</div>
            </div>
          ))}

          {timeSlots.map((timeSlot, slotIndex) => (
            <div
              key={`${timeSlot}-label`}
              style={{
                gridColumn: 1,
                gridRow: slotIndex + 2,
                background: C.bg,
                borderRight: `1px solid ${C.border}`,
                borderBottom: `1px solid ${C.border}`,
                padding: "8px 6px",
                color: C.muted,
                fontSize: 11,
                fontWeight: 900,
              }}
            >
              {timeSlot}
            </div>
          ))}

          {timeSlots.map((timeSlot, slotIndex) =>
            weekDays.map((day, dayIndex) => (
              <div
                key={`${day.date}-${timeSlot}`}
                style={{
                  gridColumn: dayIndex + 2,
                  gridRow: slotIndex + 2,
                  borderRight: `1px solid ${C.border}`,
                  borderBottom: `1px solid ${C.border}`,
                  background: "rgba(255,255,255,0.01)",
                  minWidth: 0,
                }}
              />
            ))
          )}

          {eventsInsideWindow.map((event) => {
            const dayIndex = weekDays.findIndex(
              (day) => day.date === getDateKey(event.startTime)
            );

            if (dayIndex === -1) {
              return null;
            }

            const position = getEventGridPosition(event, startTime, endTime);

            if (!position) {
              return null;
            }

            return (
              <div
                key={event.id}
                style={{
                  gridColumn: dayIndex + 2,
                  gridRow: `${position.rowStart} / span ${position.rowSpan}`,
                  zIndex: getEventLayer(event),
                  padding: zoom === "compact" ? 3 : 5,
                  minWidth: 0,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    overflow: "hidden",
                  }}
                >
                  <TimetableEventCard
                    event={event}
                    currentUser={currentUser}
                    compact={zoom === "compact"}
                    onSelectEvent={(selectedEvent, anchorRect) =>
                      setSelectedEventInfo({
                        event: selectedEvent,
                        anchorRect,
                      })
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedEventInfo && (
        <EventDetailPopover
          event={selectedEventInfo.event}
          anchorRect={selectedEventInfo.anchorRect}
          currentUser={currentUser}
          allEvents={validationEvents}
          onClose={() => setSelectedEventInfo(null)}
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
  );
}