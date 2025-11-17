# Security Documentation

## Overview

This document outlines the security measures implemented in the Pediatric Dentist Website application.

## Security Features Implemented

### 1. Authentication & Session Management

#### Secure Session Cookies
- **HttpOnly**: Prevents JavaScript access (XSS protection)
- **Secure**: HTTPS-only in production
- **SameSite=strict**: Prevents CSRF attacks
- **Path=/admin**: Limits cookie scope to admin routes only
- **7-day expiration**: Auto-logout after 7 days

#### Session Token Security
- Tokens include user ID, timestamp, and random bytes
- Base64 encoded for safe transport
- Validated on every admin request
- Automatic session expiration check

#### Password Security
- Bcrypt hashing with 12 rounds (configurable)
- Passwords never stored in plain text
- Password strength validation:
  - Minimum 8 characters
  - Requires uppercase letter
  - Requires lowercase letter
  - Requires number
- Timing attack prevention with artificial delay

### 2. Rate Limiting

#### Login Protection
- **5 attempts per 15 minutes** per IP
- Prevents brute force attacks
- Auto-resets after window expires

#### API Protection
- **100 requests per minute** per IP
- Prevents API abuse
- Configurable per endpoint

#### Upload Protection
- **10 uploads per minute** per IP
- Prevents storage abuse
- Prevents DOS attacks

### 3. Input Validation & Sanitization

#### Implemented Validators
- Email validation (format + sanitization)
- URL validation (protocol whitelisting)
- Slug validation (URL-safe characters)
- Phone number validation
- JSON parsing safety
- Filename sanitization (prevents directory traversal)

#### HTML Sanitization
- DOMPurify integration
- Allowed tags whitelist
- Allowed attributes whitelist
- Prevents XSS attacks

### 4. File Upload Security

#### Multi-Layer Validation
1. **MIME type check**: Only allowed image types
2. **File size check**: Maximum 10MB
3. **Magic bytes verification**: Actual file content validation
4. **Filename sanitization**: Prevents path traversal
5. **Image optimization**: Via Sharp library
6. **Authentication required**: Must be logged in
7. **Rate limiting**: Limited uploads per time window

#### Allowed File Types
- JPEG/JPG
- PNG
- GIF
- WebP

### 5. Security Headers

#### Implemented Headers
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

#### Content Security Policy (CSP)
```
default-src 'self'
script-src 'self' 'unsafe-inline' 'unsafe-eval'
style-src 'self' 'unsafe-inline'
img-src 'self' data: https:
font-src 'self' data:
connect-src 'self'
frame-ancestors 'none'
```

### 6. CSRF Protection

#### Token-Based Protection
- CSRF tokens generated server-side
- SHA-256 hashing with secret
- Verification on state-changing requests
- Tokens tied to user session

### 7. SQL Injection Protection

#### Prisma ORM Protection
- Parameterized queries
- Type-safe database operations
- No raw SQL execution
- Input sanitization before database operations

### 8. XSS Protection

#### Defense Layers
1. Content Security Policy headers
2. HTML sanitization with DOMPurify
3. React automatic escaping
4. Input validation and sanitization
5. X-XSS-Protection header

### 9. HTTPS & HSTS

#### Production Requirements
- HTTPS enforced via HSTS header
- Strict Transport Security
- 1-year max age
- Include subdomains
- Preload ready

## Security Best Practices

### For Administrators

1. **Strong Passwords**
   - Use unique passwords
   - Minimum 8 characters
   - Include uppercase, lowercase, and numbers
   - Change regularly

2. **Session Management**
   - Always logout when finished
   - Don't share admin credentials
   - Use private/incognito mode on shared computers

3. **File Uploads**
   - Only upload trusted images
   - Verify image source
   - Keep file sizes reasonable

### For Developers

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong random secrets
   - Rotate secrets regularly
   - Copy from `.env.security.example`

2. **Code Security**
   - Always validate user input
   - Sanitize before database operations
   - Use prepared statements (Prisma handles this)
   - Never trust client-side data

3. **API Endpoints**
   - Always check authentication
   - Validate all inputs
   - Use rate limiting
   - Return generic error messages

4. **Dependencies**
   - Keep dependencies updated
   - Run `npm audit` regularly
   - Review security advisories
   - Use `npm audit fix` cautiously

## Configuration

### Environment Variables

Copy `.env.security.example` to `.env.local` and configure:

```bash
cp .env.security.example .env.local
```

Required variables:
- `CSRF_SECRET`: Random string for CSRF tokens
- `SESSION_SECRET`: Random string for session encryption
- `NODE_ENV`: Set to `production` in production
- `DATABASE_URL`: Secure database connection string

### Bcrypt Rounds

Adjust in `src/lib/security.ts`:
```typescript
BCRYPT_ROUNDS: 12 // Higher = more secure but slower
```

### Rate Limits

Adjust in `src/lib/rateLimit.ts`:
```typescript
export const loginRateLimit = rateLimit({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000
})
```

## Monitoring & Logging

### What to Monitor

1. **Failed Login Attempts**
   - Multiple failures from same IP
   - Unusual login patterns
   - Rate limit triggers

2. **File Uploads**
   - Rejected uploads (wrong type/size)
   - Upload frequency per user
   - Storage usage

3. **API Usage**
   - Rate limit hits
   - Unusual traffic patterns
   - Error rates

### Log Files

Check logs for:
- Authentication failures
- Rate limit triggers
- File upload rejections
- Database errors
- Validation failures

## Incident Response

### If Suspicious Activity Detected

1. **Immediate Actions**
   - Check logs for source IP
   - Review recent user activity
   - Check for unauthorized access
   - Verify data integrity

2. **Containment**
   - Revoke suspicious sessions
   - Block attacking IPs (if identified)
   - Temporarily increase rate limits
   - Enable additional logging

3. **Recovery**
   - Change admin passwords
   - Rotate session secrets
   - Review and update code
   - Apply security patches

4. **Prevention**
   - Update security measures
   - Review access logs
   - Improve monitoring
   - Document incident

## Security Checklist

### Deployment Checklist

- [ ] All environment variables set
- [ ] HTTPS configured and working
- [ ] Database secured (not publicly accessible)
- [ ] Default admin password changed
- [ ] File upload directory permissions set correctly
- [ ] Logs configured and monitored
- [ ] Backup system in place
- [ ] Security headers verified
- [ ] Rate limiting tested
- [ ] Dependencies updated
- [ ] npm audit passed

### Regular Maintenance

- [ ] Weekly: Review access logs
- [ ] Monthly: Update dependencies
- [ ] Monthly: Audit user accounts
- [ ] Quarterly: Rotate secrets
- [ ] Quarterly: Security audit
- [ ] Annually: Penetration testing

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public issue
2. Email security concerns to: security@pediatricdentistinqueensny.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Prisma Security](https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization-performance)
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)

## Version History

- **v1.0** (2024): Initial security implementation
  - Authentication system
  - Rate limiting
  - Input validation
  - File upload security
  - Security headers
  - Session management
