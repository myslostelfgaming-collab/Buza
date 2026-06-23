import { useState } from "react";
import CurrentUserSwitcher from "./components/CurrentUserSwitcher";
import NavButton from "./components/NavButton";
import HomePage from "./pages/HomePage";
import DiscoverPage from "./pages/DiscoverPage";
import TutorProfilePage from "./pages/TutorProfilePage";
import BookingPage from "./pages/BookingPage";
import SessionsPage from "./pages/SessionsPage";
import { C } from "./data/theme";
import { defaultCurrentUserId, users } from "./data/mockUsers";

function App() {
  const [page, setPage] = useState("home");
  const [selectedTutorId, setSelectedTutorId] = useState(null);
  const [extraBookings, setExtraBookings] = useState([]);
  const [extraAvailabilityWindows, setExtraAvailabilityWindows] = useState([]);
  const [extraBlockedTimes, setExtraBlockedTimes] = useState([]);
  const [extraAdvertisedSessions, setExtraAdvertisedSessions] = useState([]);
  const [advertisedSessionBookingOverrides, setAdvertisedSessionBookingOverrides] =
    useState({});
  const [bookingStatusOverrides, setBookingStatusOverrides] = useState({});
  const [currentUserId, setCurrentUserId] = useState(defaultCurrentUserId);

  const currentUser =
    users.find((user) => user.id === currentUserId) ?? users[0];

  const viewTutor = (tutorId) => {
    setSelectedTutorId(tutorId);
    setPage("profile");
  };

  const startBooking = (tutorId = null) => {
    setSelectedTutorId(tutorId);
    setPage("booking");
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

    setExtraBookings((currentBookings) => [newBooking, ...currentBookings]);
    setPage("sessions");
  };

  const joinAdvertisedSession = (sessionId) => {
    if (currentUser.role !== "student") {
      return;
    }

    setExtraAdvertisedSessions((currentSessions) =>
      currentSessions.map((session) => {
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
      })
    );

    setAdvertisedSessionBookingOverrides((currentOverrides) => {
      const currentStudentIds = currentOverrides[sessionId] ?? [];

      if (currentStudentIds.includes(currentUser.id)) {
        return currentOverrides;
      }

      return {
        ...currentOverrides,
        [sessionId]: [...currentStudentIds, currentUser.id],
      };
    });

    setPage("sessions");
  };

  const updateBookingStatus = (bookingId, status) => {
    setExtraBookings((currentBookings) =>
      currentBookings.map((booking) =>
        booking.id === bookingId ? { ...booking, status } : booking
      )
    );

    setBookingStatusOverrides((currentOverrides) => ({
      ...currentOverrides,
      [bookingId]: status,
    }));
  };

  const addAvailabilityWindow = (availabilityWindow) => {
    setExtraAvailabilityWindows((currentWindows) => [
      availabilityWindow,
      ...currentWindows,
    ]);
  };

  const addBlockedTime = (blockedTime) => {
    setExtraBlockedTimes((currentBlockedTimes) => [
      blockedTime,
      ...currentBlockedTimes,
    ]);
  };

  const addAdvertisedSession = (advertisedSession) => {
    setExtraAdvertisedSessions((currentSessions) => [
      advertisedSession,
      ...currentSessions,
    ]);
  };

  const removeAdvertisedSession = (sessionId) => {
    setExtraAdvertisedSessions((currentSessions) =>
      currentSessions.filter((session) => session.id !== sessionId)
    );
  };

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
        onUpdateBookingStatus={updateBookingStatus}
        onAddAvailabilityWindow={addAvailabilityWindow}
        onAddBlockedTime={addBlockedTime}
        onAddAdvertisedSession={addAdvertisedSession}
        onRemoveAdvertisedSession={removeAdvertisedSession}
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

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <NavButton
                label="Home"
                active={page === "home"}
                onClick={() => setPage("home")}
              />
              <NavButton
                label="Discover"
                active={page === "discover"}
                onClick={() => setPage("discover")}
              />
              <NavButton
                label="Timetable"
                active={page === "sessions"}
                onClick={() => setPage("sessions")}
              />
              <NavButton
                label="Book"
                active={page === "booking"}
                onClick={() => startBooking(null)}
              />
            </div>
          </div>
        </header>

        {pages[page]}
      </div>
    </main>
  );
}

export default App;