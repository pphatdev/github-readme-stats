/**
 * Track Request Middleware
 *
 * Logs every incoming card request (stats, languages, graph, badges) to the
 * `stats_requests` table so admins can see who requested what — including
 * programmatic user-agents (python-requests, curl, bots) that previously
 * collapsed into a single row via the old `url` unique index.
 */

import type { Request, Response, NextFunction } from 'express';
import { db } from '../../db/index.js';
import { statsRequests } from '../../db/schema.js';
import { createLogger } from '../logs/logger.js';

const logger = createLogger({ service: 'TrackRequestMiddleware' });

function normalizeEndpoint(req: Request): string {
    const entries = Object.entries(req.query)
        .flatMap(([key, value]) => {
            if (value === undefined || value === null) return [];
            if (Array.isArray(value)) {
                return value.map((item) => [key, String(item)] as [string, string]);
            }
            return [[key, String(value)] as [string, string]];
        })
        .sort(([aKey, aVal], [bKey, bVal]) => {
            const keyCompare = aKey.localeCompare(bKey);
            return keyCompare !== 0 ? keyCompare : aVal.localeCompare(bVal);
        });

    const queryString = new URLSearchParams(entries).toString();
    const pathName = `${req.baseUrl}${req.path}`;
    return queryString ? `${pathName}?${queryString}` : pathName;
}

export function trackRequest(req: Request, _res: Response, next: NextFunction): void {
    const username = typeof req.query.username === 'string' ? req.query.username : null;
    if (!username) {
        next();
        return;
    }

    const url = normalizeEndpoint(req);
    const userAgent = req.get('user-agent') || null;

    // Fire-and-forget: never block the response on the stats write.
    void (async () => {
        try {
            await db.insert(statsRequests).values({
                username,
                url,
                user_agent: userAgent,
                created_at: Date.now(),
            });
        } catch (err) {
            logger.error('Failed to log request', err as Error, { username, url });
        }
    })();

    next();
}
