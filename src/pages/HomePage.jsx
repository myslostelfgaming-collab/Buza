import { C } from "../data/theme";

export default function HomePage({ setPage }) {
  return (
    <section>
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 56,
            fontWeight: 950,
            letterSpacing: 2,
            color: C.white,
          }}
        >
          BUZA
        </div>
        <div
          style={{
            color: C.spark,
            fontSize: 24,
            fontWeight: 900,
            marginTop: 4,
          }}
        >
          Uzothola.
        </div>
        <div style={{ color: C.muted, fontSize: 18, marginTop: 8 }}>
          Helping you find your way.
        </div>
      </div>

      <div
        style={{
          background: `linear-gradient(160deg, ${C.card}, ${C.surface})`,
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          padding: 24,
          maxWidth: 720,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28, color: C.white }}>
          South African tutoring, matched.
        </h1>

        <p style={{ color: C.muted, lineHeight: 1.7, marginTop: 12 }}>
          BUZA helps learners and parents find trusted tutors for school
          subjects, exam preparation, and focused one-on-one support.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 22 }}>
          <button
            onClick={() => setPage("discover")}
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
            Find a tutor
          </button>

          <button
            onClick={() => setPage("booking")}
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
            Book a session
          </button>
        </div>
      </div>
    </section>
  );
}