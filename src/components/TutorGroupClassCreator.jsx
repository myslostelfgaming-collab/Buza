import { useEffect, useMemo, useState } from "react";
import { tutors } from "../data/mockTutors";
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

export default function TutorGroupClassCreator({
  currentUser,
  validationEvents = [],
  onAddAdvertisedSession,
}) {
  const tutor = useMemo(
    () => tutors.find((item) => item.id === currentUser.tutorId) ?? null,
    [currentUser.tutorId]
  );

  const [title, setTitle] = useState("Grade 12 Maths Group Revision");
  const [sessionTypeId, setSessionTypeId] = useState("");
  const [date, setDate] = useState("2026-06-26");
  const [startTime, setStartTime] = useState("16:00");
  const [endTime, setEndTime] = useState("17:30");
  const [capacity, setCapacity] = useState("12");
  const [pricePerLearner, setPricePerLearner] = useState("80");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setSessionTypeId(tutor?.sessionTypes[0]?.id ?? "");
  }, [tutor?.id, tutor?.sessionTypes]);

  const selectedSessionType =
    tutor?.sessionTypes.find((session) => session.id === sessionTypeId) ?? null;

  const capacityNumber = Number(capacity);
  const priceNumber = Number(pricePerLearner);

  const canCreateGroupClass =
    currentUser.role === "tutor" &&
    tutor &&
    title.trim() &&
    sessionTypeId &&
    date &&
    isValidTimeRange(startTime, endTime) &&
    Number.isFinite(capacityNumber) &&
    capacityNumber > 0 &&
    Number.isFinite(priceNumber) &&
    priceNumber >= 0;

  const clearError = () => {
    setFormError("");
  };

  const createGroupClass = () => {
    if (!title.trim()) {
      setFormError("Please enter a title for the group class.");
      return;
    }

    if (!sessionTypeId) {
      setFormError("Please choose a session type.");
      return;
    }

    if (!date || !isValidTimeRange(startTime, endTime)) {
      setFormError("Please choose a valid date and time range.");
      return;
    }

    if (!Number.isFinite(capacityNumber) || capacityNumber < 1) {
      setFormError("Capacity must be at least 1 learner.");
      return;
    }

    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      setFormError("Price must be a valid amount of R0 or more.");
      return;
    }

    const startDateTime = toDateTime(date, startTime);
    const endDateTime = toDateTime(date, endTime);

    const conflictEvent = getConflictEvent({
      startTime: startDateTime,
      endTime: endDateTime,
      validationEvents,
      conflictKinds: ["booking", "group", "blocked"],
    });

    if (conflictEvent) {
      setFormError(getConflictMessage(conflictEvent));
      return;
    }

    onAddAdvertisedSession({
      id: makeId("group"),
      tutorId: currentUser.tutorId,
      sessionTypeId,
      title: title.trim(),
      startTime: startDateTime,
      endTime: endDateTime,
      capacity: capacityNumber,
      pricePerLearner: priceNumber,
      bookedStudentIds: [],
      status: "advertised",
      isUserCreated: true,
    });

    setFormError("");
  };

  if (!tutor) {
    return null;
  }

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
      <h2 style={{ color: C.white, marginTop: 0 }}>
        Create Advertised Group Class
      </h2>

      <p style={{ color: C.muted, lineHeight: 1.6 }}>
        This creates a group session that appears in the tutor timetable and
        blocks the same time from 1-on-1 bookings.
      </p>

      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: 16,
          display: "grid",
          gap: 12,
          marginTop: 16,
        }}
      >
        <ValidationError message={formError} />

        <input
          value={title}
          onChange={(event) => {
            clearError();
            setTitle(event.target.value);
          }}
          placeholder="Group class title"
          style={inputStyle}
        />

        <select
          value={sessionTypeId}
          onChange={(event) => {
            clearError();
            setSessionTypeId(event.target.value);
          }}
          style={{
            ...inputStyle,
            cursor: "pointer",
          }}
        >
          <option value="">Choose session type...</option>
          {tutor.sessionTypes.map((session) => (
            <option key={session.id} value={session.id}>
              {session.title} — {session.durationMinutes} min
            </option>
          ))}
        </select>

        {selectedSessionType && (
          <div
            style={{
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 12,
              color: C.muted,
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            Based on:{" "}
            <strong style={{ color: C.white }}>
              {selectedSessionType.title}
            </strong>{" "}
            · {selectedSessionType.format}
          </div>
        )}

        <input
          type="date"
          value={date}
          onChange={(event) => {
            clearError();
            setDate(event.target.value);
          }}
          style={inputStyle}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 10,
          }}
        >
          <input
            type="time"
            value={startTime}
            onChange={(event) => {
              clearError();
              setStartTime(event.target.value);
            }}
            style={inputStyle}
          />

          <input
            type="time"
            value={endTime}
            onChange={(event) => {
              clearError();
              setEndTime(event.target.value);
            }}
            style={inputStyle}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 10,
          }}
        >
          <input
            type="number"
            min="1"
            value={capacity}
            onChange={(event) => {
              clearError();
              setCapacity(event.target.value);
            }}
            placeholder="Capacity"
            style={inputStyle}
          />

          <input
            type="number"
            min="0"
            value={pricePerLearner}
            onChange={(event) => {
              clearError();
              setPricePerLearner(event.target.value);
            }}
            placeholder="Price per learner"
            style={inputStyle}
          />
        </div>

        <button
          type="button"
          onClick={createGroupClass}
          disabled={!canCreateGroupClass}
          style={{
            background: C.blue,
            color: "#000",
            border: "none",
            borderRadius: 12,
            padding: "12px 14px",
            fontWeight: 900,
            cursor: canCreateGroupClass ? "pointer" : "not-allowed",
            opacity: canCreateGroupClass ? 1 : 0.45,
          }}
        >
          Create group class
        </button>

        <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.45 }}>
          Group classes cannot overlap bookings, blocked times, or other group
          classes.
        </div>
      </div>
    </div>
  );
}