import db from '../prisma/client.js';

export const createStudent = async (req, res) => { // สร้างรายชื่อนักเรียนรายบุคคล
    let body = req.body;
    if (body.cityzenId === "") body.cityzenId = null;
    if(body){
        try{
            const student = await db.student.create({
                data:{
                    stdId:body.stdId,
                    title:body.title,
                    fName:body.fName,
                    lName:body.lName,
                    email:body.email,
                    tel:body.tel,
                    cityzenId:body.cityzenId,
                }
            });
            res.json({message: `สร้าง ${student.fName} ${student.lName} แล้ว`});
        }catch(err){
            console.error(err);
        }
    };
};

export const createStudentWithFile = async (req, res) => {
    let body = req.body;
    console.log(body.sheets);
    if (!body?.sheets) {
        return res.status(400).json({ message: "ไม่พบข้อมูลนักเรียน" });
    }

    // เช็คว่ามี item.studentId && item.class && item.room && item.no && item.title && item.firstName && item.lastName หรือไม่
    const checkempty = Object.values(body.sheets).flat().filter(item => !item.studentId || !item.class || !item.room || !item.no || !item.title || !item.firstName || !item.lastName);

    try {
        // Flatten the sheets object values into a single array

        if (checkempty.length > 0) {
            return res.status(400).json({ message: "ข้อมูลนักเรียนไม่ครบถ้วน" });
        }
        const allStudents = Object.values(body.sheets).flat();

        const student = await db.student.createMany({
            data: allStudents
            .filter(item => item.studentId && item.studentId.toString().trim() !== '')
            .map((item) => ({
                stdId: item.studentId.toString(),
                title: item.title === "เด็กชาย" ? "BOY" : 
                       item.title === "เด็กหญิง" ? "GIRL" : 
                       item.title === "นาย" ? "MR" : "MS",
                fName: item.firstName,
                lName: item.lastName,
                email: item.email || null,
                tel: item.tel || null,
                cityzenId: item.cityzenId || null,
            })),
            skipDuplicates: true
        });

        // Get current academic year
        const currentYear = new Date().getFullYear(); // Convert to Buddhist Era

        const classrooms = await db.classrooms.findMany();
        const classroomMap = new Map();
        classrooms.forEach(classroom => {
            const key = `${classroom.classLevel}-${classroom.classRoom}`;
            classroomMap.set(key, classroom.classId);
        });

        // Create missing classrooms
        for (const student of allStudents) {
            if (!student.class || !student.room) continue;
            
            const key = `${parseInt(student.class)}-${parseInt(student.room)}`;
            if (!classroomMap.has(key)) {
                // Get classType for Unspecified
                const defaultClassType = await db.classroomType.findFirst({
                    where: {
                        OR: [
                            { classTypeNameEng: "Unspecified" },
                            { classTypeNameThai: "ไม่ระบุ" }
                        ]
                    }
                });

                let term = await db.academicTerms.findFirst({
                    where: {
                        academicYear: currentYear,
                        semester: 1
                    }
                });

                if (!term) {
                    term = await db.academicTerms.create({
                        data: {
                            academicYear: currentYear,
                            semester: 1,
                            termStart: new Date(currentYear, 5, 16),
                            termEnd: new Date(currentYear, 9, 30)
                        }
                    });
                }
                
                const newClassroom = await db.classrooms.create({
                    data: {
                        classLevel: parseInt(student.class),
                        classRoom: parseInt(student.room),
                        term: { connect: { termId: term.termId } },
                        classroomType: { connect: { classTypeId: defaultClassType.classTypeId } }
                    }
                });
                classroomMap.set(key, newClassroom.classId);
            }
        }

        const classroomMembers = allStudents
            .filter(item => item.studentId && item.studentId.toString().trim() !== '')
            .map(item => {
                const key = `${parseInt(item.class)}-${parseInt(item.room)}`;
                const classId = classroomMap.get(key);

                if (!classId) return null; // ถ้าห้องเรียนไม่พบใน Map ให้ข้าม

                return {
                    stdId: item.studentId.toString(),
                    classId: classId,
                    stdNo: item.no.toString(),
                };
            })
            .filter(item => item !== null); // กรองข้อมูลที่ไม่มี classId

        await db.classroomMember.createMany({
            data: classroomMembers,
            skipDuplicates: true,
        });
        

        res.json({ message: `สร้าง ${allStudents.length} รายชื่อนักเรียนแล้ว` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้างรายชื่อนักเรียน", error: err.message });
    }
};

export const getAllStudent = async (req, res) => { // ดึงรายชื่อนักเรียนทั้งหมด
    let classr = req.query.class;
    if(req.query.class && req.query.class !== "all"){
        classr = classr.split("-");
        try{
            const classroom = await db.classrooms.findFirst({
                where:{
                    classLevel:parseInt(classr[0]),
                    classRoom:parseInt(classr[1])
                }
            });
            const student = await db.classroomMember.findMany({
                where:{
                    classId: classroom.classId
                },
                select:{
                    student:true
                }
            });
            const studentArray = student.map((item) => item.student);
            return res.json(studentArray);
        }catch(error){
            console.error(error);
        };
    };
    try{
        const student = await db.student.findMany({
        });
        // console.log(student);
        return res.json(student)
    }catch(error){
        console.error(error);
    };
};

export const getStudent = async (req, res) => {
    const uuid = req.params.uuid;
    if(uuid){
        try{
            const student = await db.student.findFirstOrThrow({
                where:{
                    stdId:uuid
                },
                include:{
                    classroomMembers:{
                        include:{
                            classroom:true
                        }
                    },
                    parent:true
                }
            });
            // console.log(student);
           res.json(student);
        }
        catch(err){
            console.error(err);
        };
    };
};

export const deleteStudent = async (req, res) => {
    const uuid = req.params.uuid;
    if(uuid){
        try{
            await db.student.delete({
                where:{
                    stdId:uuid
                }
            });
        }catch(err){
            console.error(err)
        };
    };
};

export const updateStudent = async(req, res) => {
    const body = req.body;
    if(body);{
        try{
            const student = await db.student.update({
                where:{
                    stdId: String(body.stdId)
                },
                data:{
                    title:body.title,
                    fName:body.fName,
                    lName:body.lName,
                    email:body.email,
                    tel:body.tel,
                    cityzenId:body.cityzenId,
                }
            });
            res.json(student);
        }catch(error){
            console.error(error);
        };
    };
};
export const getStudentwithoutClassroom = async (req, res) => {
    try {
        const students = await db.student.findMany({
            where: {
                classroomMembers: {
                    none: {}
                }
            },
            select: {
                stdId: true,
                title: true,
                fName: true,
                lName: true,
                email: true,
                tel: true,
                cityzenId: true
            },
            orderBy: {
                stdId: 'asc'
            }
        });

        res.status(200).json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลนักเรียน", error: error.message });
    }
};