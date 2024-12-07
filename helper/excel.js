// เรียกใช้ Module

import reader from 'xlsx';



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

// function insertExcel(fileName, obejectInfo){ //ObejectInfo คือ ข้อมูลที่ user insert เพื่อเพิ่มลงไฟล์ excel ไฟล์เดิม 
    
//     // const data = readExcel(fileName)
//     // if(Object.keys(obejectInfo[0]).length != Object.keys(obejectInfo[0]).length){
//     //     return 0;
//     // }

//     // const dataKeys = Object.keys(data[0])
//     // const objectInfoDataKeys = Object.keys(obejectInfo[0])

//     // let i = 0; // loop count for indexFor Array
//     // dataKeys.forEach((keys) => {
//     //     if(keys != objectInfoDataKeys[i]){ // ถ้าเกิด coloum ไม่ตรงให้ หยุดการทำงาน
//     //         return 0; 
//     //     }
//     //     // }else{
//     //     //     console.log(`${keys} ตรง`)
//     //     // }
//     //     i++
//     // })

//     const file = reader.readFile(`./helper/${fileName}`); // อ่านไฟล์ excel
//     const workSheet = file.Sheets[file.SheetNames[0]] // file.Sheets['ชีต1'] การเข้าถึง ชีตไฟล์โดยใช้ชื่อ
//     let dataSheet = reader.utils.sheet_to_json(workSheet) // แปลง sheet เป็น json
//     obejectInfo.forEach((rows) => {
//         dataSheet.push(rows)
//     })

//     const updatedSheet =  reader.utils.json_to_sheet(dataSheet);
    
//     file.Sheets[file.SheetNames[0]] = updatedSheet

//     reader.writeFile(file,`./helper/${fileName}` , {compression:true});


//     // console.log(Object.keys(data[0])) // get key object เอาไว้เช็ค ex. [ 'fName', 'lName', 'email', 'tel', 'cityzenId' ]
// }

//export
function createExcel(objectInfo) {
    const worksheet = reader.utils.json_to_sheet(objectInfo);
    const workbook = reader.utils.book_new();
    reader.utils.book_append_sheet(workbook, worksheet, 'Sheet 1')
    reader.writeFile(workbook, `./helper/test.xlsx`, {compression:true});
}


// createExcel();


// ex. data set
let student_data = [
    { // ข้อมูลที่มีการแก้ไข
        fName: 'ควย',
        lName: 'กูดำ',
        email: 'kuygudum@gmail.com',
        tel: 99999999,
        cityzenId: 1479900578276
    },
    {
        fName: 'พีรพล',
        lName: 'เล่าสุอังกูร',
        email: 'peeraphol.l@kkumail.com',
        tel: 855555555 ,
        cityzenId: 1479900578214
    }
]

createExcel(student_data)
// insertExcel("studentTestWrite.xlsx",student_data)
// readExcel("student_list(test).xlsx")

