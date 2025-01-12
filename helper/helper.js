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