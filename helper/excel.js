// เรียกใช้ Module

import reader from 'xlsx';
import db from '../prisma/client.js';

//อ่านไฟล์ excel
function readExcel(fileName){
    // test file ที่เตรียมไว้
    const file = reader.readFile(`./helper/${fileName}`); // อ่านไฟล์ excel

    // console.log(file) //สำหรับดู obejct

    let data = []; // ตัวแปรที่เอาไว้เก็บข้อมูลใน excel

    const sheets = file.SheetNames;

    for (let i = 0; i < sheets.length; i++) {
        const temp = reader.utils.sheet_to_json(
            file.Sheets[file.SheetNames[i]]) // file.Sheets['ชีต1'] การเข้าถึง ชีตไฟล์โดยใช้ชื่อ
        temp.forEach((res) => {
            data.push(res) // ดันข้อมูลไปที่ data
        })
    }
    
    return data
}





//export
export async function createExcelSubjectAttendence(objectInfo, subjectName) { // สร้างไฟล์ excel ที่เกี่ยวกับการเข้าเรียนของแต่ละวิชาโดยแสดงรายชื่อนักเรียนทั้งหมด
    
    const raw_data = objectInfo;

    const rowsData = raw_data.map((row) => {
        const statusAttendenceToThai = (enumStatus) => {
            switch(enumStatus){
                case "PRESENT": {
                    return "เข้าเรียน"
                } 
            }
        }

    

        let i = 1;
        const attendanceByPeriods = row.attendance.reduce(() => {
            const key = `คาบที่ ${i}`
            acc[key] = statusAttendenceToThai(attendance.attStatus)
            i++
            return acc
        }, {});

    
        return {    
            ชื่อจริง: row.fName,
            นามสกุล: row.lName,
            ...attendanceByPeriods, 
        };
    });
    const fileName = `${subjectName}_Attendence.xlsx`
    const worksheet = reader.utils.json_to_sheet(rowsData);
    const workbook = reader.utils.book_new();
    reader.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');
    reader.writeFile(workbook, `../public/${fileName}`, {compression:true});
    return fileName;
};
