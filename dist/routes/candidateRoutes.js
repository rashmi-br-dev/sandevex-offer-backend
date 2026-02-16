"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Candidate_1 = __importDefault(require("../models/Candidate"));
const router = (0, express_1.Router)();
// GET all candidates
router.get("/", async (_req, res) => {
    try {
        const candidates = await Candidate_1.default.find().sort({ createdAt: -1 });
        res.json(candidates);
    }
    catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});
exports.default = router;
//# sourceMappingURL=candidateRoutes.js.map