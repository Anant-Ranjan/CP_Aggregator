"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrSetCache = getOrSetCache;
const redisClient_1 = __importDefault(require("../config/redisClient"));
async function getOrSetCache(key, ttlSeconds, fetcher) {
    try {
        const cached = await redisClient_1.default.get(key);
        if (cached) {
            return JSON.parse(cached);
        }
    }
    catch (err) {
        console.warn(`Redis get failed for key ${key}:`, err.message);
    }
    const fresh = await fetcher();
    try {
        await redisClient_1.default.set(key, JSON.stringify(fresh), 'EX', ttlSeconds);
    }
    catch (err) {
        console.warn(`Redis set failed for key ${key}:`, err.message);
    }
    return fresh;
}
