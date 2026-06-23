import { tutors } from "../data/mockTutors";
import { users } from "../data/mockUsers";
import { C } from "../data/theme";

function getTutor(tutorId) {
  return tutors.find((tutor) => tutor.id === tutorId) ?? null;
}

function getUser(userId) {
  return users.find((user) => user.id === userId) ?? null;
}

function getSessionType(tutor, sessionTypeId) {
  return tutor?.sessionTypes.find((session) => session.id === sessionTypeId) ?? null;
}

function formatTime(dateTime) {
  return new Date(dateTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusColor(status) {
  if (status === "confirmed") return C.green;
  if (status === "pending") return C.spark;
  if (status === "advertised") return C.blue;
  if (status === "available") return C.green;
  if (status === "declined") return "#F87171";
  if (status === "cancelled") return "#F87171";
  if (status === "blocked") return C.muted;
  return C.muted;
}

function getEventTitle(event, sessionType) {
  if (event.kind === "availability") return event.title;
  if (event.kind === "blocked") return event.title;
  if (event.kind === "group") return event.title;
  return sessionType?.title ?? "Session";
}

export default function TimetableEventCard({
  event,
  currentUser,
  onUpdateBookingStatus,
  onRemoveAdvertisedSession,
}) {
  const tutor = getTutor(event.tutorId);
  const sessionType = getSessionType(tutor, event.sessionTypeId);
  const student = event.studentId ? getUser(event.studentId) : null;

  const isGroupSession = event.kind === "group";
  const isAvailability = event.kind === "availability";
  const isBlocked = event.kind === "blocked";
  const isBooking = event.kind === "booking";

  const canTutorManageBooking =
    currentUser.role === "tutor" &&
    isBooking &&
    event.status === "pending" &&
    typeof onUpdateBookingStatus === "function";

  const canTutorRemoveGroupClass =
    currentUser.role === "tutor" &&
    isGroupSession &&
    event.isUserCreated &&
    typeof onRemoveAdvertisedSession === "function";

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderLeft: `4px solid ${statusColor(event.status)}`,
        borderRadius: 12,
        padding: 12,
        marginTop: 10,
        opacity: isBlocked ? 0.75 : 1,
      }}
    >
      <div style={{ color: C.white, fontWeight: 900, fontSize: 14 }}>
        {formatTime(event.startTime)} – {formatTime(event.endTime)}
      </div>

      <div style={{ color: C.text, fontWeight: 800, marginTop: 6 }}>
        {getEventTitle(event, sessionType)}
      </div>

      {currentUser.role === "student" && isBooking && (
        <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
          1-on-1 with {tutor?.name}
        </div>
      )}

      {currentUser.role === "student" && isGroupSession && (
        <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
          Group class with {tutor?.name}
        </div>
      )}

      {currentUser.role === "tutor" && isBooking && (
        <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
          Student: {student?.name ?? event.learnerName ?? "Unknown student"}
        </div>
      )}

      {currentUser.role === "tutor" && isGroupSession && (
        <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
          {event.bookedStudentIds.length}/{event.capacity} learners booked
        </div>
      )}

      {isGroupSession && event.pricePerLearner !== undefined && (
        <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
          Price: R{event.pricePerLearner} per learner
        </div>
      )}

      {isAvailability && (
        <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
          Open teaching window for future bookings
        </div>
      )}

      {isBlocked && (
        <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
          {event.reason}
        </div>
      )}

      {event.topic && (
        <div style={{ color: C.muted, fontSize: 13, marginTop: 6 }}>
          Topic: {event.topic}
        </div>
      )}

      <div
        style={{
          display: "inline-flex",
          color: statusColor(event.status),
          background: statusColor(event.status) + "22",
          borderRadius: 999,
          padding: "3px 8px",
          fontSize: 11,
          fontWeight: 900,
          marginTop: 8,
          textTransform: "capitalize",
        }}
      >
        {event.status}
      </div>

      {canTutorManageBooking && (
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginTop: 12,
          }}
        >
          <button
            onClick={() => onUpdateBookingStatus(event.id, "confirmed")}
            style={{
              background: C.green,
              color: "#000",
              border: "none",
              borderRadius: 10,
              padding: "8px 10px",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Accept
          </button>

          <button
            onClick={() => onUpdateBookingStatus(event.id, "declined")}
            style={{
              background: "transparent",
              color: "#F87171",
              border: "1px solid #F87171",
              borderRadius: 10,
              padding: "8px 10px",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Decline
          </button>
        </div>
      )}

      {canTutorRemoveGroupClass && (
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginTop: 12,
          }}
        >
          <button
            onClick={() => onRemoveAdvertisedSession(event.id)}
            style={{
              background: "transparent",
              color: "#F87171",
              border: "1px solid #F87171",
              borderRadius: 10,
              padding: "8px 10px",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Remove class
          </button>
        </div>
      )}
    </div>
  );
}