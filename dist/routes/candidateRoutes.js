"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Candidate_1 = __importDefault(require("../models/Candidate"));
const router = (0, express_1.Router)();
// GET all candidates with pagination
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [candidates, total] = await Promise.all([
            Candidate_1.default.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Candidate_1.default.countDocuments()
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
    }
    catch (error) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({ message: "Server Error" });
    }
});
exports.default = router;
//# sourceMappingURL=candidateRoutes.js.map