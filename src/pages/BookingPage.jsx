import { C, inputStyle } from "../data/theme";

export default function BookingPage() {
  return (
    <section>
      <h1 style={{ color: C.white, marginTop: 0 }}>Book a Session</h1>

      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          padding: 22,
          maxWidth: 620,
        }}
      >
        <p style={{ color: C.muted, lineHeight: 1.7 }}>
          This will become the booking flow. For now, it proves the screen exists.
        </p>

        <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
          <input placeholder="Learner name" style={inputStyle} />
          <input placeholder="Subject" style={inputStyle} />
          <input placeholder="Preferred day/time" style={inputStyle} />
          <textarea placeholder="What do you need help with?" style={inputStyle} />
        </div>

        <button
          style={{
            marginTop: 16,
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
      </div>
    </section>
  );
}