// export const locationCalculate = (userLocation) => { // ใช้ polygon ในการคำนวณ 
//     const polygon = [
//         [16.701971672148147, 102.85264543866062], // 1st spot
//         [16.704237418498582, 102.85337001952111], // 2nd spot
//         [16.70368014750315, 102.85505175501626], // 3nd spot
//         [16.701373144096074, 102.85426318556053], //4nd spot 
//     ];
//     let x = userLocation.latitude;
//     let y = userLocation.longitude;
//     let inside = false;
//     for(let i = 0, j = polygon.length - 1; i < polygon.length; j = i++){
//         let xi = polygon[i][0], yi = polygon[i][1];
//         let xj = polygon[j][0], yj = polygon[j][1];
//         let intersect = ((yi > y) !== (yj > y)) &&
//                         (x < (xj - xi) * (y - yi) / ((yj - yi) || 1e-10) + xi);
//         if (intersect) inside = !inside; 
//     }
//     return inside;
// };
function point(latitude , longitude) {
    return {x:latitude, y:longitude}
}

function point_in_polygon(point, polygon) {
    let num_vertices = polygon.length;
    let x = point.latitude;
    let y = point.longitude;
    let inside = false;

    let p1 = polygon[0];
    let p2;

    for(let i = 1; i <= num_vertices; i++) {
        p2 = polygon[i % num_vertices];
        if(y > Math.min(p1.y, p2.y)) {
            if(y <= Math.max(p1.y, p2.y)) {
                if(x <= Math.max(p1.x, p2.x)) {
                    let x_intersection = ((y - p1.y)*(p2.x - p1.x))/(p2.y - p1.y) + p1.x;
                    if(p1.x == p2.x || x <= x_intersection) {
                        inside = !inside;
                    };
                };
            };
        };
        p1 = p2
    };
    return inside;
};


const polygon = [
    point(16.701971672148147, 102.85264543866062), // 1st spot
    point(16.704237418498582, 102.85337001952111), // 2nd spot
    point(16.70368014750315, 102.85505175501626), // 3nd spot
    point(16.701373144096074, 102.85426318556053)
];
// 16.702492794203916, 102.8550092034473
if(point_in_polygon({latitude: 16.702492794203916, longitude:102.8550092034473}, polygon)) {
    console.log('point is inside polygon');
}else {
    console.log('point is not inside polygon');
};