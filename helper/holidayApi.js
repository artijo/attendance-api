import axios from "axios";
import { DateTime } from "luxon";

export async function fecthHolidayDateTime(){
    try{
        // https://api.holidayapi.com/v1/holidays?key=YOUR_API_KEY&country=US&year=2021
        // https://www.myhora.com/calendar/ical/holiday.aspx?2568.json
        const year = DateTime.now().year + 543;
        const URL = `https://www.myhora.com/calendar/ical/holiday.aspx?${year}.json`;
        const responed = await axios.get(URL);
        const VCALENDAR = responed.data.VCALENDAR[0].VEVENT;
        return VCALENDAR;
    }catch(err){
        console.log(err)
    }
}