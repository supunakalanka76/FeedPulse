"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = Number(process.env.PORT) || 5000;
app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});
app.listen(port, () => {
    // Keep startup logging minimal and predictable for local/dev environments.
    console.log(`FeedPulse backend running on port ${port}`);
});
