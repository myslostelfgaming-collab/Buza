import Avatar from "../components/Avatar";
import Pill from "../components/Pill";
import { tutors } from "../data/mockTutors";
import { C } from "../data/theme";

export default function TutorProfilePage({ tutorId, setPage }) {
  const tutor = tutors.find((item) => item.id === tutorId) ?? tutors[0];

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
          maxWidth: 720,
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

        <div
          style={{
            marginTop: 22,
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: 16,
          }}
        >
          <div style={{ color: C.white, fontWeight: 900, marginBottom: 6 }}>
            Session options coming soon
          </div>
          <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.6 }}>
            Tutors will be able to create different session types, durations,
            formats, and prices. For now, this profile is using mock tutor data.
          </div>
        </div>

        <button
          onClick={() => setPage("booking")}
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