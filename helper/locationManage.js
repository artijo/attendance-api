export function locationVerify(userLocation) {
    const polygonSchool = turf.polygon([[
        [102.85264543866062, 16.701971672148147], 
        [102.85337001952111, 16.704237418498582], 
        [102.85505175501626, 16.70368014750315],
        [102.85426318556053, 16.701373144096074],
        [102.85264543866062, 16.701971672148147] // ปิด polygon
    ]]);
    const longitude = userLocation.longitude;
    const latitude = userLocation.latitude;
    const userPoint = turf.point([longitude, latitude]); // userPoint
    return turf.booleanPointInPolygon(userPoint, polygonSchool);
}