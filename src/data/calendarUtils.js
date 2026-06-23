import { advertisedSessions, bookings } from "./mockBookings";
import { availabilityWindows, blockedTimes } from "./mockCalendar";

const SLOT_STEP_MINUTES = 30;

function toDate(value) {
  return new Date(value);
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function toLocalDateTimeString(date) {
  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
    ":00",
  ].join("");
}

function eventsOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

export function getAvailableSlotsForTutor({ tutorId, durationMinutes }) {
  const tutorAvailability = availabilityWindows.filter(
    (window) => window.tutorId === tutorId
  );

  const busyEvents = [
    ...blockedTimes,
    ...bookings,
    ...advertisedSessions,
  ].filter((event) => event.tutorId === tutorId);

  const slots = [];

  tutorAvailability.forEach((window) => {
    const windowStart = toDate(window.startTime);
    const windowEnd = toDate(window.endTime);

    let slotStart = windowStart;

    while (addMinutes(slotStart, durationMinutes) <= windowEnd) {
      const slotEnd = addMinutes(slotStart, durationMinutes);

      const hasConflict = busyEvents.some((event) =>
        eventsOverlap(
          slotStart,
          slotEnd,
          toDate(event.startTime),
          toDate(event.endTime)
        )
      );

      if (!hasConflict) {
        slots.push({
          id: `${tutorId}-${toLocalDateTimeString(slotStart)}-${durationMinutes}`,
          tutorId,
          startTime: toLocalDateTimeString(slotStart),
          endTime: toLocalDateTimeString(slotEnd),
          durationMinutes,
        });
      }

      slotStart = addMinutes(slotStart, SLOT_STEP_MINUTES);
    }
  });

  return slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export function formatSlotDate(dateTime) {
  return new Date(dateTime).toLocaleDateString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatSlotTime(dateTime) {
  return new Date(dateTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatSlotTimeRange(slot) {
  return `${formatSlotTime(slot.startTime)} – ${formatSlotTime(slot.endTime)}`;
}