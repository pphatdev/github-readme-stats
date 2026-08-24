/**
 * Users Module - Types
 */

export interface UserListItem {
    username: string;
    avatar_url: string;
    request_count: number;
    last_used_at: number | null;
}

export interface UserListResponse {
    total: number;
    limit: number;
    offset: number;
    page: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
    users: UserListItem[];
}

export interface UserListQueryParams {
    limit?: string;
    offset?: string;
    page?: string;
}

export interface UserBadgeResponse {
    username: string;
    avatar_url: string;
    visitors: number;
    repositories: number | null;
    organization: number | null;
    languages: number | null;
    followers: number | null;
    total_stars: number | null;
    total_contributors: number | null;
    total_commits: number | null;
    total_code_reviews: number | null;
    total_issues: number | null;
    total_pull_requests: number | null;
    total_joined_years: number | null;
    updated_at: number | null;
}
