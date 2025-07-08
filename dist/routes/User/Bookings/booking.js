"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Club_1 = require("../../../controllers/Partner/Club/Club");
const router = express_1.default.Router();
// booking club
router.post("/booking", Club_1.bookingClub);
exports.default = router;
