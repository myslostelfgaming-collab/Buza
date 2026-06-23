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

export default function TutorGroupClassCreator({
  currentUser,
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

  useEffect(() => {
    setSessionTypeId(tutor?.sessionTypes[0]?.id ?? "");
  }, [tutor?.id]);

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

  const createGroupClass = () => {
    if (!canCreateGroupClass) return;

    onAddAdvertisedSession({
      id: makeId("group"),
      tutorId: currentUser.tutorId,
      sessionTypeId,
      title: title.trim(),
      startTime: toDateTime(date, startTime),
      endTime: toDateTime(date, endTime),
      capacity: capacityNumber,
      pricePerLearner: priceNumber,
      bookedStudentIds: [],
      status: "advertised",
      isUserCreated: true,
    });
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
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Group class title"
          style={inputStyle}
        />

        <select
          value={sessionTypeId}
          onChange={(event) => setSessionTypeId(event.target.value)}
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
          onChange={(event) => setDate(event.target.value)}
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
            onChange={(event) => setStartTime(event.target.value)}
            style={inputStyle}
          />

          <input
            type="time"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
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
            onChange={(event) => setCapacity(event.target.value)}
            placeholder="Capacity"
            style={inputStyle}
          />

          <input
            type="number"
            min="0"
            value={pricePerLearner}
            onChange={(event) => setPricePerLearner(event.target.value)}
            placeholder="Price per learner"
            style={inputStyle}
          />
        </div>

        <button
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
      </div>
    </div>
  );
}