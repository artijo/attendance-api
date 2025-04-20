import { DateTime, Zone } from "luxon";

export function formatTime(stringTime) { // HH:MM:SS ->  [HH, MM, SS]
    const time = stringTime.split(':');
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
      if ((dayOfWeek-1) === i) {
        return dayOfWeeksThai[i];
      }
    }
}

export function CheckDateBetween(startDate, endDate, checkStart, checkEnd){
    const sDateForamt = DateTime.fromJSDate(startDate).setZone('UTC');
    const eDateFormat = DateTime.fromJSDate(endDate).setZone('UTC');
    if(checkStart >= sDateForamt && checkStart <= eDateFormat ){
        return true
    }else if(checkEnd >= sDateForamt && checkEnd <= eDateFormat) {
        return true
    }else{
        return false
    }
}


export function daybetween(Start, End) {
    const dates = [];
    if (Start !== "" && End !== "") {
        const startDate = DateTime.fromISO(Start).setZone('Asia/Bangkok');
        const endDate = DateTime.fromISO(End).setZone('Asia/Bangkok');
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
    return name.slice(0, 3) + "xxxx"
}