## 📌 Description

Please provide a concise description of what this pull request changes, why it is needed, and any architectural context.

Fixes #(issue)

---

## 🔍 Type of Change

- [ ] 🚀 New feature (non-breaking change adding functionality)
- [ ] 🐛 Bug fix (non-breaking change fixing an issue)
- [ ] ⚡ Performance optimization
- [ ] ♻️ Code refactoring (no functional changes)
- [ ] 📚 Documentation update
- [ ] 🧪 Testing (adding or updating tests)
- [ ] 🔧 Build / CI / Tooling configuration

---

## 📦 Impacted Microservices

- [ ] `api-gateway` (Spring Cloud Gateway)
- [ ] `eureka-server` (Netflix Service Registry)
- [ ] `identity-service` (Auth / Users / JWT)
- [ ] `auction-service` (Bidding Engine / WebSockets / Catalog)
- [ ] `bidstream-ui` (React Frontend)
- [ ] Infrastructure (`docker-compose.yml`, PostgreSQL, Redis)
- [ ] Documentation / Meta files

---

## 🧪 Verification & Testing

### Automated Testing
- [ ] Unit tests added / updated
- [ ] Microservices compile and tests pass: `./mvnw clean test` (or clean compile)
- [ ] Frontend builds without errors: `npm run build`

### Manual Verification
- [ ] Tested live bidding / WebSocket flow (if applicable)
- [ ] Verified anti-self-bidding and role switching logic (if applicable)
- [ ] Verified Redis distributed lock / countdown behavior (if applicable)

---

## ✅ Maintainer Quality Checklist

- [ ] My code follows the style guidelines of this project (see [CONTRIBUTING.md](CONTRIBUTING.md)).
- [ ] I have performed a self-review of my own code.
- [ ] **Zero Secrets**: I have verified that NO passwords, tokens, or `.env` files are included.
- [ ] I have commented complex or non-obvious code (e.g. distributed locking, race-condition mitigation).
- [ ] I have updated related documentation accordingly.
- [ ] No new warnings or lint errors are introduced.

---

## 🤖 AI Assistance Disclosure

- [ ] This PR was assisted by AI tools (e.g., Cursor, GitHub Copilot, Claude, Antigravity).
  - *If checked: I confirm that every line of generated code was verified, reviewed for architectural correctness, and tested against regressions.*
