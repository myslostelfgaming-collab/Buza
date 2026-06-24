import { useState } from "react";
import { tutors } from "../data/mockTutors";
import { users } from "../data/mockUsers";
import { C, inputStyle } from "../data/theme";

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

function toDateTimeInputValue(dateTime) {
  if (typeof dateTime !== "string") {
    return "";
  }

  return dateTime.slice(0, 16);
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
  const width = 380;
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

  const wouldOverflowBottom = anchorRect.bottom + 420 > viewportHeight;
  const hasSpaceAbove = anchorRect.top > 420;
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

function getDateRangeError(startTime, endTime) {
  if (!startTime || !endTime) {
    return "Please enter both a start time and an end time.";
  }

  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "Please enter valid start and end times.";
  }

  if (endDate <= startDate) {
    return "The end time must be after the start time.";
  }

  return "";
}

function ActionButton({ children, onClick, variant = "default", type = "button" }) {
  const isDanger = variant === "danger";
  const isSuccess = variant === "success";
  const isMuted = variant === "muted";

  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        background: isSuccess ? C.green : isMuted ? C.surface : "transparent",
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

function FieldLabel({ children }) {
  return (
    <label
      style={{
        display: "grid",
        gap: 5,
        color: C.white,
        fontWeight: 900,
        fontSize: 12,
      }}
    >
      {children}
    </label>
  );
}

function ValidationError({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div
      style={{
        background: "rgba(248, 113, 113, 0.08)",
        border: "1px solid rgba(248, 113, 113, 0.35)",
        color: "#fecaca",
        borderRadius: 12,
        padding: 10,
        fontSize: 13,
        lineHeight: 1.45,
        fontWeight: 800,
      }}
    >
      {message}
    </div>
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
  const [editMode, setEditMode] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [deleteMode, setDeleteMode] = useState(null);
  const [formError, setFormError] = useState("");

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

  const updateEditValue = (field, value) => {
    setFormError("");
    setEditValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const startEditingGroupClass = () => {
    setDeleteMode(null);
    setFormError("");
    setEditMode("group");
    setEditValues({
      title: event.title ?? "Group class",
      startTime: toDateTimeInputValue(event.startTime),
      endTime: toDateTimeInputValue(event.endTime),
      capacity: String(event.capacity ?? 1),
      pricePerLearner:
        event.pricePerLearner === undefined ? "" : String(event.pricePerLearner),
    });
  };

  const startEditingAvailability = () => {
    setDeleteMode(null);
    setFormError("");
    setEditMode("availability");
    setEditValues({
      startTime: toDateTimeInputValue(event.startTime),
      endTime: toDateTimeInputValue(event.endTime),
    });
  };

  const startEditingBlockedTime = () => {
    setDeleteMode(null);
    setFormError("");
    setEditMode("blocked");
    setEditValues({
      startTime: toDateTimeInputValue(event.startTime),
      endTime: toDateTimeInputValue(event.endTime),
      reason: event.reason ?? event.title ?? "Unavailable",
    });
  };

  const cancelEditing = () => {
    setEditMode(null);
    setEditValues({});
    setFormError("");
  };

  const saveGroupClass = () => {
    const title = editValues.title.trim();

    if (!title) {
      setFormError("Please enter a title for the group class.");
      return;
    }

    const dateError = getDateRangeError(editValues.startTime, editValues.endTime);

    if (dateError) {
      setFormError(dateError);
      return;
    }

    const bookedCount = getBookedCount(event);
    const capacityNumber = Number(editValues.capacity);

    if (!Number.isFinite(capacityNumber) || capacityNumber < 1) {
      setFormError("Capacity must be at least 1 learner.");
      return;
    }

    if (capacityNumber < bookedCount) {
      setFormError(
        `Capacity cannot be lower than the ${bookedCount} learner${
          bookedCount === 1 ? "" : "s"
        } already booked.`
      );
      return;
    }

    const hasPrice = editValues.pricePerLearner.trim() !== "";
    const priceNumber = Number(editValues.pricePerLearner);

    if (hasPrice && (!Number.isFinite(priceNumber) || priceNumber < 0)) {
      setFormError("Price must be a valid amount of R0 or more.");
      return;
    }

    closeAfter(() =>
      onUpdateAdvertisedSession(event.id, {
        title,
        startTime: editValues.startTime,
        endTime: editValues.endTime,
        capacity: capacityNumber,
        pricePerLearner: hasPrice ? priceNumber : event.pricePerLearner,
      })
    );
  };

  const saveAvailability = () => {
    const dateError = getDateRangeError(editValues.startTime, editValues.endTime);

    if (dateError) {
      setFormError(dateError);
      return;
    }

    closeAfter(() =>
      onUpdateAvailabilityWindow(event.id, {
        startTime: editValues.startTime,
        endTime: editValues.endTime,
      })
    );
  };

  const saveBlockedTime = () => {
    const cleanedReason = editValues.reason.trim();

    if (!cleanedReason) {
      setFormError("Please enter a reason or label for the blocked time.");
      return;
    }

    const dateError = getDateRangeError(editValues.startTime, editValues.endTime);

    if (dateError) {
      setFormError(dateError);
      return;
    }

    closeAfter(() =>
      onUpdateBlockedTime(event.id, {
        startTime: editValues.startTime,
        endTime: editValues.endTime,
        title: cleanedReason,
        reason: cleanedReason,
      })
    );
  };

  const deleteGroupClass = () => {
    setEditMode(null);
    setFormError("");
    setDeleteMode("group");
  };

  const deleteAvailabilityWindow = () => {
    setEditMode(null);
    setFormError("");
    setDeleteMode("availability");
  };

  const deleteBlockedTime = () => {
    setEditMode(null);
    setFormError("");
    setDeleteMode("blocked");
  };

  const cancelDeleting = () => {
    setDeleteMode(null);
  };

  const confirmDelete = () => {
    if (deleteMode === "group") {
      closeAfter(() => onRemoveAdvertisedSession(event.id));
    }

    if (deleteMode === "availability") {
      closeAfter(() => onRemoveAvailabilityWindow(event.id));
    }

    if (deleteMode === "blocked") {
      closeAfter(() => onRemoveBlockedTime(event.id));
    }
  };

  const isEditing = editMode !== null;
  const isDeleting = deleteMode !== null;

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
          width: 380,
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
              {isEditing ? "editing" : isDeleting ? "confirm delete" : event.status}
            </div>

            <h3
              style={{
                color: C.white,
                margin: 0,
                fontSize: 17,
                lineHeight: 1.25,
              }}
            >
              {isEditing
                ? "Edit timetable item"
                : isDeleting
                ? "Delete timetable item?"
                : getEventTitle(event, sessionType)}
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

        {!isEditing && !isDeleting && (
          <>
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
                        closeAfter(() =>
                          onUpdateBookingStatus(event.id, "confirmed")
                        )
                      }
                    >
                      Accept
                    </ActionButton>

                    <ActionButton
                      variant="danger"
                      onClick={() =>
                        closeAfter(() =>
                          onUpdateBookingStatus(event.id, "declined")
                        )
                      }
                    >
                      Decline
                    </ActionButton>
                  </>
                )}

                {canTutorManageGroupClass && (
                  <>
                    <ActionButton onClick={startEditingGroupClass}>
                      Edit class
                    </ActionButton>
                    <ActionButton variant="danger" onClick={deleteGroupClass}>
                      Remove class
                    </ActionButton>
                  </>
                )}

                {canTutorManageAvailability && (
                  <>
                    <ActionButton onClick={startEditingAvailability}>
                      Edit
                    </ActionButton>
                    <ActionButton
                      variant="danger"
                      onClick={deleteAvailabilityWindow}
                    >
                      Delete
                    </ActionButton>
                  </>
                )}

                {canTutorManageBlockedTime && (
                  <>
                    <ActionButton onClick={startEditingBlockedTime}>
                      Edit
                    </ActionButton>
                    <ActionButton variant="danger" onClick={deleteBlockedTime}>
                      Delete
                    </ActionButton>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {isDeleting && (
          <div
            style={{
              display: "grid",
              gap: 12,
              marginTop: 14,
              borderTop: `1px solid ${C.border}`,
              paddingTop: 12,
            }}
          >
            <div
              style={{
                background: "rgba(248, 113, 113, 0.08)",
                border: "1px solid rgba(248, 113, 113, 0.35)",
                borderRadius: 12,
                padding: 12,
                color: C.text,
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              <div style={{ color: "#fecaca", fontWeight: 950, marginBottom: 6 }}>
                Are you sure you want to delete this?
              </div>

              <div style={{ color: C.white, fontWeight: 850 }}>
                {getEventTitle(event, sessionType)}
              </div>

              <div style={{ color: C.muted, marginTop: 4 }}>
                {formatDateTime(event.startTime)} – {formatDateTime(event.endTime)}
              </div>

              {deleteMode === "group" && getBookedCount(event) > 0 && (
                <div style={{ color: "#fecaca", marginTop: 8 }}>
                  This class already has {getBookedCount(event)} learner
                  {getBookedCount(event) === 1 ? "" : "s"} booked.
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              <ActionButton variant="muted" onClick={cancelDeleting}>
                Cancel
              </ActionButton>

              <ActionButton variant="danger" onClick={confirmDelete}>
                Yes, delete
              </ActionButton>
            </div>
          </div>
        )}

        {isEditing && (
          <form
            onSubmit={(formEvent) => {
              formEvent.preventDefault();

              if (editMode === "group") {
                saveGroupClass();
              }

              if (editMode === "availability") {
                saveAvailability();
              }

              if (editMode === "blocked") {
                saveBlockedTime();
              }
            }}
            style={{
              display: "grid",
              gap: 12,
              marginTop: 14,
              borderTop: `1px solid ${C.border}`,
              paddingTop: 12,
            }}
          >
            <ValidationError message={formError} />

            {editMode === "group" && (
              <>
                <FieldLabel>
                  Title
                  <input
                    value={editValues.title}
                    onChange={(event) =>
                      updateEditValue("title", event.target.value)
                    }
                    style={inputStyle}
                    required
                  />
                </FieldLabel>

                <FieldLabel>
                  Start time
                  <input
                    type="datetime-local"
                    value={editValues.startTime}
                    onChange={(event) =>
                      updateEditValue("startTime", event.target.value)
                    }
                    style={inputStyle}
                    required
                  />
                </FieldLabel>

                <FieldLabel>
                  End time
                  <input
                    type="datetime-local"
                    value={editValues.endTime}
                    onChange={(event) =>
                      updateEditValue("endTime", event.target.value)
                    }
                    style={inputStyle}
                    required
                  />
                </FieldLabel>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <FieldLabel>
                    Capacity
                    <input
                      type="number"
                      min={Math.max(1, getBookedCount(event))}
                      value={editValues.capacity}
                      onChange={(event) =>
                        updateEditValue("capacity", event.target.value)
                      }
                      style={inputStyle}
                      required
                    />
                  </FieldLabel>

                  <FieldLabel>
                    Price
                    <input
                      type="number"
                      min="0"
                      value={editValues.pricePerLearner}
                      onChange={(event) =>
                        updateEditValue("pricePerLearner", event.target.value)
                      }
                      style={inputStyle}
                    />
                  </FieldLabel>
                </div>
              </>
            )}

            {editMode === "availability" && (
              <>
                <FieldLabel>
                  Start time
                  <input
                    type="datetime-local"
                    value={editValues.startTime}
                    onChange={(event) =>
                      updateEditValue("startTime", event.target.value)
                    }
                    style={inputStyle}
                    required
                  />
                </FieldLabel>

                <FieldLabel>
                  End time
                  <input
                    type="datetime-local"
                    value={editValues.endTime}
                    onChange={(event) =>
                      updateEditValue("endTime", event.target.value)
                    }
                    style={inputStyle}
                    required
                  />
                </FieldLabel>
              </>
            )}

            {editMode === "blocked" && (
              <>
                <FieldLabel>
                  Reason
                  <input
                    value={editValues.reason}
                    onChange={(event) =>
                      updateEditValue("reason", event.target.value)
                    }
                    style={inputStyle}
                    required
                  />
                </FieldLabel>

                <FieldLabel>
                  Start time
                  <input
                    type="datetime-local"
                    value={editValues.startTime}
                    onChange={(event) =>
                      updateEditValue("startTime", event.target.value)
                    }
                    style={inputStyle}
                    required
                  />
                </FieldLabel>

                <FieldLabel>
                  End time
                  <input
                    type="datetime-local"
                    value={editValues.endTime}
                    onChange={(event) =>
                      updateEditValue("endTime", event.target.value)
                    }
                    style={inputStyle}
                    required
                  />
                </FieldLabel>
              </>
            )}

            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              <ActionButton variant="muted" onClick={cancelEditing}>
                Cancel
              </ActionButton>
              <ActionButton type="submit" variant="success">
                Save changes
              </ActionButton>
            </div>
          </form>
        )}
      </div>
    </>
  );
}