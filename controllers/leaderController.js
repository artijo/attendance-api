import db from '../prisma/client.js';

export function getAllLeaders(req, res) {
    try {
        db.leader.findMany(
            {
                 include: {
                    classroom: true,
                 }
            }
        ).then((result) => {
            res.json(result);
        });
    } catch (error) {
        console.error(error);
    }
}