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
    users: UserListItem[];
}

export interface UserListQueryParams {
    limit?: string;
    offset?: string;
}
