import Avatar from "../components/Avatar";
import Pill from "../components/Pill";
import { tutors } from "../data/mockTutors";
import { C } from "../data/theme";

export default function DiscoverPage({ onViewTutor }) {
  return (
    <section>
      <h1 style={{ color: C.white, marginTop: 0 }}>Discover Tutors</h1>
      <p style={{ color: C.muted }}>
        Start with a small trusted tutor list. Later this will connect to Supabase.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
          marginTop: 22,
        }}
      >
        {tutors.map((tutor) => (
          <div
            key={tutor.id}
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: 18,
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Avatar initials={tutor.initials} color={tutor.color} />
              <div>
                <div style={{ fontWeight: 900, color: C.white }}>
                  {tutor.name}
                </div>
                <div style={{ color: C.muted, fontSize: 13 }}>
                  {tutor.grades} · {tutor.location}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
              {tutor.subjects.map((subject) => (
                <Pill key={subject}>{subject}</Pill>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 16,
                color: C.text,
              }}
            >
              <span>★ {tutor.rating}</span>
              <strong style={{ color: C.spark }}>R{tutor.price}/hr</strong>
            </div>

            <button
              onClick={() => onViewTutor(tutor.id)}
              style={{
                width: "100%",
                marginTop: 14,
                background: C.spark,
                color: "#000",
                border: "none",
                borderRadius: 10,
                padding: "10px 12px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              View profile
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}