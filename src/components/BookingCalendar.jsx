import { C } from "../data/theme";

const weekDays = [
  { label: "Mon", date: "2026-06-22" },
  { label: "Tue", date: "2026-06-23" },
  { label: "Wed", date: "2026-06-24" },
  { label: "Thu", date: "2026-06-25" },
  { label: "Fri", date: "2026-06-26" },
  { label: "Sat", date: "2026-06-27" },
  { label: "Sun", date: "2026-06-28" },
];

function getDateKey(dateTime) {
  return typeof dateTime === "string" ? dateTime.slice(0, 10) : "";
}

function hasValidTime(event) {
  return typeof event?.startTime === "string" && typeof event?.endTime === "string";
}

function formatTime(dateTime) {
  const date = new Date(dateTime);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTimeRange(event) {
  return `${formatTime(event.startTime)} – ${formatTime(event.endTime)}`;
}

function sortByStartTime(items) {
  return [...items].sort((a, b) =>
    String(a?.startTime ?? "").localeCompare(String(b?.startTime ?? ""))
  );
}

function getBookedStudentIds(session) {
  return Array.isArray(session?.bookedStudentIds) ? session.bookedStudentIds : [];
}

function getCapacity(session) {
  const capacity = Number(session?.capacity);
  return Number.isFinite(capacity) ? capacity : 0;
}

function getGroupSessionLabel(session) {
  const bookedStudentIds = getBookedStudentIds(session);
  const capacity = getCapacity(session);
  const remaining = Math.max(capacity - bookedStudentIds.length, 0);

  if (session.bookingState === "joined") {
    return "Already in your timetable";
  }

  if (session.bookingState === "full") {
    return "Class is full";
  }

  if (session.bookingState === "clashes") {
    return "Clashes with your timetable";
  }

  return `Group class · ${remaining}/${capacity} spaces left${
    session.pricePerLearner !== undefined ? ` · R${session.pricePerLearner}` : ""
  }`;
}

function getSlotLabel(slot) {
  if (slot.bookingState === "clashes") {
    return "Clashes with your timetable";
  }

  return "1-on-1 slot";
}

function getStudentBusyTitle(event) {
  if (event.kind === "group") {
    return event.title ?? "Your group class";
  }

  if (event.kind === "booking") {
    return event.topic || event.title || "Your existing booking";
  }

  return event.title ?? "Your timetable item";
}

function getStudentBusyLabel(event) {
  if (event.kind === "group") {
    return "Your timetable · joined group class";
  }

  if (event.kind === "booking") {
    return "Your timetable · existing booking";
  }

  return "Your timetable";
}

function buildDayItems({ daySlots, dayGroupSessions, dayStudentBusyEvents }) {
  const slotItems = daySlots.map((slot) => ({
    id: slot.id ?? `${slot.startTime}-${slot.endTime}`,
    type: "slot",
    startTime: slot.startTime,
    item: slot,
  }));

  const groupItems = dayGroupSessions.map((session) => ({
    id: session.id ?? `${session.startTime}-${session.title}`,
    type: "group",
    startTime: session.startTime,
    item: session,
  }));

  const studentBusyItems = dayStudentBusyEvents.map((event) => ({
    id: event.id ?? `${event.startTime}-${event.endTime}`,
    type: "student-busy",
    startTime: event.startTime,
    item: event,
  }));

  return sortByStartTime([...studentBusyItems, ...groupItems, ...slotItems]);
}

export default function BookingCalendar({
  selectedSession,
  oneOnOneSlots = [],
  groupSessions = [],
  studentBusyEvents = [],
  selectedSlotId,
  selectedGroupSessionId,
  onSelectOneOnOneSlot,
  onSelectGroupSession,
}) {
  const safeOneOnOneSlots = Array.isArray(oneOnOneSlots)
    ? oneOnOneSlots.filter(hasValidTime)
    : [];

  const safeGroupSessions = Array.isArray(groupSessions)
    ? groupSessions.filter(hasValidTime)
    : [];

  const safeStudentBusyEvents = Array.isArray(studentBusyEvents)
    ? studentBusyEvents.filter(hasValidTime)
    : [];

  return (
    <div style={{ marginTop: 22 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 10,
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              color: C.white,
              fontWeight: 900,
              marginBottom: 4,
            }}
          >
            Choose a time
          </label>

          <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.5 }}>
            Click a bookable group class or available 1-on-1 slot. Your existing
            timetable is shown in purple so clashes are easier to spot.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            color: C.muted,
            fontSize: 13,
            alignItems: "center",
          }}
        >
          <span style={{ color: C.violet }}>● Your timetable</span>
          <span style={{ color: C.spark }}>● 1-on-1 slot</span>
          <span style={{ color: C.blue }}>● Group class</span>
          <span style={{ color: C.muted }}>● Not bookable</span>
        </div>
      </div>

      {!selectedSession && (
        <div
          style={{
            background: C.surface,
            border: `1px dashed ${C.border}`,
            borderRadius: 14,
            padding: 14,
            color: C.muted,
            lineHeight: 1.6,
            marginBottom: 12,
          }}
        >
          Select a session type to show 1-on-1 slots. Group classes and your
          existing timetable remain visible.
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 12,
        }}
      >
        {weekDays.map((day) => {
          const daySlots = sortByStartTime(
            safeOneOnOneSlots.filter(
              (slot) => getDateKey(slot.startTime) === day.date
            )
          );

          const dayGroupSessions = sortByStartTime(
            safeGroupSessions.filter(
              (session) => getDateKey(session.startTime) === day.date
            )
          );

          const dayStudentBusyEvents = sortByStartTime(
            safeStudentBusyEvents.filter(
              (event) => getDateKey(event.startTime) === day.date
            )
          );

          const dayItems = buildDayItems({
            daySlots,
            dayGroupSessions,
            dayStudentBusyEvents,
          });

          const hasOptions = dayItems.length > 0;

          return (
            <div
              key={day.date}
              style={{
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: 12,
                minHeight: 180,
              }}
            >
              <div style={{ color: C.white, fontWeight: 950 }}>{day.label}</div>
              <div style={{ color: C.muted, fontSize: 12 }}>{day.date}</div>

              {dayItems.map((dayItem) => {
                if (dayItem.type === "student-busy") {
                  const event = dayItem.item;

                  return (
                    <div
                      key={`student-${dayItem.id}`}
                      style={{
                        width: "100%",
                        background: C.violet + "18",
                        color: C.text,
                        border: `1px solid ${C.violet}`,
                        borderLeft: `4px solid ${C.violet}`,
                        borderRadius: 12,
                        padding: 10,
                        marginTop: 10,
                        textAlign: "left",
                        fontFamily: "inherit",
                        boxSizing: "border-box",
                      }}
                    >
                      <div style={{ fontWeight: 950 }}>
                        {formatTimeRange(event)}
                      </div>

                      <div
                        style={{
                          color: C.white,
                          fontWeight: 900,
                          marginTop: 4,
                        }}
                      >
                        {getStudentBusyTitle(event)}
                      </div>

                      <div
                        style={{
                          color: C.muted,
                          fontSize: 12,
                          marginTop: 4,
                          lineHeight: 1.4,
                        }}
                      >
                        {getStudentBusyLabel(event)}
                      </div>
                    </div>
                  );
                }

                if (dayItem.type === "group") {
                  const session = dayItem.item;
                  const isBookable = session.isBookable !== false;
                  const isSelected =
                    isBookable && session.id === selectedGroupSessionId;

                  return (
                    <button
                      key={`group-${dayItem.id}`}
                      type="button"
                      onClick={() => {
                        if (isBookable) {
                          onSelectGroupSession(session.id);
                        }
                      }}
                      style={{
                        width: "100%",
                        background: isSelected ? C.blue : C.surface,
                        color: isSelected ? "#000" : C.text,
                        border: `1px solid ${isSelected ? C.blue : C.border}`,
                        borderLeft: `4px solid ${isBookable ? C.blue : C.muted}`,
                        borderRadius: 12,
                        padding: 10,
                        marginTop: 10,
                        textAlign: "left",
                        cursor: isBookable ? "pointer" : "not-allowed",
                        fontFamily: "inherit",
                        opacity: isBookable ? 1 : 0.65,
                      }}
                    >
                      <div style={{ fontWeight: 950 }}>
                        {formatTimeRange(session)}
                      </div>

                      <div style={{ fontWeight: 900, marginTop: 4 }}>
                        {session.title ?? "Group class"}
                      </div>

                      <div
                        style={{
                          color: isSelected ? "#000" : C.muted,
                          fontSize: 12,
                          marginTop: 4,
                          lineHeight: 1.4,
                        }}
                      >
                        {getGroupSessionLabel(session)}
                      </div>
                    </button>
                  );
                }

                const slot = dayItem.item;
                const isBookable = slot.isBookable !== false;
                const isSelected = isBookable && slot.id === selectedSlotId;

                return (
                  <button
                    key={`slot-${dayItem.id}`}
                    type="button"
                    onClick={() => {
                      if (isBookable) {
                        onSelectOneOnOneSlot(slot.id);
                      }
                    }}
                    style={{
                      width: "100%",
                      background: isSelected ? C.spark : C.surface,
                      color: isSelected ? "#000" : C.text,
                      border: `1px solid ${isSelected ? C.spark : C.border}`,
                      borderLeft: `4px solid ${isBookable ? C.spark : C.muted}`,
                      borderRadius: 12,
                      padding: 10,
                      marginTop: 10,
                      textAlign: "left",
                      cursor: isBookable ? "pointer" : "not-allowed",
                      fontFamily: "inherit",
                      opacity: isBookable ? 1 : 0.65,
                    }}
                  >
                    <div style={{ fontWeight: 950 }}>{formatTimeRange(slot)}</div>
                    <div
                      style={{
                        color: isSelected ? "#000" : C.muted,
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      {getSlotLabel(slot)}
                    </div>
                  </button>
                );
              })}

              {!hasOptions && (
                <div
                  style={{
                    color: C.muted,
                    fontSize: 13,
                    marginTop: 14,
                    lineHeight: 1.5,
                  }}
                >
                  No visible timetable items
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}