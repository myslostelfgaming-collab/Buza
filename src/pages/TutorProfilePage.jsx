import Avatar from "../components/Avatar";
import Pill from "../components/Pill";
import { tutors } from "../data/mockTutors";
import { C } from "../data/theme";

export default function TutorProfilePage({ tutorId, setPage, onBookTutor }) {
  const tutor = tutors.find((item) => item.id === tutorId);

  if (!tutor) {
    return (
      <section>
        <h1 style={{ color: C.white, marginTop: 0 }}>Tutor Profile</h1>
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 18,
            padding: 22,
            maxWidth: 620,
          }}
        >
          <p style={{ color: C.muted }}>
            No tutor selected yet. Please choose a tutor first.
          </p>

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
            Browse tutors
          </button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <button
        onClick={() => setPage("discover")}
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
        ← Back to tutors
      </button>

      <h1 style={{ color: C.white, marginTop: 0 }}>Tutor Profile</h1>

      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          padding: 22,
          maxWidth: 760,
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Avatar initials={tutor.initials} color={tutor.color} />
          <div>
            <h2 style={{ margin: 0, color: C.white }}>{tutor.name}</h2>
            <div style={{ color: C.muted }}>
              {tutor.grades} · {tutor.location}
            </div>
          </div>
        </div>

        <p style={{ color: C.text, lineHeight: 1.7, marginTop: 18 }}>
          Experienced tutor focused on clear explanations, exam preparation,
          and helping learners build confidence step by step.
        </p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {tutor.subjects.map((subject) => (
            <Pill key={subject}>{subject}</Pill>
          ))}
          <Pill color={C.green}>Verified</Pill>
          <Pill color={C.blue}>Online</Pill>
        </div>

        <div style={{ marginTop: 26 }}>
          <h3 style={{ color: C.white, marginBottom: 12 }}>Session types</h3>

          <div style={{ display: "grid", gap: 12 }}>
            {tutor.sessionTypes.map((session) => (
              <div
                key={session.id}
                style={{
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
                      {session.title}
                    </div>
                    <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
                      {session.durationMinutes} min · {session.format}
                    </div>
                  </div>

                  <div
                    style={{
                      color: C.spark,
                      fontWeight: 950,
                      fontSize: 18,
                    }}
                  >
                    R{session.price}
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
                  {session.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => onBookTutor(tutor.id)}
          style={{
            marginTop: 22,
            background: C.spark,
            color: "#000",
            border: "none",
            borderRadius: 12,
            padding: "12px 18px",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          Book this tutor
        </button>
      </div>
    </section>
  );
}