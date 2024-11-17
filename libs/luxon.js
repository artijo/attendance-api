import { DateTime } from "luxon";

// Helper Function for Luxon
function toTimezone(date, timezone = process.env.TIME_ZONE || 'Asia/Bangkok') {
    return DateTime.fromJSDate(date).setZone(timezone).toFormat('yyyy-MM-dd HH:mm:ss');
  }
  
  function toISO(date, timezone = process.env.TIME_ZONE || 'Asia/Bangkok') {
    return DateTime.fromJSDate(date).setZone(timezone).toISO();
  }
  