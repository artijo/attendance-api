import vine from '@vinejs/vine'

export async function inputStudentForm(data) {
    const schema = vine.object({
        stdId: vine.string(),
        title: vine.string(),
        fName: vine.string(),
        lName: vine.string(),
        email: vine.string().email().nullable(),
        tel: vine.string().nullable(),
    });
    return await vine.validate({ schema, data });
}

export const handdleErrorDuplicateKeyStudent = (req, res, err) => {
    if(err.code === 'P2002'){
        switch(err.meta.target){
            case 'PRIMARY': return res.status(400).json({stdId: "duplicate"});
            case 'Student_email_key': return res.status(400).json({email: "duplicate"});
            case 'Student_tel_key': return res.status(400).json({tel: "duplicate"});
            default: return res.status(500).json({message: "เกิดข้อผิดพลาดในการสร้างรายชื่อนักเรียน"});
        }
    }
    return res.status(500).json({message: "เกิดข้อผิดพลาดในการสร้างรายชื่อนักเรียน"});
}
