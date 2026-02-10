# 🛡️ BidStream Security Guidelines

## Critical Security Rules

### 🚨 Rule #1: Never Commit Secrets
**NEVER** commit sensitive data to Git:
- Database passwords
- JWT secrets
- API keys (Gemini, Razorpay, OAuth)
- Email credentials
- Session tokens

### ✅ Rule #2: Use Environment Variables
All secrets **MUST** be loaded from environment variables:

```bash
# Load from .env.local (NOT committed to Git)
export $(cat .env.local | xargs)

# OR set individually
export DB_PASSWORD="your_password"
export JWT_SECRET="your_secret"
```

### 🔍 Rule #3: Pre-Commit Scanning
Before pushing to GitHub, run:
```bash
# Check for accidentally committed secrets
git diff --cached | grep -iE "(password|secret|key|token)" 

# Install git-secrets for automatic scanning
brew install git-secrets
git secrets --install
git secrets --scan
```

---

## GitHub Repository Security

### Enabled Features
1. **Secret Scanning**: GitHub automatically scans for leaked API keys
2. **Push Protection**: Blocks commits containing high-confidence secrets
3. **Dependency Scanning**: Alerts for vulnerable dependencies

### How to Enable (Repository Owner)
1. Go to `Settings` → `Code security and analysis`
2. Enable:
   - ✅ **Dependency graph**
   - ✅ **Dependabot alerts**
   - ✅ **Secret scanning**
   - ✅ **Push protection**

---

## Application Security Architecture

### JWT Authentication
- **Access Token Expiry**: 15 minutes
- **Refresh Token Expiry**: 7 days
- **Storage**: `localStorage` (frontend), Redis (backend session tracking)
- **Validation**: Every API request validates JWT + checks active session in Redis

### Single-Session Policy
- Only **one active session per user** allowed
- Logging in on a second device invalidates the first session
- Prevents:
  - Multi-device role abuse (Seller + Bidder simultaneously)
  - Session hijacking across devices

### Self-Bidding Prevention
- **Frontend**: Pre-filters seller's own lots from Bidder Floor
- **Backend**: API validates `bidder_id != seller_id` before accepting bids
- **Error**: Returns `403 Forbidden` if attempted

### WebSocket Security
- **Handshake**: Requires valid JWT in `Authorization` header
- **Topic Subscriptions**: Validates user permissions before allowing subscription to `/topic/auction/{lotId}`
- **Message Validation**: All incoming WebSocket messages validated against active session

---

## Data Privacy

### PII Handling
- **Email addresses**: Hashed in logs
- **Payment info**: Never stored (Razorpay handles processing)
- **Bidder anonymity**: Usernames displayed as "B***r" in public bid history
- **Viewer counts**: Aggregated, not user-specific (GDPR compliant)

### GDPR Compliance Checklist
- [ ] Data export functionality (Phase 3)
- [ ] Right to be forgotten / account deletion (Phase 3)
- [ ] Consent tracking for analytics (Phase 3)
- [ ] Cookie policy (Phase 3)

---

## Incident Response

### If a Secret is Leaked in Git

#### 1. **Immediately Rotate the Secret**
   - Change database password
   - Generate new JWT secret
   - Revoke compromised API keys

#### 2. **Remove from Git History**
   ```bash
   # Install BFG Repo-Cleaner
   brew install bfg
   
   # Remove passwords from history
   bfg --replace-text passwords.txt  # Create file with secrets to remove
   
   # Force-push (CAUTION: Rewrites history)
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push --force
   ```

#### 3. **Notify Team**
   - Document the incident
   - Update all team members to pull latest changes
   - Verify no unauthorized access occurred

---

## Production Deployment Checklist

Before deploying to production:

- [ ] All secrets loaded from environment variables (not hardcoded)
- [ ] `.env.local` and `application.yml` with real secrets **NOT** in Git
- [ ] HTTPS enabled (TLS 1.3+)
- [ ] CORS configured to allow only production frontend domain
- [ ] Rate limiting enabled on API Gateway
- [ ] Database backups automated
- [ ] Redis persistence enabled (AOF + RDB)
- [ ] Logging configured (exclude PII)
- [ ] Security headers enabled:
  ```
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Strict-Transport-Security: max-age=31536000
  Content-Security-Policy: default-src 'self'
  ```

---

## Contact for Security Issues

If you discover a security vulnerability, **DO NOT** open a public GitHub issue.

Email: [Your security contact email]

We follow responsible disclosure practices and will respond within 48 hours.
