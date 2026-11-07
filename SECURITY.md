# 🛡️ BidStream Security Policy

BidStream takes the security and integrity of our distributed auction platform very seriously. As an event-driven system handling real-time financial bidding and user authentication, maintaining the confidentiality, availability, and non-repudiation of transactions is paramount.

---

## 📋 Supported Versions

We actively provide security patches and updates for the following versions:

| Version | Supported | Notes |
| :--- | :--- | :--- |
| `0.0.x` (main) | ✅ Yes | Latest active development version |
| `< 0.0.1` | ❌ No | Deprecated legacy prototypes |

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability or suspect an architectural flaw within BidStream, **DO NOT** create a public issue, discussion, or pull request.

Please follow these steps for responsible disclosure:

### 1. Preferred Method: GitHub Private Vulnerability Reporting
If you have a GitHub account, please submit your report via GitHub's **[Private Vulnerability Reporting](https://github.com/Palash606/BidStream/security/advisories/new)** feature under the **Security** tab of the repository.

### 2. Alternative Method: Security Email
Alternatively, email the maintainer directly:
- **Email**: [palashshah606@gmail.com](mailto:palashshah606@gmail.com)
- **Subject**: `[SECURITY VULNERABILITY] BidStream - <Brief Summary>`

### What to Include in Your Report
To help us quickly assess and resolve the issue, please include:
1. **Description**: Clear description of the vulnerability and potential impact.
2. **Affected Component(s)**: Which microservice(s) or modules are impacted (`api-gateway`, `identity-service`, `auction-service`, `bidstream-ui`, `redis`, etc.).
3. **Proof of Concept (PoC)**: Step-by-step reproduction steps, cURL requests, scripts, or payload samples.
4. **Remediation Ideas**: Any suggestions or references you may have for a fix.

### Response SLA
- **Initial Acknowledgment**: Within **48 hours** of report receipt.
- **Triage & Assessment**: Within **7 calendar days**.
- **Fix & Advisory Release**: Coordinated with the reporter before public disclosure.

We kindly ask that you keep the vulnerability confidential until a patch is publicly released.

---

## 🔐 Critical Repository & Code Security Rules

### 🚨 Rule #1: Never Commit Secrets
**NEVER** commit sensitive data to Git:
- Database passwords (`DB_PASSWORD`)
- JWT secret signing keys (`JWT_SECRET`)
- API keys (Google OAuth, Razorpay, SMTP credentials)
- Private session tokens or cookies

### ✅ Rule #2: Use Environment Variables
All secrets **MUST** be loaded strictly from environment variables:
```bash
# Load from .env.local (ignored in .gitignore)
export $(cat .env.local | xargs)

# Or set individually
export DB_PASSWORD="your_password"
export JWT_SECRET="your_secret"
```

### 🔍 Rule #3: Pre-Commit Scanning
Before pushing to GitHub, verify your commits:
```bash
# Check for accidentally staged secrets
git diff --cached | grep -iE "(password|secret|key|token)" 

# Automatic scanning with git-secrets
git secrets --scan
```

---

## 🌐 GitHub Repository Security

The BidStream repository enforces the following automated security controls:
1. **Secret Scanning**: GitHub scans commits for exposed API keys and credentials.
2. **Push Protection**: Blocks git commits containing high-confidence secrets before reaching remote branches.
3. **Dependabot Alerts & Updates**: Automatically detects and alerts on vulnerable third-party dependencies.
4. **CodeQL Automated Analysis**: Continuous static code analysis on PRs.

---

## 🏗️ Application Security Architecture

### 1. JWT Authentication & Refresh Mechanism
- **Access Token Expiry**: 15 minutes (short-lived to minimize exposure window).
- **Refresh Token Expiry**: 7 days (stored securely in client storage and verified in database).
- **Validation**: Every incoming REST request through API Gateway and WebSocket handshake validates the JWT cryptographic signature and checks the active session in Redis.

### 2. Single-Session Enforcement
- Only **one active session per user** is permitted across devices.
- Logging in on a second device automatically invalidates earlier sessions in Redis.
- Prevents:
  - Multi-device role abuse (e.g. attempting to act as Seller and Bidder concurrently).
  - Session hijacking across distributed networks.

### 3. Strict Anti-Self-Bidding Guard
- **Frontend Layer**: Filters the seller's own lots from their personal Bidder Floor.
- **Backend API Layer**: `BidService` asserts `bidder_id != product.seller_id` prior to acquiring distributed lock.
- **Rejection**: Attempts return `403 Forbidden` with audit logging.

### 4. WebSocket (STOMP) Security
- **Handshake Authentication**: Requires a valid JWT bearer token.
- **Channel Permissions**: Validates user access before subscribing to `/topic/auction/{lotId}`.
- **Message Validation**: Incoming bids over STOMP are passed through full DTO validation and active session checks.

---

## 🛡️ Data Privacy & Compliance

- **Email Addresses**: Masked/hashed in application logs.
- **Payment Information**: Zero credit card or bank details are stored on BidStream servers; external PCI-DSS certified gateways (Razorpay) handle transactions.
- **Bidder Anonymity**: Usernames in public bid streams are masked (e.g., `B***r`) to protect user identities while maintaining auditability.
- **Aggregated Viewers**: Viewer counters are aggregated atomically in Redis rather than storing identifiable spectator telemetry.

---

## 🚨 Incident Response Protocol

### If a Secret is Accidentally Committed:
1. **Immediately Rotate the Secret**:
   - Change the database password immediately.
   - Invalidate the compromised `JWT_SECRET` (forces re-login for all active sessions).
   - Revoke and regenerate OAuth and SMTP credentials.
2. **Scrub Git History**:
   ```bash
   # Use BFG Repo-Cleaner to rewrite history
   bfg --replace-text passwords.txt
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push --force
   ```
3. **Notify the Team**: Document root cause, affected scopes, and preventive measures.

---

## 🚀 Production Deployment Security Checklist

Before deploying BidStream to production environments:

- [ ] All secrets loaded via environment variables or secret manager (never hardcoded in `application.yml`)
- [ ] `.env.local` and credentials strictly excluded in `.gitignore`
- [ ] HTTPS enforced end-to-end with TLS 1.3
- [ ] CORS restricted to production frontend domains
- [ ] Rate-limiting enabled on API Gateway
- [ ] Automated PostgreSQL backups configured
- [ ] Redis persistence enabled (AOF + RDB)
- [ ] PII excluded from application logs
- [ ] Security response headers enabled (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Content-Security-Policy`)
