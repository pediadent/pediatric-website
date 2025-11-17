# Security Setup Guide

## Quick Start

### 1. Install Required Dependencies

```bash
npm install isomorphic-dompurify
```

### 2. Create Environment File

```bash
cp .env.security.example .env.local
```

Edit `.env.local` and set:
```env
CSRF_SECRET=your-random-secret-here-minimum-32-characters
SESSION_SECRET=another-random-secret-minimum-32-characters
NODE_ENV=production
ENABLE_RATE_LIMITING=true
```

### 3. Generate Secure Secrets

Use these commands to generate secure random strings:

**On Linux/Mac:**
```bash
openssl rand -hex 32
```

**On Windows (PowerShell):**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Update Default Admin Password

After first deployment, immediately:

1. Login with default credentials (seoshouts@gmail.com / admin123)
2. Go to Users section
3. Click Edit on the admin user
4. Change the password to a strong password
5. Save changes

### 5. Configure Google reCAPTCHA (Clinic Submissions)

Set the following environment variables so the clinic submission form can verify real visitors:

```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
```

Generate keys at https://www.google.com/recaptcha/admin/create (recommended: v2 Checkbox or v3).

## Security Features Enabled

### ✅ Authentication
- Secure session cookies (HttpOnly, Secure, SameSite)
- Bcrypt password hashing (12 rounds)
- Session expiration (7 days)
- Timing attack prevention

### ✅ Rate Limiting
- Login: 5 attempts per 15 minutes
- API: 100 requests per minute
- Uploads: 10 per minute

### ✅ Input Validation
- Email validation
- URL validation
- Slug sanitization
- HTML sanitization (DOMPurify)
- File type validation

### ✅ File Upload Protection
- MIME type checking
- Magic bytes verification
- File size limits (10MB)
- Filename sanitization
- Authentication required

### ✅ Security Headers
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Content-Security-Policy
- HSTS (production only)
- Referrer-Policy
- Permissions-Policy

### ✅ SQL Injection Protection
- Prisma ORM with parameterized queries
- Input sanitization
- No raw SQL execution

### ✅ XSS Protection
- React automatic escaping
- DOMPurify sanitization
- CSP headers
- Input validation

## Testing Security

### Test Rate Limiting

Try logging in with wrong password 6 times:
```bash
# Should get "Too many requests" error on 6th attempt
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seoshouts@gmail.com","password":"wrong"}'
```

### Test File Upload

Try uploading a non-image file:
```bash
# Should reject with "Invalid file type" error
curl -X POST http://localhost:3000/api/admin/media/upload \
  -F "file=@test.txt" \
  -H "Cookie: admin_session=your-session-token"
```

### Test Session Expiration

Check that admin session expires after 7 days or when cookie is cleared.

### Test Security Headers

Check headers are present:
```bash
curl -I https://yourdomain.com
```

Should see:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Content-Security-Policy: ...
- Strict-Transport-Security: ... (in production)

## Production Checklist

Before deploying to production:

- [ ] Change `NODE_ENV` to `production` in .env
- [ ] Set strong `CSRF_SECRET` and `SESSION_SECRET`
- [ ] Change default admin password
- [ ] Enable HTTPS/SSL certificate
- [ ] Set up database backups
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerting
- [ ] Test all security features
- [ ] Run `npm audit` and fix issues
- [ ] Review and restrict file permissions
- [ ] Enable server-side logging
- [ ] Set up fail2ban or similar (optional)

## Monitoring

### Important Logs to Monitor

1. **Failed Login Attempts**
   ```
   Location: Server console / logs
   Watch for: Multiple failed attempts from same IP
   ```

2. **Rate Limit Hits**
   ```
   Location: API response logs
   Watch for: 429 status codes
   ```

3. **File Upload Rejections**
   ```
   Location: Upload endpoint logs
   Watch for: Validation failures
   ```

### Setting Up Alerts

Consider setting up alerts for:
- More than 10 failed logins in 1 hour
- Any rate limit triggers
- Unusual traffic patterns
- Server errors (500 status codes)
- Database connection failures

## Common Issues & Solutions

### Issue: Rate limit too strict

**Solution:** Adjust in `src/lib/rateLimit.ts`:
```typescript
export const loginRateLimit = rateLimit({
  maxRequests: 10, // Increase from 5
  windowMs: 15 * 60 * 1000
})
```

### Issue: Session expires too quickly

**Solution:** Adjust in `src/lib/security.ts`:
```typescript
SESSION: {
  MAX_AGE: 14 * 24 * 60 * 60 * 1000, // 14 days instead of 7
  // ...
}
```

### Issue: CSP blocking external resources

**Solution:** Update CSP in `src/middleware.ts`:
```typescript
"img-src 'self' data: https: https://trusted-cdn.com;"
```

### Issue: Can't upload certain image types

**Solution:** Add to allowed types in `src/lib/security.ts`:
```typescript
ALLOWED_IMAGE_TYPES: [
  'image/jpeg',
  'image/png',
  'image/svg+xml', // Add SVG if needed
  // ...
]
```

## Maintenance

### Weekly
- Review access logs for suspicious activity
- Check for failed login attempts
- Monitor storage usage

### Monthly
- Update dependencies: `npm update`
- Run security audit: `npm audit`
- Review user accounts for inactive users
- Check for security patches

### Quarterly
- Rotate `CSRF_SECRET` and `SESSION_SECRET`
- Force all admin users to change passwords
- Review and update security policies
- Perform manual security testing

### Annually
- Conduct professional security audit
- Penetration testing
- Review and update this documentation
- Security training for team

## Getting Help

- Read [SECURITY.md](./SECURITY.md) for detailed documentation
- Check issues on GitHub
- Contact security team: security@pediatricdentistinqueensny.com

## Additional Hardening (Optional)

### 1. Add IP Whitelisting

In `.env.local`:
```env
ADMIN_IP_WHITELIST=192.168.1.100,192.168.1.101
```

Then update middleware to check IP against whitelist.

### 2. Add 2FA (Two-Factor Authentication)

Install authenticator library:
```bash
npm install speakeasy qrcode
```

Implement TOTP in login flow.

### 3. Add Honeypot Fields

Add hidden fields in forms to catch bots:
```tsx
<input type="text" name="website" style={{display: 'none'}} />
```

### 4. Add CAPTCHA

For high-value forms (login, contact):
```bash
npm install react-google-recaptcha
```

### 5. Database Encryption

Encrypt sensitive fields in database:
```bash
npm install crypto-js
```

Encrypt before storing, decrypt when retrieving.

## Security Updates

Subscribe to security advisories:
- [npm Security Advisories](https://www.npmjs.com/advisories)
- [Next.js Security](https://github.com/vercel/next.js/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Last Updated:** 2024
**Version:** 1.0
