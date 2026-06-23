import { C } from "../data/theme";

export default function SessionsPage() {
  return (
    <section>
      <h1 style={{ color: C.white, marginTop: 0 }}>Sessions</h1>

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
          Upcoming and completed sessions will appear here.
        </p>

        <div
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 12,
            background: C.surface,
            border: `1px solid ${C.border}`,
          }}
        >
          <strong style={{ color: C.white }}>Mathematics revision</strong>
          <div style={{ color: C.muted, fontSize: 13 }}>
            Dr. Amara Osei · Wednesday · 17:00
          </div>
        </div>
      </div>
    </section>
  );
}