export function decoreteBehaviourScore(behaviourScore, attendanceStatus) {
  if (attendanceStatus.status === "ABSENT") {
    return {
      ...behaviourScore,
      score: behaviourScore.score - 1, // Deduct 1 point for absence
      reason: "Attendance status is absent, score adjusted accordingly.",
    };
  } else if (attendanceStatus.status === "LATE") {
    return {
      ...behaviourScore,
      score: behaviourScore.score - 0.5, // Deduct 0.5 points for being late
      reason: "Attendance status is late, score adjusted accordingly.",
    };
  }
  return {
    ...behaviourScore,
    reason: "No attendance issues, score remains unchanged.",
  };
}
