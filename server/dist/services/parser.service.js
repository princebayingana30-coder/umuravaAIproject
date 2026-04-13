"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePdfBufferToText = void 0;
exports.normalizeApplicantRecord = normalizeApplicantRecord;
exports.parseCsvBufferToApplicants = parseCsvBufferToApplicants;
exports.parseXlsxBufferToApplicants = parseXlsxBufferToApplicants;
exports.parseJsonBufferToApplicants = parseJsonBufferToApplicants;
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const sync_1 = require("csv-parse/sync");
const xlsx = __importStar(require("xlsx"));
const parsePdfBufferToText = async (buffer) => {
    try {
        const data = await (0, pdf_parse_1.default)(buffer);
        return data.text;
    }
    catch (error) {
        console.error('PDF parsing error:', error);
        throw new Error('Failed to parse PDF resume');
    }
};
exports.parsePdfBufferToText = parsePdfBufferToText;
function getString(value) {
    if (value == null)
        return '';
    if (typeof value === 'string')
        return value.trim();
    return String(value).trim();
}
function normalizeApplicantRecord(record) {
    const name = getString(record.name || record.fullName || record.candidate || record['Candidate Name']);
    const email = getString(record.email || record.mail || record['Email']);
    const resumeText = getString(record.resumeText ||
        record.resume ||
        record.cv ||
        record.summary ||
        record.text ||
        record['Resume Text']);
    return {
        name: name || 'Unknown Candidate',
        email: email || 'unknown@example.com',
        resumeText,
        resumeUrl: getString(record.resumeUrl || record.url || record.link) || undefined,
    };
}
function parseCsvBufferToApplicants(buffer) {
    const content = buffer.toString('utf-8');
    const records = (0, sync_1.parse)(content, { columns: true, skip_empty_lines: true, relax_column_count: true });
    return records.map((r) => ({ ...normalizeApplicantRecord(r), source: 'csv' }));
}
function parseXlsxBufferToApplicants(buffer) {
    const wb = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(ws, { defval: '' });
    return rows.map((r) => ({ ...normalizeApplicantRecord(r), source: 'xlsx' }));
}
function parseJsonBufferToApplicants(buffer) {
    const raw = buffer.toString('utf-8');
    const parsed = JSON.parse(raw);
    const arr = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.applicants) ? parsed.applicants : [parsed];
    return arr.map((r) => ({ ...normalizeApplicantRecord(r), source: 'json' }));
}
