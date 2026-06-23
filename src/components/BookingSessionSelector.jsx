import { C, inputStyle } from "../data/theme";

export default function BookingSessionSelector({
  tutor,
  selectedSessionId,
  selectedSession,
  onSelectSession,
}) {
  const sessionTypes = Array.isArray(tutor?.sessionTypes)
    ? tutor.sessionTypes
    : [];

  return (
    <div style={{ marginTop: 22 }}>
      <label
        style={{
          display: "block",
          color: C.white,
          fontWeight: 900,
          marginBottom: 8,
        }}
      >
        Choose a session type
      </label>

      <select
        value={selectedSessionId}
        onChange={(event) => onSelectSession(event.target.value)}
        style={{
          ...inputStyle,
          width: "100%",
          cursor: "pointer",
        }}
      >
        <option value="">Select a session type...</option>
        {sessionTypes.map((session) => (
          <option key={session.id} value={session.id}>
            {session.title} — {session.durationMinutes} min — R{session.price}
          </option>
        ))}
      </select>

      {sessionTypes.length === 0 && (
        <div
          style={{
            marginTop: 12,
            background: C.surface,
            border: `1px dashed ${C.border}`,
            borderRadius: 14,
            padding: 14,
            color: C.muted,
            lineHeight: 1.6,
          }}
        >
          This tutor does not have session types set up yet.
        </div>
      )}

      {selectedSession && (
        <div
          style={{
            marginTop: 20,
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
                {selectedSession.title}
              </div>
              <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
                {selectedSession.durationMinutes} min · {selectedSession.format}
              </div>
            </div>

            <div style={{ color: C.spark, fontWeight: 950 }}>
              R{selectedSession.price}
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
            {selectedSession.description}
          </div>
        </div>
      )}
    </div>
  );
}