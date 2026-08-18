/**
 * Users Routes
 * Defines HTTP routes for the users listing endpoint.
 */

import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

export function createUsersRouter(): Router {
    const router = Router();

    const usersService = new UsersService();
    const usersController = new UsersController(usersService);

    /**
     * @route GET /users
     * @desc List all usernames tracked by the stats service with GitHub avatar URLs
     */
    router.get('/', async (req, res) => {
        await usersController.listUsers(req, res);
    });

    return router;
}
