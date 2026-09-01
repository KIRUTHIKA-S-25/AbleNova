export interface ApiError {
  code:
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'VALIDATION_ERROR'
    | 'AI_UNAVAILABLE'
    | 'CONTENT_PROCESSING_ERROR'
    | 'SYNC_ERROR'
    | 'SERVER_ERROR';
  message: string;
}

export interface ApiResponseError {
  error: ApiError;
}

export interface AuthTokens {
  access_token: string;
  token_type: 'bearer';
}
