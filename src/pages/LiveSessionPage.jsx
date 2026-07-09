import { useState } from "react";
import { tutors } from "../data/mockTutors";
import { C } from "../data/theme";

function formatDateTime(dateTime) {
  const date = new Date(dateTime);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString([], {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
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

function getTutorName(tutorId) {
  return tutors.find((tutor) => tutor.id === tutorId)?.name ?? "Tutor";
}

function getSessionStatusLabel(status) {
  if (status === "live") return "Live now";
  if (status === "ended") return "Ended · awaiting feedback";
  if (status === "completed") return "Completed";
  return "Waiting to start";
}

function getSessionStatusColor(status) {
  if (status === "live") return C.green;
  if (status === "ended") return C.spark;
  if (status === "completed") return C.blue;
  return C.muted;
}

function Pill({ children, color = C.muted }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        padding: "5px 10px",
        background: color + "22",
        color,
        fontSize: 12,
        fontWeight: 950,
      }}
    >
      {children}
    </span>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled = false,
  tone = "primary",
  type = "button",
}) {
  const isDanger = tone === "danger";
  const isSuccess = tone === "success";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        border: isDanger ? "1px solid #F87171" : "none",
        background: isDanger ? "transparent" : isSuccess ? C.green : C.spark,
        color: isDanger ? "#F87171" : "#000",
        borderRadius: 999,
        padding: "10px 14px",
        fontWeight: 950,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        border: `1px solid ${C.border}`,
        background: C.surface,
        color: C.text,
        borderRadius: 999,
        padding: "10px 14px",
        fontWeight: 900,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

function VideoTile({ title, subtitle, isActive = false }) {
  return (
    <div
      style={{
        minHeight: 230,
        background: isActive
          ? "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(59,130,246,0.10))"
          : C.surface,
        border: `1px solid ${isActive ? C.green : C.border}`,
        borderRadius: 18,
        padding: 18,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          color: isActive ? C.green : C.muted,
          fontSize: 12,
          fontWeight: 950,
          textTransform: "uppercase",
          letterSpacing: 0.7,
        }}
      >
        {isActive ? "Connected" : "Camera placeholder"}
      </div>

      <div
        style={{
          display: "grid",
          justifyItems: "center",
          gap: 10,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: isActive ? C.green : C.card,
            color: isActive ? "#000" : C.text,
            display: "grid",
            placeItems: "center",
            fontSize: 28,
            fontWeight: 950,
            border: `1px solid ${isActive ? C.green : C.border}`,
          }}
        >
          {title.slice(0, 1)}
        </div>

        <div>
          <div style={{ color: C.white, fontWeight: 950 }}>{title}</div>
          <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
            {subtitle}
          </div>
        </div>
      </div>

      <div style={{ color: C.muted, fontSize: 12, textAlign: "center" }}>
        Real video/audio provider will plug in here later.
      </div>
    </div>
  );
}

function FeedbackForm({ onSubmitFeedback }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const submitFeedback = (event) => {
    event.preventDefault();

    onSubmitFeedback({
      rating,
      comment: comment.trim(),
    });
  };

  return (
    <form
      onSubmit={submitFeedback}
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        padding: 18,
        display: "grid",
        gap: 14,
      }}
    >
      <div>
        <h2 style={{ color: C.white, margin: 0 }}>Close out this session</h2>
        <p style={{ color: C.muted, lineHeight: 1.6, marginBottom: 0 }}>
          Please rate the lesson and leave a short comment. Later this step can
          connect to dispute handling and payment release.
        </p>
      </div>

      <label style={{ display: "grid", gap: 7 }}>
        <span style={{ color: C.white, fontWeight: 900 }}>Rating</span>
        <select
          value={rating}
          onChange={(event) => setRating(Number(event.target.value))}
          style={{
            background: C.surface,
            color: C.text,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: "11px 12px",
            fontWeight: 800,
          }}
        >
          <option value={5}>5 — Excellent</option>
          <option value={4}>4 — Good</option>
          <option value={3}>3 — Okay</option>
          <option value={2}>2 — Needs improvement</option>
          <option value={1}>1 — Serious concern</option>
        </select>
      </label>

      <label style={{ display: "grid", gap: 7 }}>
        <span style={{ color: C.white, fontWeight: 900 }}>
          Comment / feedback
        </span>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={4}
          placeholder="How did the session go?"
          style={{
            background: C.surface,
            color: C.text,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: "11px 12px",
            resize: "vertical",
            lineHeight: 1.5,
          }}
        />
      </label>

      <div>
        <PrimaryButton type="submit" tone="success">
          Submit feedback
        </PrimaryButton>
      </div>
    </form>
  );
}

export default function LiveSessionPage({
  currentUser,
  booking,
  sessionStatus = "upcoming",
  existingFeedback = null,
  onBackToTimetable,
  onStartSession,
  onEndSession,
  onSubmitFeedback,
}) {
  if (!booking) {
    return (
      <section>
        <h1 style={{ color: C.white, marginTop: 0 }}>Live Session</h1>

        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 18,
            padding: 18,
            color: C.muted,
            lineHeight: 1.6,
          }}
        >
          This session could not be found.
        </div>

        <div style={{ marginTop: 16 }}>
          <SecondaryButton onClick={onBackToTimetable}>
            Back to timetable
          </SecondaryButton>
        </div>
      </section>
    );
  }

  const isTutor = currentUser.role === "tutor";
  const isStudent = currentUser.role === "student";
  const tutorName = getTutorName(booking.tutorId);
  const studentName = booking.learnerName ?? "Student";
  const isLive = sessionStatus === "live";
  const isEnded = sessionStatus === "ended";
  const isCompleted = sessionStatus === "completed";

  return (
    <section>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 14,
          flexWrap: "wrap",
          alignItems: "flex-start",
          marginBottom: 18,
        }}
      >
        <div>
          <h1 style={{ color: C.white, margin: 0 }}>BUZA Live Session</h1>
          <div style={{ color: C.muted, marginTop: 8, lineHeight: 1.5 }}>
            {formatDateTime(booking.startTime)} · {formatTime(booking.startTime)}
            –{formatTime(booking.endTime)}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Pill color={getSessionStatusColor(sessionStatus)}>
            {getSessionStatusLabel(sessionStatus)}
          </Pill>

          <SecondaryButton onClick={onBackToTimetable}>
            Back to timetable
          </SecondaryButton>
        </div>
      </div>

      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          padding: 18,
          marginBottom: 18,
          display: "grid",
          gap: 12,
        }}
      >
        <div style={{ color: C.white, fontWeight: 950 }}>
          Session overview
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 12,
          }}
        >
          <div>
            <div style={{ color: C.muted, fontSize: 12, fontWeight: 900 }}>
              Tutor
            </div>
            <div style={{ color: C.text, marginTop: 4 }}>{tutorName}</div>
          </div>

          <div>
            <div style={{ color: C.muted, fontSize: 12, fontWeight: 900 }}>
              Learner
            </div>
            <div style={{ color: C.text, marginTop: 4 }}>{studentName}</div>
          </div>

          <div>
            <div style={{ color: C.muted, fontSize: 12, fontWeight: 900 }}>
              Topic
            </div>
            <div style={{ color: C.text, marginTop: 4 }}>
              {booking.topic || "Not specified"}
            </div>
          </div>

          <div>
            <div style={{ color: C.muted, fontSize: 12, fontWeight: 900 }}>
              Booking status
            </div>
            <div
              style={{
                color: C.text,
                marginTop: 4,
                textTransform: "capitalize",
              }}
            >
              {booking.status}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          padding: 18,
          marginBottom: 18,
          display: "grid",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ color: C.white, margin: 0 }}>Video room</h2>
            <div style={{ color: C.muted, fontSize: 13, marginTop: 5 }}>
              This is the session shell. Real video/audio can be integrated
              later.
            </div>
          </div>

          {isTutor && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {sessionStatus === "upcoming" && (
                <PrimaryButton onClick={onStartSession} tone="success">
                  Start Session
                </PrimaryButton>
              )}

              {sessionStatus === "live" && (
                <PrimaryButton onClick={onEndSession} tone="danger">
                  End Session
                </PrimaryButton>
              )}
            </div>
          )}
        </div>

        {isStudent && sessionStatus === "upcoming" && (
          <div
            style={{
              background: C.surface,
              border: `1px dashed ${C.border}`,
              borderRadius: 14,
              padding: 14,
              color: C.muted,
              lineHeight: 1.6,
            }}
          >
            Waiting for the tutor to start the session.
          </div>
        )}

        {sessionStatus === "ended" && (
          <div
            style={{
              background: C.spark + "18",
              border: `1px solid ${C.spark}`,
              borderRadius: 14,
              padding: 14,
              color: C.text,
              lineHeight: 1.6,
            }}
          >
            This session has ended. Feedback is required before the session is
            treated as completed.
          </div>
        )}

        {sessionStatus === "completed" && (
          <div
            style={{
              background: C.green + "18",
              border: `1px solid ${C.green}`,
              borderRadius: 14,
              padding: 14,
              color: C.text,
              lineHeight: 1.6,
            }}
          >
            This session has been completed. Later this status can unlock payout
            processing.
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14,
          }}
        >
          <VideoTile
            title={tutorName}
            subtitle="Tutor"
            isActive={isLive || isEnded || isCompleted}
          />

          <VideoTile
            title={studentName}
            subtitle="Learner"
            isActive={isLive || isEnded || isCompleted}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <SecondaryButton disabled={!isLive}>🎙️ Mute</SecondaryButton>
          <SecondaryButton disabled={!isLive}>📷 Camera</SecondaryButton>
          <SecondaryButton disabled={!isLive}>🖥️ Share screen</SecondaryButton>
          <SecondaryButton disabled={!isLive}>💬 Chat</SecondaryButton>
          <SecondaryButton disabled={!isLive}>📎 Resources</SecondaryButton>
        </div>
      </div>

      {isStudent && isEnded && !existingFeedback && (
        <FeedbackForm onSubmitFeedback={onSubmitFeedback} />
      )}

      {existingFeedback && (
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 18,
            padding: 18,
            display: "grid",
            gap: 8,
          }}
        >
          <h2 style={{ color: C.white, margin: 0 }}>Feedback submitted</h2>

          <div style={{ color: C.text }}>
            Rating: <strong>{existingFeedback.rating}/5</strong>
          </div>

          {existingFeedback.comment && (
            <div style={{ color: C.muted, lineHeight: 1.6 }}>
              “{existingFeedback.comment}”
            </div>
          )}
        </div>
      )}
    </section>
  );
}