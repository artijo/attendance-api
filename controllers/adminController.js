import db from '../prisma/client.js';


export const featchDataForSeachbar  = async (req, res) => {
    try{
        const student = await db.student.findMany({
            select:{
                fName:true,
                lName:true
            }
        });
    
        const newStudent = student.reduce((newArray, currentValue) => {
            // console.log(currentValue);
            const newObject = {
                name: `${currentValue.fName} ${currentValue.lName}`,
                role: "Student"
            }
            newArray.push(newObject) ;
            return newArray
        }, [])

        const teacher = await db.teacher.findMany({
            select:{
                fName:true,
                lName:true
            }
        });

        const newTeacher = teacher.reduce((newArray, currentValue) => {
            // console.log(currentValue);
            const newObject = {
                name: `${currentValue.fName} ${currentValue.lName}`,
                role: "Teacher"
            }
            newArray.push(newObject) ;
            return newArray
        }, [])

        const leader = await db.leader.findMany({
            select:{
                fName:true,
                lName:true
            }
        });

        const newLeader = leader.reduce((newArray, currentValue) => {
            // console.log(currentValue);
            const newObject = {
                name: `${currentValue.fName} ${currentValue.lName}`,
                role: "Leader"
            }
            newArray.push(newObject) ;
            return newArray
        }, [])

        res.json([...newStudent, ...newTeacher, ...newLeader]);
    }catch(err){
        console.error(err);
    };
};