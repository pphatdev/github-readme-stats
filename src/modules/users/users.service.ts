/**
 * Users Service
 * Aggregates distinct usernames tracked by the stats_requests table
 * and enriches them with GitHub avatar URLs.
 */

import { desc, eq, sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { badges, statsRequests } from '../../db/schema.js';
import type { UserBadgeResponse, UserListItem, UserListResponse } from './users.types.js';

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

        const total = Number(totalRow[0]?.total ?? 0);
        const page = Math.floor(offset / limit) + 1;
        const total_pages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;
        const has_next = offset + users.length < total;
        const has_prev = offset > 0;

        return {
            total,
            limit,
            offset,
            page,
            total_pages,
            has_next,
            has_prev,
            users,
        };
    }

    async getUserBadge(username: string): Promise<UserBadgeResponse | null> {
        const rows = await db
            .select()
            .from(badges)
            .where(eq(badges.username, username))
            .limit(1);

        const row = rows[0];
        if (!row) {
            return null;
        }

        return {
            username: row.username,
            avatar_url: `https://github.com/${row.username}.png`,
            visitors: row.visitors ?? 0,
            repositories: row.repositories ?? null,
            organization: row.organization ?? null,
            languages: row.languages ?? null,
            followers: row.followers ?? null,
            total_stars: row.total_stars ?? null,
            total_contributors: row.total_contributors ?? null,
            total_commits: row.total_commits ?? null,
            total_code_reviews: row.total_code_reviews ?? null,
            total_issues: row.total_issues ?? null,
            total_pull_requests: row.total_pull_requests ?? null,
            total_joined_years: row.total_joined_years ?? null,
            updated_at: row.updated_at ?? null,
        };
    }
}
