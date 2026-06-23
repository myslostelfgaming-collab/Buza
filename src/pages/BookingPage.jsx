import Avatar from "../components/Avatar";
import Pill from "../components/Pill";
import { tutors } from "../data/mockTutors";
import { C, inputStyle } from "../data/theme";

export default function BookingPage({ tutorId, setPage }) {
  const tutor = tutors.find((item) => item.id === tutorId) ?? tutors[0];

  return (
    <section>
      <button
        onClick={() => setPage("profile")}
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
        ← Back to tutor profile
      </button>

      <h1 style={{ color: C.white, marginTop: 0 }}>Book a Session</h1>

      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          padding: 22,
          maxWidth: 680,
        }}
      >
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

        <div
          style={{
            marginTop: 20,
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: 16,
          }}
        >
          <div style={{ color: C.white, fontWeight: 900, marginBottom: 6 }}>
            Session type selection coming soon
          </div>
          <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.6 }}>
            Later, this is where the learner will choose between different
            tutor-created session types, durations, formats, and prices.
          </div>
        </div>

        <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
          <input placeholder="Learner name" style={inputStyle} />
          <input placeholder="Preferred subject/topic" style={inputStyle} />
          <input placeholder="Preferred day/time" style={inputStyle} />
          <textarea
            placeholder="What do you need help with?"
            style={{
              ...inputStyle,
              minHeight: 100,
              resize: "vertical",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
          <button
            style={{
              background: C.spark,
              color: "#000",
              border: "none",
              borderRadius: 12,
              padding: "12px 18px",
              fontWeight: 900,
              cursor: "pointer",
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
            Choose another tutor
          </button>
        </div>
      </div>
    </section>
  );
}