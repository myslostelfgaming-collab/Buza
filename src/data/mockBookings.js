export const bookings = [
  {
    id: "booking-1",
    studentId: "student-1",
    tutorId: 1,
    sessionTypeId: "lesson-60",
    startTime: "2026-06-23T16:00:00",
    endTime: "2026-06-23T17:00:00",
    status: "confirmed",
  },
  {
    id: "booking-2",
    studentId: "student-1",
    tutorId: 2,
    sessionTypeId: "science-lesson-60",
    startTime: "2026-06-25T17:30:00",
    endTime: "2026-06-25T18:30:00",
    status: "pending",
  },
  {
    id: "booking-3",
    studentId: "student-2",
    tutorId: 1,
    sessionTypeId: "homework-30",
    startTime: "2026-06-24T15:30:00",
    endTime: "2026-06-24T16:00:00",
    status: "confirmed",
  },
];

export const advertisedSessions = [
  {
    id: "group-1",
    tutorId: 1,
    sessionTypeId: "exam-90",
    title: "Grade 12 Maths Group Revision",
    startTime: "2026-06-22T17:00:00",
    endTime: "2026-06-22T18:30:00",
    capacity: 12,
    bookedStudentIds: ["student-1", "student-2"],
    status: "advertised",
  },
  {
    id: "group-2",
    tutorId: 2,
    sessionTypeId: "practical-prep-75",
    title: "Chemistry Test Prep Group",
    startTime: "2026-06-26T16:00:00",
    endTime: "2026-06-26T17:15:00",
    capacity: 8,
    bookedStudentIds: ["student-1"],
    status: "advertised",
  },
];