import db from '../prisma/client.js';

export async function getAllLeaveRequestsByStudentId(req, res) {
    try {
        const leaveRequests = await db.leaveRequest.findMany({
            where: {
                stdId: req.user.id,
            },
            include: {
                leaveRequestType: true,
            }
        });
        return res.json(leaveRequests);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}