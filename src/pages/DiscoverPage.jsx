import { useState } from "react";
import Avatar from "../components/Avatar";
import Pill from "../components/Pill";
import { tutors } from "../data/mockTutors";
import { tutorMatchesQuery } from "../data/tutorSearch";
import { C, inputStyle } from "../data/theme";

export default function DiscoverPage({ onViewTutor }) {
  const [query, setQuery] = useState("");

  const filteredTutors = tutors.filter((tutor) =>
    tutorMatchesQuery(tutor, query)
  );

  return (
    <section>
      <h1 style={{ color: C.white, marginTop: 0 }}>Discover Tutors</h1>
      <p style={{ color: C.muted }}>
        Search by tutor name, subject, grade, or location.
      </p>

      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 16,
          marginTop: 20,
          marginBottom: 18,
        }}
      >
        <label
          style={{
            display: "block",
            color: C.white,
            fontWeight: 900,
            marginBottom: 8,
          }}
        >
          Find the right tutor
        </label>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try Mathematics, Grade 12, Pretoria, Priya..."
          style={{
            ...inputStyle,
            width: "100%",
          }}
        />

        <div style={{ color: C.muted, fontSize: 13, marginTop: 10 }}>
          Showing {filteredTutors.length} of {tutors.length} tutors
        </div>
      </div>

      {filteredTutors.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginTop: 22,
          }}
        >
          {filteredTutors.map((tutor) => (
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

              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  marginTop: 14,
                }}
              >
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
                <strong style={{ color: C.spark }}>
                  Sessions from R{Math.min(...tutor.sessionTypes.map((session) => session.price))}
                </strong>
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
      ) : (
        <div
          style={{
            background: C.card,
            border: `1px dashed ${C.border}`,
            borderRadius: 16,
            padding: 22,
            color: C.muted,
            lineHeight: 1.6,
          }}
        >
          No tutors found. Try searching by a broader subject, grade, name, or
          location.
        </div>
      )}
    </section>
  );
}