import TimetableEventCard from "./TimetableEventCard";
import { C } from "../data/theme";

function getDateKey(dateTime) {
  return dateTime.slice(0, 10);
}

export default function WeekCalendar({
  weekDays,
  visibleEvents,
  currentUser,
  onUpdateBookingStatus,
  onRemoveAdvertisedSession,
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 12,
      }}
    >
      {weekDays.map((day) => {
        const dayEvents = visibleEvents.filter(
          (event) => getDateKey(event.startTime) === day.date
        );

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

            {dayEvents.length > 0 ? (
              dayEvents.map((event) => (
                <TimetableEventCard
                  key={event.id}
                  event={event}
                  currentUser={currentUser}
                  onUpdateBookingStatus={onUpdateBookingStatus}
                  onRemoveAdvertisedSession={onRemoveAdvertisedSession}
                />
              ))
            ) : (
              <div
                style={{
                  color: C.muted,
                  fontSize: 13,
                  marginTop: 14,
                  lineHeight: 1.5,
                }}
              >
                No sessions
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}