import { useState } from "react";
import NavButton from "./components/NavButton";
import HomePage from "./pages/HomePage";
import DiscoverPage from "./pages/DiscoverPage";
import TutorProfilePage from "./pages/TutorProfilePage";
import BookingPage from "./pages/BookingPage";
import SessionsPage from "./pages/SessionsPage";
import { C } from "./data/theme";

function App() {
  const [page, setPage] = useState("home");
  const [selectedTutorId, setSelectedTutorId] = useState(null);

  const viewTutor = (tutorId) => {
    setSelectedTutorId(tutorId);
    setPage("profile");
  };

  const startBooking = (tutorId = null) => {
    setSelectedTutorId(tutorId);
    setPage("booking");
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
        tutorId={selectedTutorId}
        onSelectTutor={setSelectedTutorId}
        setPage={setPage}
      />
    ),
    sessions: <SessionsPage />,
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
            alignItems: "center",
            marginBottom: 26,
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
        </header>

        {pages[page]}
      </div>
    </main>
  );
}

export default App;