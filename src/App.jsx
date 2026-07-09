import { useEffect, useState } from "react";
import CurrentUserSwitcher from "./components/CurrentUserSwitcher";
import NavButton from "./components/NavButton";
import HomePage from "./pages/HomePage";
import DiscoverPage from "./pages/DiscoverPage";
import TutorProfilePage from "./pages/TutorProfilePage";
import BookingPage from "./pages/BookingPage";
import SessionsPage from "./pages/SessionsPage";
import LiveSessionPage from "./pages/LiveSessionPage";
import { bookings } from "./data/mockBookings";
import { tutors } from "./data/mockTutors";
import { C } from "./data/theme";
import { defaultCurrentUserId, users } from "./data/mockUsers";

const BUZA_STORAGE_KEY = "buza-demo-state-v1";

const initialDemoState = {
  extraBookings: [],
  extraAvailabilityWindows: [],
  extraBlockedTimes: [],
  extraAdvertisedSessions: [],
  advertisedSessionBookingOverrides: {},
  bookingStatusOverrides: {},
  notifications: [],
  liveSessionStatusOverrides: {},
  sessionFeedback: {},
};

function loadDemoState() {
  try {
    const savedState = localStorage.getItem(BUZA_STORAGE_KEY);

    if (!savedState) {
      return initialDemoState;
    }

    return {
      ...initialDemoState,
      ...JSON.parse(savedState),
    };
  } catch (error) {
    console.warn("Could not load BUZA demo state:", error);
    return initialDemoState;
  }
}

function saveDemoState(demoState) {
  try {
    localStorage.setItem(BUZA_STORAGE_KEY, JSON.stringify(demoState));
  } catch (error) {
    console.warn("Could not save BUZA demo state:", error);
  }
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
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

function formatNotificationTime(dateTime) {
  const date = new Date(dateTime);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString([], {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTutor(tutorId) {
  return tutors.find((tutor) => tutor.id === tutorId) ?? null;
}

function getTutorUser(tutorId) {
  return (
    users.find((user) => user.role === "tutor" && user.tutorId === tutorId) ??
    null
  );
}

function getStudentUser(studentId) {
  return users.find((user) => user.id === studentId) ?? null;
}

function createNotification({
  userId,
  type,
  title,
  message,
  bookingId = null,
  relatedId = null,
}) {
  return {
    id: makeId("notification"),
    userId,
    type,
    title,
    message,
    bookingId,
    relatedId,
    createdAt: new Date().toISOString(),
    read: false,
  };
}

function DemoResetButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Clear all locally saved demo-created data"
      style={{
        border: "1px solid rgba(248, 113, 113, 0.45)",
        background: "rgba(248, 113, 113, 0.08)",
        color: "#fecaca",
        borderRadius: 999,
        padding: "7px 11px",
        fontWeight: 850,
        fontSize: 12,
        cursor: "pointer",
      }}
    >
      Reset demo data
    </button>
  );
}

function SmallActionButton({
  children,
  onClick,
  variant = "default",
  disabled = false,
}) {
  const isSuccess = variant === "success";
  const isDanger = variant === "danger";
  const isMuted = variant === "muted";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: isSuccess
          ? C.green
          : isDanger
          ? "transparent"
          : isMuted
          ? C.surface
          : C.spark,
        color:
          isSuccess || variant === "default"
            ? "#000"
            : isDanger
            ? "#F87171"
            : C.text,
        border:
          isSuccess || variant === "default"
            ? "none"
            : isDanger
            ? "1px solid #F87171"
            : `1px solid ${C.border}`,
        borderRadius: 999,
        padding: "7px 10px",
        fontSize: 12,
        fontWeight: 950,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

function BookingStatusBadge({ status }) {
  if (!status) {
    return null;
  }

  const color =
    status === "confirmed"
      ? C.green
      : status === "declined"
      ? "#F87171"
      : status === "pending"
      ? C.spark
      : status === "cancelled"
      ? C.muted
      : C.muted;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        padding: "3px 8px",
        background: color + "22",
        color,
        fontSize: 11,
        fontWeight: 950,
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  );
}

function NotificationBell({
  notifications,
  unreadCount,
  isOpen,
  onToggle,
  onMarkRead,
  onMarkAllRead,
  onViewTimetable,
  onOpenSession,
  onAcceptBooking,
  onDeclineBooking,
  getBookingStatus,
}) {
  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={onToggle}
        title="Notifications"
        style={{
          position: "relative",
          background: isOpen ? C.spark : C.card,
          color: isOpen ? "#000" : C.text,
          border: `1px solid ${isOpen ? C.spark : C.border}`,
          borderRadius: 999,
          padding: "8px 12px",
          fontWeight: 900,
          cursor: "pointer",
        }}
      >
        🔔 Notifications
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -7,
              right: -7,
              minWidth: 20,
              height: 20,
              borderRadius: 999,
              background: "#F87171",
              color: "#000",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 950,
              border: `2px solid ${C.bg}`,
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 10px)",
            width: 380,
            maxWidth: "calc(100vw - 36px)",
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: 14,
            boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
            zIndex: 10000,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <div>
              <div style={{ color: C.white, fontWeight: 950 }}>
                Notifications
              </div>
              <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>
                {unreadCount} unread
              </div>
            </div>

            <button
              type="button"
              onClick={onMarkAllRead}
              disabled={unreadCount === 0}
              style={{
                background: "transparent",
                color: unreadCount === 0 ? C.muted : C.spark,
                border: `1px solid ${unreadCount === 0 ? C.border : C.spark}`,
                borderRadius: 999,
                padding: "6px 9px",
                fontSize: 12,
                fontWeight: 900,
                cursor: unreadCount === 0 ? "not-allowed" : "pointer",
                opacity: unreadCount === 0 ? 0.5 : 1,
              }}
            >
              Mark all read
            </button>
          </div>

          {notifications.length === 0 ? (
            <div
              style={{
                background: C.surface,
                border: `1px dashed ${C.border}`,
                borderRadius: 12,
                padding: 14,
                color: C.muted,
                lineHeight: 1.5,
                fontSize: 13,
              }}
            >
              No notifications yet. Booking requests, tutor responses, and
              session updates will appear here.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: 10,
                maxHeight: 440,
                overflowY: "auto",
              }}
            >
              {notifications.map((notification) => {
                const bookingStatus = notification.bookingId
                  ? getBookingStatus(notification.bookingId)
                  : null;

                const canRespondToBooking =
                  notification.type === "booking-requested" &&
                  notification.bookingId &&
                  bookingStatus === "pending";

                const hasBookingLink = Boolean(notification.bookingId);

                const hasSessionLink =
                  Boolean(notification.bookingId) &&
                  [
                    "session-started",
                    "session-ended",
                    "session-feedback-submitted",
                  ].includes(notification.type);

                return (
                  <div
                    key={notification.id}
                    style={{
                      background: notification.read
                        ? C.surface
                        : "rgba(250, 204, 21, 0.09)",
                      border: `1px solid ${
                        notification.read
                          ? C.border
                          : "rgba(250, 204, 21, 0.45)"
                      }`,
                      borderRadius: 12,
                      padding: 12,
                    }}
                  >
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
                            color: C.white,
                            fontWeight: 950,
                            lineHeight: 1.25,
                          }}
                        >
                          {notification.title}
                        </div>

                        <div
                          style={{
                            color: C.muted,
                            fontSize: 11,
                            fontWeight: 800,
                            marginTop: 3,
                          }}
                        >
                          {formatNotificationTime(notification.createdAt)}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          alignItems: "center",
                          flexWrap: "wrap",
                          justifyContent: "flex-end",
                        }}
                      >
                        <BookingStatusBadge status={bookingStatus} />

                        {!notification.read && (
                          <span
                            style={{
                              background: C.spark,
                              color: "#000",
                              borderRadius: 999,
                              padding: "2px 7px",
                              fontSize: 10,
                              fontWeight: 950,
                            }}
                          >
                            New
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        color: C.text,
                        fontSize: 13,
                        lineHeight: 1.5,
                        marginTop: 8,
                      }}
                    >
                      {notification.message}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 7,
                        flexWrap: "wrap",
                        marginTop: 11,
                      }}
                    >
                      {canRespondToBooking && (
                        <>
                          <SmallActionButton
                            variant="success"
                            onClick={() => onAcceptBooking(notification)}
                          >
                            Accept
                          </SmallActionButton>

                          <SmallActionButton
                            variant="danger"
                            onClick={() => onDeclineBooking(notification)}
                          >
                            Decline
                          </SmallActionButton>
                        </>
                      )}

                      {hasSessionLink && (
                        <SmallActionButton
                          variant="success"
                          onClick={() => onOpenSession(notification)}
                        >
                          Open session
                        </SmallActionButton>
                      )}

                      {hasBookingLink && (
                        <SmallActionButton
                          variant="default"
                          onClick={() => onViewTimetable(notification)}
                        >
                          View timetable
                        </SmallActionButton>
                      )}

                      {!notification.read && (
                        <SmallActionButton
                          variant="muted"
                          onClick={() => onMarkRead(notification.id)}
                        >
                          Mark read
                        </SmallActionButton>
                      )}
                    </div>

                    {notification.type === "booking-requested" &&
                      bookingStatus &&
                      bookingStatus !== "pending" && (
                        <div
                          style={{
                            color: C.muted,
                            fontSize: 12,
                            lineHeight: 1.4,
                            marginTop: 8,
                          }}
                        >
                          This request has already been {bookingStatus}.
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function App() {
  const [page, setPage] = useState("home");
  const [selectedTutorId, setSelectedTutorId] = useState(null);
  const [demoState, setDemoState] = useState(loadDemoState);
  const [currentUserId, setCurrentUserId] = useState(defaultCurrentUserId);
  const [showNotifications, setShowNotifications] = useState(false);
  const [timetableFocus, setTimetableFocus] = useState(null);
  const [activeLiveBookingId, setActiveLiveBookingId] = useState(null);

  const {
    extraBookings,
    extraAvailabilityWindows,
    extraBlockedTimes,
    extraAdvertisedSessions,
    advertisedSessionBookingOverrides,
    bookingStatusOverrides,
    notifications,
    liveSessionStatusOverrides,
    sessionFeedback,
  } = demoState;

  useEffect(() => {
    saveDemoState(demoState);
  }, [demoState]);

  useEffect(() => {
    setShowNotifications(false);
  }, [currentUserId]);

  const currentUser =
    users.find((user) => user.id === currentUserId) ?? users[0];

  const currentUserNotifications = notifications
    .filter((notification) => notification.userId === currentUser.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const unreadNotificationCount = currentUserNotifications.filter(
    (notification) => !notification.read
  ).length;

  const getBookingById = (bookingId) =>
    extraBookings.find((booking) => booking.id === bookingId) ??
    bookings.find((booking) => booking.id === bookingId) ??
    null;

  const getBookingStatus = (bookingId) => {
    const booking = getBookingById(bookingId);

    return bookingStatusOverrides[bookingId] ?? booking?.status ?? null;
  };

  const getBookingWithCurrentStatus = (bookingId) => {
    const booking = getBookingById(bookingId);

    if (!booking) {
      return null;
    }

    return {
      ...booking,
      status: getBookingStatus(bookingId),
    };
  };

  const getLiveSessionStatus = (bookingId) => {
    const bookingStatus = getBookingStatus(bookingId);

    if (bookingStatus !== "confirmed") {
      return "upcoming";
    }

    return liveSessionStatusOverrides[bookingId] ?? "upcoming";
  };

  const viewTutor = (tutorId) => {
    setSelectedTutorId(tutorId);
    setTimetableFocus(null);
    setActiveLiveBookingId(null);
    setPage("profile");
  };

  const startBooking = (tutorId = null) => {
    setSelectedTutorId(tutorId);
    setTimetableFocus(null);
    setActiveLiveBookingId(null);
    setPage("booking");
  };

  const openLiveSession = (bookingId) => {
    if (!bookingId) {
      return;
    }

    setActiveLiveBookingId(bookingId);
    setTimetableFocus(null);
    setShowNotifications(false);
    setPage("live-session");
  };

  const backToTimetable = () => {
    setActiveLiveBookingId(null);
    setPage("sessions");
  };

  const resetDemoData = () => {
    const confirmed = window.confirm(
      "Reset all demo-created bookings, availability, blocked times, group classes, notifications, live sessions, and feedback?"
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(BUZA_STORAGE_KEY);
    setDemoState(initialDemoState);
    setShowNotifications(false);
    setTimetableFocus(null);
    setActiveLiveBookingId(null);
  };

  const markNotificationRead = (notificationId) => {
    setDemoState((currentState) => ({
      ...currentState,
      notifications: currentState.notifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      ),
    }));
  };

  const markAllCurrentUserNotificationsRead = () => {
    setDemoState((currentState) => ({
      ...currentState,
      notifications: currentState.notifications.map((notification) =>
        notification.userId === currentUser.id
          ? { ...notification, read: true }
          : notification
      ),
    }));
  };

  const requestBooking = ({
    tutorId,
    sessionTypeId,
    slot,
    topic,
    notes,
  }) => {
    if (currentUser.role !== "student") {
      return;
    }

    const newBooking = {
      id: `booking-${Date.now()}`,
      studentId: currentUser.id,
      tutorId,
      sessionTypeId,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: "pending",
      learnerName: currentUser.name,
      topic: topic.trim(),
      notes: notes.trim(),
    };

    const tutorUser = getTutorUser(tutorId);
    const tutor = getTutor(tutorId);

    setDemoState((currentState) => {
      const newNotifications = tutorUser
        ? [
            createNotification({
              userId: tutorUser.id,
              type: "booking-requested",
              title: "New booking request",
              message: `${currentUser.name} requested a lesson${
                tutor ? ` with ${tutor.name}` : ""
              } on ${formatDateTime(slot.startTime)}. Topic: ${
                topic.trim() || "Not specified"
              }.`,
              bookingId: newBooking.id,
            }),
            ...currentState.notifications,
          ]
        : currentState.notifications;

      return {
        ...currentState,
        extraBookings: [newBooking, ...currentState.extraBookings],
        notifications: newNotifications,
      };
    });

    setPage("sessions");
  };

  const joinAdvertisedSession = (sessionId) => {
    if (currentUser.role !== "student") {
      return;
    }

    setDemoState((currentState) => {
      const updatedExtraAdvertisedSessions =
        currentState.extraAdvertisedSessions.map((session) => {
          if (session.id !== sessionId) {
            return session;
          }

          if (session.bookedStudentIds.includes(currentUser.id)) {
            return session;
          }

          if (session.bookedStudentIds.length >= session.capacity) {
            return session;
          }

          return {
            ...session,
            bookedStudentIds: [...session.bookedStudentIds, currentUser.id],
          };
        });

      const currentStudentIds =
        currentState.advertisedSessionBookingOverrides[sessionId] ?? [];

      if (currentStudentIds.includes(currentUser.id)) {
        return {
          ...currentState,
          extraAdvertisedSessions: updatedExtraAdvertisedSessions,
        };
      }

      return {
        ...currentState,
        extraAdvertisedSessions: updatedExtraAdvertisedSessions,
        advertisedSessionBookingOverrides: {
          ...currentState.advertisedSessionBookingOverrides,
          [sessionId]: [...currentStudentIds, currentUser.id],
        },
      };
    });

    setPage("sessions");
  };

  const updateBookingStatus = (bookingId, status) => {
    setDemoState((currentState) => {
      const existingBooking =
        currentState.extraBookings.find((booking) => booking.id === bookingId) ??
        bookings.find((booking) => booking.id === bookingId) ??
        null;

      if (!existingBooking) {
        return currentState;
      }

      const previousStatus =
        currentState.bookingStatusOverrides[bookingId] ??
        existingBooking.status ??
        null;

      const isFinalBookingStatus = status === "confirmed" || status === "declined";

      const updatedExtraBookings = currentState.extraBookings.map((booking) =>
        booking.id === bookingId ? { ...booking, status } : booking
      );

      const cleanedNotifications = currentState.notifications.map(
        (notification) => {
          const shouldMarkRequestAsHandled =
            isFinalBookingStatus &&
            notification.bookingId === bookingId &&
            notification.type === "booking-requested";

          if (!shouldMarkRequestAsHandled) {
            return notification;
          }

          return {
            ...notification,
            read: true,
          };
        }
      );

      const shouldNotifyStudent =
        existingBooking.studentId &&
        previousStatus !== status &&
        isFinalBookingStatus;

      const tutor = getTutor(existingBooking.tutorId);
      const studentUser = shouldNotifyStudent
        ? getStudentUser(existingBooking.studentId)
        : null;

      const studentNotification =
        shouldNotifyStudent && studentUser
          ? createNotification({
              userId: studentUser.id,
              type:
                status === "confirmed"
                  ? "booking-confirmed"
                  : "booking-declined",
              title:
                status === "confirmed"
                  ? "Booking confirmed"
                  : "Booking declined",
              message:
                status === "confirmed"
                  ? `Your lesson with ${
                      tutor?.name ?? "your tutor"
                    } on ${formatDateTime(
                      existingBooking.startTime
                    )} has been confirmed.`
                  : `Your lesson request with ${
                      tutor?.name ?? "your tutor"
                    } on ${formatDateTime(
                      existingBooking.startTime
                    )} was declined.`,
              bookingId,
            })
          : null;

      return {
        ...currentState,
        extraBookings: updatedExtraBookings,
        bookingStatusOverrides: {
          ...currentState.bookingStatusOverrides,
          [bookingId]: status,
        },
        liveSessionStatusOverrides:
          status === "confirmed"
            ? {
                ...currentState.liveSessionStatusOverrides,
                [bookingId]:
                  currentState.liveSessionStatusOverrides[bookingId] ??
                  "upcoming",
              }
            : currentState.liveSessionStatusOverrides,
        notifications: studentNotification
          ? [studentNotification, ...cleanedNotifications]
          : cleanedNotifications,
      };
    });
  };

  const startLiveSession = () => {
    if (!activeLiveBookingId || currentUser.role !== "tutor") {
      return;
    }

    setDemoState((currentState) => {
      const booking =
        currentState.extraBookings.find(
          (item) => item.id === activeLiveBookingId
        ) ??
        bookings.find((item) => item.id === activeLiveBookingId) ??
        null;

      if (!booking) {
        return currentState;
      }

      const studentUser = getStudentUser(booking.studentId);
      const tutor = getTutor(booking.tutorId);

      const studentNotification = studentUser
        ? createNotification({
            userId: studentUser.id,
            type: "session-started",
            title: "Session started",
            message: `${tutor?.name ?? "Your tutor"} has started your BUZA session. You can now join the live session room.`,
            bookingId: activeLiveBookingId,
          })
        : null;

      return {
        ...currentState,
        liveSessionStatusOverrides: {
          ...currentState.liveSessionStatusOverrides,
          [activeLiveBookingId]: "live",
        },
        notifications: studentNotification
          ? [studentNotification, ...currentState.notifications]
          : currentState.notifications,
      };
    });
  };

  const endLiveSession = () => {
    if (!activeLiveBookingId || currentUser.role !== "tutor") {
      return;
    }

    setDemoState((currentState) => {
      const booking =
        currentState.extraBookings.find(
          (item) => item.id === activeLiveBookingId
        ) ??
        bookings.find((item) => item.id === activeLiveBookingId) ??
        null;

      if (!booking) {
        return currentState;
      }

      const studentUser = getStudentUser(booking.studentId);
      const tutor = getTutor(booking.tutorId);

      const studentNotification = studentUser
        ? createNotification({
            userId: studentUser.id,
            type: "session-ended",
            title: "Session ended — feedback needed",
            message: `${tutor?.name ?? "Your tutor"} has ended the session. Please rate the lesson and leave feedback to close it out.`,
            bookingId: activeLiveBookingId,
          })
        : null;

      return {
        ...currentState,
        liveSessionStatusOverrides: {
          ...currentState.liveSessionStatusOverrides,
          [activeLiveBookingId]: "ended",
        },
        notifications: studentNotification
          ? [studentNotification, ...currentState.notifications]
          : currentState.notifications,
      };
    });
  };

  const submitSessionFeedback = ({ rating, comment }) => {
    if (!activeLiveBookingId || currentUser.role !== "student") {
      return;
    }

    setDemoState((currentState) => {
      const booking =
        currentState.extraBookings.find(
          (item) => item.id === activeLiveBookingId
        ) ??
        bookings.find((item) => item.id === activeLiveBookingId) ??
        null;

      if (!booking) {
        return currentState;
      }

      const tutorUser = getTutorUser(booking.tutorId);

      const tutorNotification = tutorUser
        ? createNotification({
            userId: tutorUser.id,
            type: "session-feedback-submitted",
            title: "Session feedback submitted",
            message: `${currentUser.name} rated the session ${rating}/5${
              comment ? ` and left a comment.` : "."
            } The session is now completed for demo purposes.`,
            bookingId: activeLiveBookingId,
          })
        : null;

      return {
        ...currentState,
        liveSessionStatusOverrides: {
          ...currentState.liveSessionStatusOverrides,
          [activeLiveBookingId]: "completed",
        },
        sessionFeedback: {
          ...currentState.sessionFeedback,
          [activeLiveBookingId]: {
            rating,
            comment,
            submittedBy: currentUser.id,
            submittedAt: new Date().toISOString(),
          },
        },
        notifications: tutorNotification
          ? [tutorNotification, ...currentState.notifications]
          : currentState.notifications,
      };
    });
  };

  const viewNotificationTimetable = (notification) => {
    const booking = notification.bookingId
      ? getBookingById(notification.bookingId)
      : null;

    if (!notification.read) {
      markNotificationRead(notification.id);
    }

    if (booking) {
      setTimetableFocus({
        eventId: notification.bookingId,
        eventKind: "booking",
        eventDate: booking.startTime.slice(0, 10),
        createdAt: new Date().toISOString(),
      });
    } else {
      setTimetableFocus(null);
    }

    setActiveLiveBookingId(null);
    setShowNotifications(false);
    setPage("sessions");
  };

  const openSessionFromNotification = (notification) => {
    if (!notification.bookingId) {
      return;
    }

    if (!notification.read) {
      markNotificationRead(notification.id);
    }

    openLiveSession(notification.bookingId);
  };

  const acceptNotificationBooking = (notification) => {
    if (!notification.bookingId) {
      return;
    }

    updateBookingStatus(notification.bookingId, "confirmed");
  };

  const declineNotificationBooking = (notification) => {
    if (!notification.bookingId) {
      return;
    }

    updateBookingStatus(notification.bookingId, "declined");
  };

  const addAvailabilityWindow = (availabilityWindow) => {
    setDemoState((currentState) => ({
      ...currentState,
      extraAvailabilityWindows: [
        availabilityWindow,
        ...currentState.extraAvailabilityWindows,
      ],
    }));
  };

  const updateAvailabilityWindow = (availabilityWindowId, updatedFields) => {
    setDemoState((currentState) => ({
      ...currentState,
      extraAvailabilityWindows: currentState.extraAvailabilityWindows.map(
        (availabilityWindow) =>
          availabilityWindow.id === availabilityWindowId
            ? { ...availabilityWindow, ...updatedFields }
            : availabilityWindow
      ),
    }));
  };

  const removeAvailabilityWindow = (availabilityWindowId) => {
    setDemoState((currentState) => ({
      ...currentState,
      extraAvailabilityWindows: currentState.extraAvailabilityWindows.filter(
        (availabilityWindow) => availabilityWindow.id !== availabilityWindowId
      ),
    }));
  };

  const addBlockedTime = (blockedTime) => {
    setDemoState((currentState) => ({
      ...currentState,
      extraBlockedTimes: [blockedTime, ...currentState.extraBlockedTimes],
    }));
  };

  const updateBlockedTime = (blockedTimeId, updatedFields) => {
    setDemoState((currentState) => ({
      ...currentState,
      extraBlockedTimes: currentState.extraBlockedTimes.map((blockedTime) =>
        blockedTime.id === blockedTimeId
          ? { ...blockedTime, ...updatedFields }
          : blockedTime
      ),
    }));
  };

  const removeBlockedTime = (blockedTimeId) => {
    setDemoState((currentState) => ({
      ...currentState,
      extraBlockedTimes: currentState.extraBlockedTimes.filter(
        (blockedTime) => blockedTime.id !== blockedTimeId
      ),
    }));
  };

  const addAdvertisedSession = (advertisedSession) => {
    setDemoState((currentState) => ({
      ...currentState,
      extraAdvertisedSessions: [
        advertisedSession,
        ...currentState.extraAdvertisedSessions,
      ],
    }));
  };

  const updateAdvertisedSession = (sessionId, updatedFields) => {
    setDemoState((currentState) => ({
      ...currentState,
      extraAdvertisedSessions: currentState.extraAdvertisedSessions.map(
        (session) =>
          session.id === sessionId ? { ...session, ...updatedFields } : session
      ),
    }));
  };

  const removeAdvertisedSession = (sessionId) => {
    setDemoState((currentState) => ({
      ...currentState,
      extraAdvertisedSessions: currentState.extraAdvertisedSessions.filter(
        (session) => session.id !== sessionId
      ),
    }));
  };

  const liveSessionBooking = activeLiveBookingId
    ? getBookingWithCurrentStatus(activeLiveBookingId)
    : null;

  const pages = {
    home: (
      <HomePage
        setPage={setPage}
        onStartBooking={() => startBooking(null)}
      />
    ),
    discover: <DiscoverPage onViewTutor={viewTutor} />,
    profile: (
      <TutorProfilePage
        tutorId={selectedTutorId}
        setPage={setPage}
        onBookTutor={startBooking}
      />
    ),
    booking: (
      <BookingPage
        currentUser={currentUser}
        tutorId={selectedTutorId}
        onSelectTutor={setSelectedTutorId}
        setPage={setPage}
        extraBookings={extraBookings}
        extraAvailabilityWindows={extraAvailabilityWindows}
        extraBlockedTimes={extraBlockedTimes}
        extraAdvertisedSessions={extraAdvertisedSessions}
        advertisedSessionBookingOverrides={advertisedSessionBookingOverrides}
        bookingStatusOverrides={bookingStatusOverrides}
        onRequestBooking={requestBooking}
        onJoinAdvertisedSession={joinAdvertisedSession}
      />
    ),
    sessions: (
      <SessionsPage
        currentUser={currentUser}
        extraBookings={extraBookings}
        extraAvailabilityWindows={extraAvailabilityWindows}
        extraBlockedTimes={extraBlockedTimes}
        extraAdvertisedSessions={extraAdvertisedSessions}
        advertisedSessionBookingOverrides={advertisedSessionBookingOverrides}
        bookingStatusOverrides={bookingStatusOverrides}
        liveSessionStatusOverrides={liveSessionStatusOverrides}
        timetableFocus={timetableFocus}
        onTimetableFocusHandled={() => setTimetableFocus(null)}
        onUpdateBookingStatus={updateBookingStatus}
        onOpenLiveSession={openLiveSession}
        onAddAvailabilityWindow={addAvailabilityWindow}
        onUpdateAvailabilityWindow={updateAvailabilityWindow}
        onRemoveAvailabilityWindow={removeAvailabilityWindow}
        onAddBlockedTime={addBlockedTime}
        onUpdateBlockedTime={updateBlockedTime}
        onRemoveBlockedTime={removeBlockedTime}
        onAddAdvertisedSession={addAdvertisedSession}
        onUpdateAdvertisedSession={updateAdvertisedSession}
        onRemoveAdvertisedSession={removeAdvertisedSession}
      />
    ),
    "live-session": (
      <LiveSessionPage
        currentUser={currentUser}
        booking={liveSessionBooking}
        sessionStatus={
          activeLiveBookingId
            ? getLiveSessionStatus(activeLiveBookingId)
            : "upcoming"
        }
        existingFeedback={
          activeLiveBookingId
            ? sessionFeedback[activeLiveBookingId] ?? null
            : null
        }
        onBackToTimetable={backToTimetable}
        onStartSession={startLiveSession}
        onEndSession={endLiveSession}
        onSubmitFeedback={submitSessionFeedback}
      />
    ),
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: "Inter, Segoe UI, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "24px 18px 90px",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "flex-start",
            marginBottom: 26,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: 28, fontWeight: 950, color: C.white }}>
              BUZA
            </div>
            <div style={{ color: C.spark, fontWeight: 800 }}>Uzothola.</div>
            <div style={{ color: C.muted, fontSize: 13 }}>
              Helping you find your way.
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: 10,
              justifyItems: "end",
            }}
          >
            <CurrentUserSwitcher
              currentUserId={currentUserId}
              onChange={setCurrentUserId}
            />

            <NotificationBell
              notifications={currentUserNotifications}
              unreadCount={unreadNotificationCount}
              isOpen={showNotifications}
              onToggle={() => setShowNotifications((isOpen) => !isOpen)}
              onMarkRead={markNotificationRead}
              onMarkAllRead={markAllCurrentUserNotificationsRead}
              onViewTimetable={viewNotificationTimetable}
              onOpenSession={openSessionFromNotification}
              onAcceptBooking={acceptNotificationBooking}
              onDeclineBooking={declineNotificationBooking}
              getBookingStatus={getBookingStatus}
            />

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <NavButton
                label="Home"
                active={page === "home"}
                onClick={() => {
                  setTimetableFocus(null);
                  setActiveLiveBookingId(null);
                  setPage("home");
                }}
              />
              <NavButton
                label="Discover"
                active={page === "discover"}
                onClick={() => {
                  setTimetableFocus(null);
                  setActiveLiveBookingId(null);
                  setPage("discover");
                }}
              />
              <NavButton
                label="Timetable"
                active={page === "sessions"}
                onClick={() => {
                  setTimetableFocus(null);
                  setActiveLiveBookingId(null);
                  setPage("sessions");
                }}
              />
              <NavButton
                label="Book"
                active={page === "booking"}
                onClick={() => startBooking(null)}
              />
            </div>

            <DemoResetButton onClick={resetDemoData} />
          </div>
        </header>

        {pages[page] ?? pages.home}
      </div>
    </main>
  );
}

export default App;