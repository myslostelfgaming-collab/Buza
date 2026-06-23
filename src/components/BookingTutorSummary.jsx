import Avatar from "./Avatar";
import Pill from "./Pill";
import { C } from "../data/theme";

export default function BookingTutorSummary({ tutor }) {
  const subjects = Array.isArray(tutor?.subjects) ? tutor.subjects : [];

  return (
    <>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <Avatar initials={tutor?.initials ?? "??"} color={tutor?.color ?? C.spark} />

        <div>
          <div style={{ color: C.muted, fontSize: 13, fontWeight: 700 }}>
            Booking with
          </div>
          <h2 style={{ margin: 0, color: C.white }}>
            {tutor?.name ?? "Selected tutor"}
          </h2>
          <div style={{ color: C.muted, fontSize: 13 }}>
            {tutor?.grades ?? "Grades not listed"} ·{" "}
            {tutor?.location ?? "Location not listed"}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
        {subjects.map((subject) => (
          <Pill key={subject}>{subject}</Pill>
        ))}
      </div>
    </>
  );
}