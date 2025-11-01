import { containsNumber } from "@turf/turf";
import { DateTime } from "luxon";

const zone = process.env.TIME_ZONE || "Asia/Bangkok";

export function formatTime(stringTime) {
  // HH:MM:SS ->  [HH, MM, SS]
  const time = stringTime.split(":");
  return time;
}

export function formatDateYYYYMMDD(stringDate) {
  const year = stringDate.slice(0, 4);
  const month = stringDate.slice(4, 6);
  const day = stringDate.slice(6);
  return `${year}-${month}-${day}`;
}

export function formatDayOfWeeks(dayOfWeek) {
  const dayOfWeeksThai = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"];
  for (let i = 0; i <= dayOfWeeksThai.length; i++) {
    if (dayOfWeek - 1 === i) {
      return dayOfWeeksThai[i];
    }
  }
}

export function CheckDateBetween(startDate, endDate, checkStart, checkEnd) {
  const sDateForamt = DateTime.fromJSDate(startDate).setZone("UTC");
  const eDateFormat = DateTime.fromJSDate(endDate).setZone("UTC");
  if (checkStart >= sDateForamt && checkStart <= eDateFormat) {
    return true;
  } else if (checkEnd >= sDateForamt && checkEnd <= eDateFormat) {
    return true;
  } else {
    return false;
  }
}

export function daybetween(Start, End) {
  const dates = [];
  if (Start !== "" && End !== "") {
    const startDate = DateTime.fromISO(Start).setZone(zone);
    const endDate = DateTime.fromISO(End).setZone(zone);
    let currentDate = startDate;
    while (currentDate <= endDate) {
      dates.push(currentDate.toISODate().split("-").join("-")); // เพิ่มวันที่ในรูปแบบ YYYY-MM-DD
      currentDate = currentDate.plus({ days: 1 }); // เพิ่มวันทีละ 1
    }
  } else {
    console.error("termStart or termEnd is not set!");
  }
  return dates;
}

// ฟังก์ชัน sensor ชื่อให้ลงท้ายด้สย xxxx
export function sensorName(name) {
  return name.slice(0, 3) + "xxxx";
}

export const formatTitle = (title) => {
  switch (title) {
    case "BOY":
      return "เด็กชาย";
    case "GIRL":
      return "เด็กหญิง";
    case "MR":
      return "นาย";
    case "MS":
      return "นางสาว";
    default:
      return title;
  }
};

export function formateAttendanceStatus(status) {
  switch (status) {
    case "PRESENT":
      return "มา";
    case "ABSENT":
      return "ขาด";
    case "LATE":
      return "มาสาย";
    case "LEAVE":
      return "ลา";
    case "ACTIVITY":
      return "กิจกรรม";
    default:
      return status;
  }
}

export function getLastestTerm(term) {
  const latestYear = Math.max(...term.map((t) => parseInt(t.academicYear)));
  const latestTermsInYear = term.filter(
    (termItem) => parseInt(termItem.academicYear) === latestYear,
  );
  if (latestTermsInYear.length > 1) {
    const latestSemester = Math.max(
      ...latestTermsInYear.map((termItem) => parseInt(termItem.semester)),
    );
    return latestTermsInYear.filter(
      (termItem) => parseInt(termItem.semester) === latestSemester,
    )[0];
  }
  return latestTermsInYear[0];
}
