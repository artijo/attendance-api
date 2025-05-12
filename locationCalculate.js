export const locationCalculate = (userLocation) => { // ใช้ polygon ในการคำนวณ 
    const polygon = [
        [16.701971672148147, 102.85264543866062], // 1st spot
        [16.704237418498582, 102.85337001952111], // 2nd spot
        [16.70368014750315, 102.85505175501626], // 3nd spot
        [16.701373144096074, 102.85426318556053], //4nd spot 
    ];
    let x = userLocation.latitude;
    let y = userLocation.longitude;
    let inside = false;
    for(let i = 0, j = polygon.length - 1; i < polygon.length; j = i++){
        let xi = polygon[i][0], yi = polygon[i][1];
        let xj = polygon[j][0], yj = polygon[j][1];
        let intersect = ((yi > y) !== (yj > y)) &&
                        (x < (xj - xi) * (y - yi) / ((yj - yi) || 1e-10) + xi);
        if (intersect) inside = !inside; 
    }
    return inside;
};

// locationCalculate();



