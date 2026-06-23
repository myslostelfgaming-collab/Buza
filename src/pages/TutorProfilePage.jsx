import Avatar from "../components/Avatar";
import Pill from "../components/Pill";
import { tutors } from "../data/mockTutors";
import { C } from "../data/theme";

export default function TutorProfilePage({ setPage }) {
  const tutor = tutors[0];

  return (
    <section>
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