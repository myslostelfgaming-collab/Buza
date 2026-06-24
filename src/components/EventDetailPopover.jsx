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

function formatDateTime(dateTime) {
  return new Date(dateTime).toLocaleString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
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

function getBookedCount(event) {
  return Array.isArray(event.bookedStudentIds) ? event.bookedStudentIds.length : 0;
}

function getPopoverPosition(anchorRect) {
  const width = 360;
  const margin = 12;

  if (!anchorRect) {
    return {
      left: margin,
      top: 90,
      opensAbove: false,
    };
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const wouldOverflowBottom = anchorRect.bottom + 360 > viewportHeight;
  const hasSpaceAbove = anchorRect.top > 360;
  const opensAbove = wouldOverflowBottom && hasSpaceAbove;

  const left = Math.min(
    Math.max(anchorRect.left, margin),
    viewportWidth - width - margin
  );

  const top = opensAbove ? anchorRect.top - 12 : anchorRect.bottom + 12;

  return {
    left,
    top,
    opensAbove,
  };
}

function ActionButton({ children, onClick, variant = "default" }) {
  const isDanger = variant === "danger";
  const isSuccess = variant === "success";

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: isSuccess ? C.green : "transparent",
        color: isSuccess ? "#000" : isDanger ? "#F87171" : C.text,
        border: isSuccess
          ? "none"
          : isDanger
          ? "1px solid #F87171"
          : `1px solid ${C.border}`,
        borderRadius: 10,
        padding: "8px 11px",
        fontWeight: 900,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

export default function EventDetailPopover({
  event,
  anchorRect,
  currentUser,
  onClose,
  onUpdateBookingStatus,
  onUpdateAdvertisedSession,
  onRemoveAdvertisedSession,
  onUpdateAvailabilityWindow,
  onRemoveAvailabilityWindow,
  onUpdateBlockedTime,
  onRemoveBlockedTime,
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

  const canTutorManageGroupClass =
    currentUser.role === "tutor" &&
    isGroupSession &&
    event.isUserCreated &&
    typeof onUpdateAdvertisedSession === "function" &&
    typeof onRemoveAdvertisedSession === "function";

  const canTutorManageAvailability =
    currentUser.role === "tutor" &&
    isAvailability &&
    event.isUserCreated &&
    typeof onUpdateAvailabilityWindow === "function" &&
    typeof onRemoveAvailabilityWindow === "function";

  const canTutorManageBlockedTime =
    currentUser.role === "tutor" &&
    isBlocked &&
    event.isUserCreated &&
    typeof onUpdateBlockedTime === "function" &&
    typeof onRemoveBlockedTime === "function";

  const hasActions =
    canTutorManageBooking ||
    canTutorManageGroupClass ||
    canTutorManageAvailability ||
    canTutorManageBlockedTime;

  const position = getPopoverPosition(anchorRect);

  const closeAfter = (action) => {
    action();
    onClose();
  };

  const editGroupClass = () => {
    const title = window.prompt("Edit group class title:", event.title);

    if (title === null) {
      return;
    }

    const startTime = window.prompt("Edit group class start time:", event.startTime);

    if (startTime === null) {
      return;
    }

    const endTime = window.prompt("Edit group class end time:", event.endTime);

    if (endTime === null) {
      return;
    }

    const capacity = window.prompt("Edit learner capacity:", event.capacity);

    if (capacity === null) {
      return;
    }

    const pricePerLearner = window.prompt(
      "Edit price per learner:",
      event.pricePerLearner ?? ""
    );

    if (pricePerLearner === null) {
      return;
    }

    closeAfter(() =>
      onUpdateAdvertisedSession(event.id, {
        title: title.trim() || "Group class",
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        capacity: Number(capacity) || event.capacity,
        pricePerLearner:
          pricePerLearner.trim() === ""
            ? event.pricePerLearner
            : Number(pricePerLearner),
      })
    );
  };

  const deleteGroupClass = () => {
    const confirmed = window.confirm(
      `Remove this group class?\n\n${event.title}\n${formatDateTime(
        event.startTime
      )} – ${formatDateTime(event.endTime)}`
    );

    if (!confirmed) {
      return;
    }

    closeAfter(() => onRemoveAdvertisedSession(event.id));
  };

  const editAvailabilityWindow = () => {
    const startTime = window.prompt("Edit availability start time:", event.startTime);

    if (startTime === null) {
      return;
    }

    const endTime = window.prompt("Edit availability end time:", event.endTime);

    if (endTime === null) {
      return;
    }

    closeAfter(() =>
      onUpdateAvailabilityWindow(event.id, {
        startTime: startTime.trim(),
        endTime: endTime.trim(),
      })
    );
  };

  const deleteAvailabilityWindow = () => {
    const confirmed = window.confirm(
      `Delete this availability window?\n\n${formatDateTime(
        event.startTime
      )} – ${formatDateTime(event.endTime)}`
    );

    if (!confirmed) {
      return;
    }

    closeAfter(() => onRemoveAvailabilityWindow(event.id));
  };

  const editBlockedTime = () => {
    const startTime = window.prompt("Edit blocked time start:", event.startTime);

    if (startTime === null) {
      return;
    }

    const endTime = window.prompt("Edit blocked time end:", event.endTime);

    if (endTime === null) {
      return;
    }

    const reason = window.prompt(
      "Edit blocked time reason:",
      event.reason ?? event.title ?? "Unavailable"
    );

    if (reason === null) {
      return;
    }

    const cleanedReason = reason.trim() || "Unavailable";

    closeAfter(() =>
      onUpdateBlockedTime(event.id, {
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        title: cleanedReason,
        reason: cleanedReason,
      })
    );
  };

  const deleteBlockedTime = () => {
    const confirmed = window.confirm(
      `Delete this blocked time?\n\n${formatDateTime(
        event.startTime
      )} – ${formatDateTime(event.endTime)}`
    );

    if (!confirmed) {
      return;
    }

    closeAfter(() => onRemoveBlockedTime(event.id));
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "transparent",
        }}
      />

      <div
        style={{
          position: "fixed",
          left: position.left,
          top: position.top,
          transform: position.opensAbove ? "translateY(-100%)" : "none",
          zIndex: 9999,
          width: 360,
          maxWidth: "calc(100vw - 24px)",
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 22,
            top: position.opensAbove ? "auto" : -6,
            bottom: position.opensAbove ? -6 : "auto",
            width: 12,
            height: 12,
            background: C.card,
            borderLeft: position.opensAbove ? "none" : `1px solid ${C.border}`,
            borderTop: position.opensAbove ? "none" : `1px solid ${C.border}`,
            borderRight: position.opensAbove ? `1px solid ${C.border}` : "none",
            borderBottom: position.opensAbove ? `1px solid ${C.border}` : "none",
            transform: "rotate(45deg)",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            alignItems: "start",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                color: statusColor(event.status),
                background: statusColor(event.status) + "22",
                borderRadius: 999,
                padding: "3px 8px",
                fontSize: 11,
                fontWeight: 900,
                textTransform: "capitalize",
                marginBottom: 8,
              }}
            >
              {event.status}
            </div>

            <h3
              style={{
                color: C.white,
                margin: 0,
                fontSize: 17,
                lineHeight: 1.25,
              }}
            >
              {getEventTitle(event, sessionType)}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: C.surface,
              color: C.text,
              border: `1px solid ${C.border}`,
              borderRadius: 9,
              padding: "6px 8px",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gap: 8,
            color: C.text,
            lineHeight: 1.45,
            fontSize: 13,
          }}
        >
          <div>
            <strong style={{ color: C.white }}>Time:</strong>{" "}
            {formatDateTime(event.startTime)} – {formatDateTime(event.endTime)}
          </div>

          {tutor && (
            <div>
              <strong style={{ color: C.white }}>Tutor:</strong> {tutor.name}
            </div>
          )}

          {sessionType && (
            <div>
              <strong style={{ color: C.white }}>Session:</strong>{" "}
              {sessionType.title} · {sessionType.durationMinutes} min · R
              {sessionType.price}
            </div>
          )}

          {currentUser.role === "tutor" && isBooking && (
            <div>
              <strong style={{ color: C.white }}>Student:</strong>{" "}
              {student?.name ?? event.learnerName ?? "Unknown student"}
            </div>
          )}

          {currentUser.role === "student" && isBooking && tutor && (
            <div>
              <strong style={{ color: C.white }}>Booking:</strong> 1-on-1 with{" "}
              {tutor.name}
            </div>
          )}

          {isGroupSession && (
            <div>
              <strong style={{ color: C.white }}>Group:</strong>{" "}
              {getBookedCount(event)}/{event.capacity} learners booked
              {event.pricePerLearner !== undefined
                ? ` · R${event.pricePerLearner} per learner`
                : ""}
            </div>
          )}

          {isAvailability && (
            <div>
              <strong style={{ color: C.white }}>Availability:</strong> Open
              teaching window.
            </div>
          )}

          {isBlocked && (
            <div>
              <strong style={{ color: C.white }}>Blocked:</strong>{" "}
              {event.reason ?? "Unavailable"}
            </div>
          )}

          {event.topic && (
            <div>
              <strong style={{ color: C.white }}>Topic:</strong> {event.topic}
            </div>
          )}

          {event.notes && (
            <div>
              <strong style={{ color: C.white }}>Notes:</strong> {event.notes}
            </div>
          )}
        </div>

        {hasActions && (
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginTop: 16,
              borderTop: `1px solid ${C.border}`,
              paddingTop: 12,
            }}
          >
            {canTutorManageBooking && (
              <>
                <ActionButton
                  variant="success"
                  onClick={() =>
                    closeAfter(() => onUpdateBookingStatus(event.id, "confirmed"))
                  }
                >
                  Accept
                </ActionButton>

                <ActionButton
                  variant="danger"
                  onClick={() =>
                    closeAfter(() => onUpdateBookingStatus(event.id, "declined"))
                  }
                >
                  Decline
                </ActionButton>
              </>
            )}

            {canTutorManageGroupClass && (
              <>
                <ActionButton onClick={editGroupClass}>Edit class</ActionButton>
                <ActionButton variant="danger" onClick={deleteGroupClass}>
                  Remove class
                </ActionButton>
              </>
            )}

            {canTutorManageAvailability && (
              <>
                <ActionButton onClick={editAvailabilityWindow}>Edit</ActionButton>
                <ActionButton variant="danger" onClick={deleteAvailabilityWindow}>
                  Delete
                </ActionButton>
              </>
            )}

            {canTutorManageBlockedTime && (
              <>
                <ActionButton onClick={editBlockedTime}>Edit</ActionButton>
                <ActionButton variant="danger" onClick={deleteBlockedTime}>
                  Delete
                </ActionButton>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}