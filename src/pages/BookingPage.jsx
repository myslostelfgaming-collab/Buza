import { useEffect, useMemo, useState } from "react";
import Avatar from "../components/Avatar";
import Pill from "../components/Pill";
import TutorPicker from "../components/TutorPicker";
import {
  formatSlotDate,
  formatSlotTimeRange,
  getAvailableSlotsForTutor,
} from "../data/calendarUtils";
import { tutors } from "../data/mockTutors";
import { C, inputStyle } from "../data/theme";

export default function BookingPage({ tutorId, onSelectTutor, setPage }) {
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");

  const tutor = tutors.find((item) => item.id === tutorId) ?? null;

  const selectedSession =
    tutor?.sessionTypes.find((session) => session.id === selectedSessionId) ??
    null;

  const availableSlots = useMemo(() => {
    if (!tutor || !selectedSession) {
      return [];
    }

    return getAvailableSlotsForTutor({
      tutorId: tutor.id,
      durationMinutes: selectedSession.durationMinutes,
    });
  }, [tutor, selectedSession]);

  const selectedSlot =
    availableSlots.find((slot) => slot.id === selectedSlotId) ?? null;

  useEffect(() => {
    setSelectedSessionId("");
    setSelectedSlotId("");
  }, [tutorId]);

  useEffect(() => {
    setSelectedSlotId("");
  }, [selectedSessionId]);

  return (
    <section>
      <button
        onClick={() => (tutor ? setPage("profile") : setPage("home"))}
        style={{
          background: "transparent",
          border: `1px solid ${C.border}`,
          color: C.muted,
          borderRadius: 10,
          padding: "8px 12px",
          fontWeight: 700,
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        {tutor ? "← Back to tutor profile" : "← Back to home"}
      </button>

      <h1 style={{ color: C.white, marginTop: 0 }}>Book a Session</h1>

      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          padding: 22,
          maxWidth: 760,
        }}
      >
        <div style={{ marginBottom: 18 }}>
          <TutorPicker
            tutors={tutors}
            selectedTutorId={tutorId}
            onSelectTutor={onSelectTutor}
          />
        </div>

        {tutor ? (
          <>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <Avatar initials={tutor.initials} color={tutor.color} />

              <div>
                <div style={{ color: C.muted, fontSize: 13, fontWeight: 700 }}>
                  Booking with
                </div>
                <h2 style={{ margin: 0, color: C.white }}>{tutor.name}</h2>
                <div style={{ color: C.muted, fontSize: 13 }}>
                  {tutor.grades} · {tutor.location}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
              {tutor.subjects.map((subject) => (
                <Pill key={subject}>{subject}</Pill>
              ))}
            </div>

            <div style={{ marginTop: 22 }}>
              <label
                style={{
                  display: "block",
                  color: C.white,
                  fontWeight: 900,
                  marginBottom: 8,
                }}
              >
                Choose a session type
              </label>

              <select
                value={selectedSessionId}
                onChange={(event) => setSelectedSessionId(event.target.value)}
                style={{
                  ...inputStyle,
                  width: "100%",
                  cursor: "pointer",
                }}
              >
                <option value="">Select a session type...</option>
                {tutor.sessionTypes.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.title} — {session.durationMinutes} min — R
                    {session.price}
                  </option>
                ))}
              </select>
            </div>

            {selectedSession && (
              <div
                style={{
                  marginTop: 20,
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ color: C.white, fontWeight: 900 }}>
                      {selectedSession.title}
                    </div>
                    <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
                      {selectedSession.durationMinutes} min ·{" "}
                      {selectedSession.format}
                    </div>
                  </div>

                  <div style={{ color: C.spark, fontWeight: 950 }}>
                    R{selectedSession.price}
                  </div>
                </div>

                <div
                  style={{
                    color: C.muted,
                    fontSize: 13,
                    lineHeight: 1.6,
                    marginTop: 10,
                  }}
                >
                  {selectedSession.description}
                </div>
              </div>
            )}

            <div style={{ marginTop: 22 }}>
              <label
                style={{
                  display: "block",
                  color: C.white,
                  fontWeight: 900,
                  marginBottom: 8,
                }}
              >
                Choose an available slot
              </label>

              {!selectedSession && (
                <div
                  style={{
                    background: C.surface,
                    border: `1px dashed ${C.border}`,
                    borderRadius: 14,
                    padding: 16,
                    color: C.muted,
                    lineHeight: 1.6,
                  }}
                >
                  Choose a session type first, then available calendar slots will
                  appear here.
                </div>
              )}

              {selectedSession && availableSlots.length === 0 && (
                <div
                  style={{
                    background: C.surface,
                    border: `1px dashed ${C.border}`,
                    borderRadius: 14,
                    padding: 16,
                    color: C.muted,
                    lineHeight: 1.6,
                  }}
                >
                  No available slots for this tutor and session type in the
                  current demo week.
                </div>
              )}

              {selectedSession && availableSlots.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 10,
                  }}
                >
                  {availableSlots.map((slot) => {
                    const isSelected = slot.id === selectedSlotId;

                    return (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlotId(slot.id)}
                        style={{
                          background: isSelected ? C.spark : C.surface,
                          color: isSelected ? "#000" : C.text,
                          border: `1px solid ${
                            isSelected ? C.spark : C.border
                          }`,
                          borderRadius: 12,
                          padding: 12,
                          textAlign: "left",
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        <div style={{ fontWeight: 950 }}>
                          {formatSlotDate(slot.startTime)}
                        </div>
                        <div
                          style={{
                            color: isSelected ? "#000" : C.muted,
                            fontSize: 13,
                            marginTop: 4,
                          }}
                        >
                          {formatSlotTimeRange(slot)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedSlot && (
              <div
                style={{
                  marginTop: 16,
                  background: C.spark + "18",
                  border: `1px solid ${C.spark}`,
                  borderRadius: 14,
                  padding: 14,
                  color: C.text,
                  lineHeight: 1.6,
                }}
              >
                <strong style={{ color: C.white }}>Selected slot:</strong>{" "}
                {formatSlotDate(selectedSlot.startTime)},{" "}
                {formatSlotTimeRange(selectedSlot)}
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              background: C.surface,
              border: `1px dashed ${C.border}`,
              borderRadius: 14,
              padding: 16,
              color: C.muted,
              lineHeight: 1.6,
            }}
          >
            No tutor selected yet. Search above or browse tutor profiles first if
            you want more detail before booking.
          </div>
        )}

        <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
          <input placeholder="Learner name" style={inputStyle} />
          <input placeholder="Preferred subject/topic" style={inputStyle} />
          <textarea
            placeholder="Anything the tutor should know?"
            style={{
              ...inputStyle,
              minHeight: 100,
              resize: "vertical",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
          <button
            disabled={!tutor || !selectedSession || !selectedSlot}
            style={{
              background: C.spark,
              color: "#000",
              border: "none",
              borderRadius: 12,
              padding: "12px 18px",
              fontWeight: 900,
              cursor:
                tutor && selectedSession && selectedSlot
                  ? "pointer"
                  : "not-allowed",
              opacity: tutor && selectedSession && selectedSlot ? 1 : 0.45,
            }}
          >
            Request booking
          </button>

          <button
            onClick={() => setPage("discover")}
            style={{
              background: C.card,
              color: C.text,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "12px 18px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Browse tutors
          </button>
        </div>
      </div>
    </section>
  );
}