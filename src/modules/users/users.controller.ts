/**
 * Users Controller
 * Handles HTTP requests for the users listing endpoint.
 */

import type { Request, Response } from 'express';
import { UsersService } from './users.service.js';
import { createLogger } from '../../shared/logs/logger.js';
import type { UserListQueryParams } from './users.types.js';

const logger = createLogger({ controller: 'UsersController' });

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

export class UsersController {
    private usersService: UsersService;

    constructor(usersService: UsersService) {
        this.usersService = usersService;
    }

    async listUsers(req: Request, res: Response): Promise<void> {
        try {
            const query = req.query as UserListQueryParams;

            const parsedLimit = Number.parseInt(query.limit ?? '', 10);
            const parsedOffset = Number.parseInt(query.offset ?? '', 10);

            const limit = Number.isFinite(parsedLimit) && parsedLimit > 0
                ? Math.min(parsedLimit, MAX_LIMIT)
                : DEFAULT_LIMIT;
            const offset = Number.isFinite(parsedOffset) && parsedOffset >= 0
                ? parsedOffset
                : 0;

            const result = await this.usersService.listUsers(limit, offset);

            res.setHeader('Cache-Control', 'public, max-age=60');
            res.json(result);
        } catch (error) {
            logger.error('Failed to list users', error as Error);
            res.status(500).json({ error: 'Failed to list users' });
        }
    }
}
