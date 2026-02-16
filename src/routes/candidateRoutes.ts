import { Router, Request, Response } from "express";
import Candidate from "../models/Candidate";

const router = Router();

// GET all candidates with pagination
router.get("/", async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [candidates, total] = await Promise.all([
            Candidate.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Candidate.countDocuments()
        ]);

        res.json({
            data: candidates,
            pagination: {
                total,
                page,
                totalPages: Math.ceil(total / limit),
                limit
            }
        });
    } catch (error) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({ message: "Server Error" });
    }
});

export default router;
