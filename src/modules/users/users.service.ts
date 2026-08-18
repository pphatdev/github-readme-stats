/**
 * Users Service
 * Aggregates distinct usernames tracked by the stats_requests table
 * and enriches them with GitHub avatar URLs.
 */

import { desc, sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { statsRequests } from '../../db/schema.js';
import type { UserListItem, UserListResponse } from './users.types.js';

export class UsersService {
    async listUsers(limit: number, offset: number): Promise<UserListResponse> {
        const countColumn = sql<number>`count(*)`.as('request_count');
        const lastUsedColumn = sql<number | null>`max(${statsRequests.created_at})`.as('last_used_at');

        const rows = await db
            .select({
                username: statsRequests.username,
                request_count: countColumn,
                last_used_at: lastUsedColumn,
            })
            .from(statsRequests)
            .groupBy(statsRequests.username)
            .orderBy(desc(countColumn))
            .limit(limit)
            .offset(offset);

        const totalRow = await db
            .select({ total: sql<number>`count(distinct ${statsRequests.username})` })
            .from(statsRequests);

        const users: UserListItem[] = rows.map((row) => ({
            username: row.username,
            avatar_url: `https://github.com/${row.username}.png`,
            request_count: Number(row.request_count ?? 0),
            last_used_at: row.last_used_at ?? null,
        }));

        return {
            total: Number(totalRow[0]?.total ?? 0),
            limit,
            offset,
            users,
        };
    }
}
