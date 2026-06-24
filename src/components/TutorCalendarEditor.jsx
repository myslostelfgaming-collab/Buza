import { useState } from "react";
import { C, inputStyle } from "../data/theme";

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function toDateTime(date, time) {
  return `${date}T${time}:00`;
}

function isValidTimeRange(startTime, endTime) {
  return startTime && endTime && startTime < endTime;
}

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

function getConflictEvent({ startTime, endTime, validationEvents, conflictKinds }) {
  return validationEvents.find((event) => {
    if (!conflictKinds.includes(event.kind)) {
      return false;
    }

    return eventsOverlap(startTime, endTime, event.startTime, event.endTime);
  });
}

function getConflictMessage(conflictEvent) {
  if (!conflictEvent) {
    return "";
  }

  const title =
    conflictEvent.title ??
    conflictEvent.topic ??
    conflictEvent.reason ??
    conflictEvent.kind ??
    "another timetable item";

  return `This time clashes with ${title} from ${formatDateTime(
    conflictEvent.startTime
  )} to ${formatDateTime(conflictEvent.endTime)}.`;
}

function ValidationError({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div
      style={{
        background: "rgba(248, 113, 113, 0.08)",
        border: "1px solid rgba(248, 113, 113, 0.35)",
        color: "#fecaca",
        borderRadius: 12,
        padding: 10,
        fontSize: 13,
        lineHeight: 1.45,
        fontWeight: 800,
      }}
    >
      {message}
    </div>
  );
}

export default function TutorCalendarEditor({
  currentUser,
  validationEvents = [],
  onAddAvailabilityWindow,
  onAddBlockedTime,
}) {
  const [availableTitle, setAvailableTitle] = useState(
    "Available for 1-on-1 lessons"
  );
  const [availableDate, setAvailableDate] = useState("2026-06-26");
  const [availableStart, setAvailableStart] = useState("13:00");
  const [availableEnd, setAvailableEnd] = useState("15:00");
  const [availabilityError, setAvailabilityError] = useState("");

  const [blockedReason, setBlockedReason] = useState("Unavailable");
  const [blockedDate, setBlockedDate] = useState("2026-06-26");
  const [blockedStart, setBlockedStart] = useState("15:00");
  const [blockedEnd, setBlockedEnd] = useState("16:00");
  const [blockedError, setBlockedError] = useState("");

  const canAddAvailability =
    currentUser.role === "tutor" &&
    availableDate &&
    isValidTimeRange(availableStart, availableEnd);

  const canAddBlockedTime =
    currentUser.role === "tutor" &&
    blockedReason.trim() &&
    blockedDate &&
    isValidTimeRange(blockedStart, blockedEnd);

  const updateAvailableTitle = (value) => {
    setAvailabilityError("");
    setAvailableTitle(value);
  };

  const updateAvailableDate = (value) => {
    setAvailabilityError("");
    setAvailableDate(value);
  };

  const updateAvailableStart = (value) => {
    setAvailabilityError("");
    setAvailableStart(value);
  };

  const updateAvailableEnd = (value) => {
    setAvailabilityError("");
    setAvailableEnd(value);
  };

  const updateBlockedReason = (value) => {
    setBlockedError("");
    setBlockedReason(value);
  };

  const updateBlockedDate = (value) => {
    setBlockedError("");
    setBlockedDate(value);
  };

  const updateBlockedStart = (value) => {
    setBlockedError("");
    setBlockedStart(value);
  };

  const updateBlockedEnd = (value) => {
    setBlockedError("");
    setBlockedEnd(value);
  };

  const addAvailability = () => {
    if (!canAddAvailability) {
      setAvailabilityError("Please choose a valid availability date and time range.");
      return;
    }

    const startTime = toDateTime(availableDate, availableStart);
    const endTime = toDateTime(availableDate, availableEnd);

    const conflictEvent = getConflictEvent({
      startTime,
      endTime,
      validationEvents,
      conflictKinds: ["blocked"],
    });

    if (conflictEvent) {
      setAvailabilityError(getConflictMessage(conflictEvent));
      return;
    }

    onAddAvailabilityWindow({
      id: makeId("avail"),
      tutorId: currentUser.tutorId,
      title: availableTitle.trim() || "Available",
      startTime,
      endTime,
      status: "available",
      isUserCreated: true,
    });

    setAvailabilityError("");
  };

  const addBlockedTime = () => {
    if (!blockedReason.trim()) {
      setBlockedError("Please enter a reason or label for the blocked time.");
      return;
    }

    if (!canAddBlockedTime) {
      setBlockedError("Please choose a valid blocked date and time range.");
      return;
    }

    const startTime = toDateTime(blockedDate, blockedStart);
    const endTime = toDateTime(blockedDate, blockedEnd);

    const conflictEvent = getConflictEvent({
      startTime,
      endTime,
      validationEvents,
      conflictKinds: ["booking", "group", "blocked"],
    });

    if (conflictEvent) {
      setBlockedError(getConflictMessage(conflictEvent));
      return;
    }

    onAddBlockedTime({
      id: makeId("blocked"),
      tutorId: currentUser.tutorId,
      title: blockedReason.trim() || "Unavailable",
      reason: blockedReason.trim() || "Unavailable",
      startTime,
      endTime,
      status: "blocked",
      isUserCreated: true,
    });

    setBlockedError("");
  };

  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        padding: 18,
        marginBottom: 18,
      }}
    >
      <h2 style={{ color: C.white, marginTop: 0 }}>Tutor Calendar Editor</h2>

      <p style={{ color: C.muted, lineHeight: 1.6 }}>
        This is a mock tutor-side editor. In the live app, this will save to the
        database and support recurring availability.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
          marginTop: 16,
        }}
      >
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: 16,
          }}
        >
          <h3 style={{ color: C.white, marginTop: 0 }}>
            Add available teaching window
          </h3>

          <div style={{ display: "grid", gap: 10 }}>
            <ValidationError message={availabilityError} />

            <input
              value={availableTitle}
              onChange={(event) => updateAvailableTitle(event.target.value)}
              placeholder="Availability title"
              style={inputStyle}
            />

            <input
              type="date"
              value={availableDate}
              onChange={(event) => updateAvailableDate(event.target.value)}
              style={inputStyle}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <input
                type="time"
                value={availableStart}
                onChange={(event) => updateAvailableStart(event.target.value)}
                style={inputStyle}
              />

              <input
                type="time"
                value={availableEnd}
                onChange={(event) => updateAvailableEnd(event.target.value)}
                style={inputStyle}
              />
            </div>

            <button
              type="button"
              onClick={addAvailability}
              disabled={!canAddAvailability}
              style={{
                background: C.green,
                color: "#000",
                border: "none",
                borderRadius: 12,
                padding: "12px 14px",
                fontWeight: 900,
                cursor: canAddAvailability ? "pointer" : "not-allowed",
                opacity: canAddAvailability ? 1 : 0.45,
              }}
            >
              Add availability
            </button>

            <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.45 }}>
              Availability may overlap bookings and group classes, but not blocked
              times.
            </div>
          </div>
        </div>

        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: 16,
          }}
        >
          <h3 style={{ color: C.white, marginTop: 0 }}>
            Add blocked / unavailable time
          </h3>

          <div style={{ display: "grid", gap: 10 }}>
            <ValidationError message={blockedError} />

            <input
              value={blockedReason}
              onChange={(event) => updateBlockedReason(event.target.value)}
              placeholder="Reason"
              style={inputStyle}
            />

            <input
              type="date"
              value={blockedDate}
              onChange={(event) => updateBlockedDate(event.target.value)}
              style={inputStyle}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <input
                type="time"
                value={blockedStart}
                onChange={(event) => updateBlockedStart(event.target.value)}
                style={inputStyle}
              />

              <input
                type="time"
                value={blockedEnd}
                onChange={(event) => updateBlockedEnd(event.target.value)}
                style={inputStyle}
              />
            </div>

            <button
              type="button"
              onClick={addBlockedTime}
              disabled={!canAddBlockedTime}
              style={{
                background: "transparent",
                color: "#F87171",
                border: "1px solid #F87171",
                borderRadius: 12,
                padding: "12px 14px",
                fontWeight: 900,
                cursor: canAddBlockedTime ? "pointer" : "not-allowed",
                opacity: canAddBlockedTime ? 1 : 0.45,
              }}
            >
              Add blocked time
            </button>

            <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.45 }}>
              Blocked time cannot overlap bookings, group classes, or other blocked
              times.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}