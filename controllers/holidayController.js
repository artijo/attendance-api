import { fecthHolidayDateTime } from '../helper/holidayApi.js';

export const getHolidayListAuto = async (req, res) => {
    try {
        const holiday = await fecthHolidayDateTime();
        res.json(holiday);
    } catch (err) {
        console.error(err);
        res.json(err);
    }
}