/**
 * JWT Token Utility Functions
 * Helper functions for working with JWT tokens
 */

export interface DecodedToken {
  exp?: number;
  iat?: number;
  user_id?: number;
  token_type?: string;
  jti?: string;
  [key: string]: any;
}

/**
 * Decode a JWT token without verification
 * @param token - JWT token string
 * @returns Decoded token payload or null if invalid
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Check if a token is expired
 * @param token - JWT token string
 * @returns true if token is expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true; // Consider invalid tokens as expired
  }
  
  const now = Math.floor(Date.now() / 1000);
  return decoded.exp < now;
}

/**
 * Get time until token expiration in seconds
 * @param token - JWT token string
 * @returns Number of seconds until expiration, or 0 if expired/invalid
 */
export function getTokenExpirationTime(token: string): number {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return 0;
  }
  
  const now = Math.floor(Date.now() / 1000);
  const timeRemaining = decoded.exp - now;
  return Math.max(0, timeRemaining);
}

/**
 * Check if token will expire soon (within specified seconds)
 * @param token - JWT token string
 * @param thresholdSeconds - Seconds before expiration to consider "soon" (default: 300 = 5 minutes)
 * @returns true if token expires within threshold
 */
export function isTokenExpiringSoon(token: string, thresholdSeconds: number = 300): boolean {
  const timeRemaining = getTokenExpirationTime(token);
  return timeRemaining > 0 && timeRemaining < thresholdSeconds;
}

/**
 * Get human-readable time until token expiration
 * @param token - JWT token string
 * @returns Formatted string like "2 days, 3 hours" or "Expired"
 */
export function getTokenExpirationReadable(token: string): string {
  const timeRemaining = getTokenExpirationTime(token);
  
  if (timeRemaining === 0) {
    return 'Expired';
  }
  
  const days = Math.floor(timeRemaining / 86400);
  const hours = Math.floor((timeRemaining % 86400) / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;
  
  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0 && days === 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  if (seconds > 0 && days === 0 && hours === 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
  
  return parts.length > 0 ? parts.join(', ') : 'Expired';
}

/**
 * Get token information for debugging
 * @param token - JWT token string
 * @returns Object with token information
 */
export function getTokenInfo(token: string) {
  const decoded = decodeToken(token);
  
  if (!decoded) {
    return {
      valid: false,
      error: 'Invalid token format',
    };
  }
  
  const now = Math.floor(Date.now() / 1000);
  const exp = decoded.exp || 0;
  const iat = decoded.iat || 0;
  const timeRemaining = exp > now ? exp - now : 0;
  const isExpired = exp < now;
  
  return {
    valid: true,
    isExpired,
    exp,
    expDate: exp ? new Date(exp * 1000).toISOString() : null,
    iat,
    iatDate: iat ? new Date(iat * 1000).toISOString() : null,
    timeRemaining,
    timeRemainingReadable: getTokenExpirationReadable(token),
    user_id: decoded.user_id,
    token_type: decoded.token_type,
    jti: decoded.jti,
  };
}
