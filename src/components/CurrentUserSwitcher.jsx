import { users } from "../data/mockUsers";
import { C } from "../data/theme";

export default function CurrentUserSwitcher({ currentUserId, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap",
        justifyContent: "flex-end",
      }}
    >
      <label
        style={{
          color: C.muted,
          fontSize: 12,
          fontWeight: 900,
        }}
      >
        Signed in as
      </label>

      <select
        value={currentUserId}
        onChange={(event) => onChange(event.target.value)}
        style={{
          background: C.surface,
          color: C.text,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: "8px 10px",
          fontSize: 13,
          fontFamily: "inherit",
          cursor: "pointer",
        }}
      >
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name} — {user.role}
          </option>
        ))}
      </select>
    </div>
  );
}