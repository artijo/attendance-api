export function decoreteBehaviourScore(behaviourScore, attendanceStatus) {
  if (attendanceStatus === "ABSENT") {
    return {
      ...behaviourScore,
      decorreted: true, // Mark as decorated
      score: behaviourScore - 1, // Deduct 1 point for absence
      reason: "Attendance status is absent, score adjusted accordingly.",
    };
  } else if (attendanceStatus === "LATE") {
    return {
      ...behaviourScore,
      decorreted: true, // Mark as decorated
      score: behaviourScore - 0.5, // Deduct 0.5 points for being late
      reason: "Attendance status is late, score adjusted accordingly.",
    };
  }
  return {
    ...behaviourScore,
    decorreted: false, // No decoration needed
    reason: "No attendance issues, score remains unchanged.",
  };
}

export function incrementBehaviourScore(
  behaviourScore,
  oddStatus,
  attendanceStatus
) {
  if (
    oddStatus === "LATE" &&
    attendanceStatus !== "ABSENT" &&
    attendanceStatus !== "LATE"
  ) {
    return {
      ...behaviourScore,
      incremented: true, // Mark as incremented
      score: behaviourScore + 0.5, // Increment by 0.5 for being late
      reason: "Incremented score for being late while absent.",
    };
  } else if (
    oddStatus === "ABSENT" &&
    attendanceStatus !== "ABSENT" &&
    attendanceStatus !== "LATE"
  ) {
    return {
      ...behaviourScore,
      incremented: true, // Mark as incremented
      score: behaviourScore + 1, // Increment by 1 for absence
      reason: "Incremented score for absence.",
    };
  }
}
