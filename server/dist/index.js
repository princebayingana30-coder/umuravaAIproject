"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = __importDefault(require("./routes/auth"));
const jobs_1 = __importDefault(require("./routes/jobs"));
const applicants_1 = __importDefault(require("./routes/applicants"));
const screening_1 = __importDefault(require("./routes/screening"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
    credentials: true,
}));
app.use(express_1.default.json());
// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});
// Routes
app.use('/api/auth', auth_1.default);
// Public mode (no login required)
app.use('/api/jobs', jobs_1.default);
app.use('/api/applicants', applicants_1.default);
app.use('/api/screening', screening_1.default);
// Basic health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'TalentIQ API is running at root' });
});
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'TalentIQ API is running' });
});
// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/talentiq';
mongoose_1.default.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
exports.default = app;
