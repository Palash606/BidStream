# Contributing to BidStream

Thank you for your interest in contributing to **BidStream**! As a high-throughput, distributed real-time auction platform, we welcome contributions from all developers—whether you are squashing a race condition, optimizing a WebSocket fan-out, refining the bidder UI, or expanding test coverage.

This guide outlines our development process, branching strategies, coding standards, and how to submit pull requests that get reviewed and merged quickly.

---

## 📜 Code of Conduct

All contributors and maintainers are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project, you agree to uphold a welcoming, respectful, and harassment-free community.

---

## 🛠️ Development Setup

### Prerequisites
Make sure you have the following installed on your machine:
- **Java Development Kit (JDK) 21** or higher
- **Apache Maven 3.9+** (or use the included `./mvnw` wrapper)
- **Node.js 18+** & **npm 9+**
- **Docker** & **Docker Compose**
- **Git**

### Step-by-Step Local Setup

1. **Fork and Clone the Repository**
   ```bash
   git clone https://github.com/<your-username>/BidStream.git
   cd BidStream
   ```

2. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/Palash606/BidStream.git
   git fetch upstream
   ```

3. **Configure Environment Secrets**
   ```bash
   cp .env.example .env.local
   ```
   *Note: Never commit `.env.local` or any sensitive API keys to Git.*

4. **Start Supporting Infrastructure**
   ```bash
   docker-compose up -d
   ```
   This spins up PostgreSQL on port `5432` and Redis on port `6379`.

5. **Build and Test Backend Services**
   ```bash
   # Build all services using the root Maven wrapper
   ./mvnw clean compile
   ```

6. **Start the Frontend**
   ```bash
   cd bidstream-ui
   npm install
   npm run dev
   ```

---

## 🌿 Git Branching Strategy

We follow a structured branch naming convention. All feature branches must branch off and target `main`:

| Branch Prefix | Purpose | Example |
| :--- | :--- | :--- |
| `feature/` | New features or enhancements | `feature/websocket-reconnect-backoff` |
| `fix/` | Bug fixes and patches | `fix/bid-lock-timeout-handling` |
| `docs/` | Documentation additions or updates | `docs/architecture-kafka-roadmap` |
| `refactor/` | Code refactoring without changing functionality | `refactor/identity-dto-validation` |
| `test/` | Adding missing tests or test infrastructure | `test/auction-concurrency-integration` |
| `chore/` | Build scripts, dependencies, CI/CD tweaks | `chore/upgrade-spring-boot-3.4` |

---

## 📝 Commit Message Guidelines

We enforce the **Conventional Commits** specification. Clear commit messages make the project changelog readable and maintainable.

### Format
```text
<type>(<scope>): <short description in present tense>

[optional longer body explaining context and rationale]

[optional issue reference: e.g., Closes #42]
```

### Types
- `feat`: A new feature (e.g., `feat(auction): implement countdown reset on valid bid`)
- `fix`: A bug fix (e.g., `fix(gateway): resolve CORS header duplication`)
- `docs`: Documentation updates only (e.g., `docs(readme): add architecture sequence flow`)
- `style`: Changes that do not affect code meaning (formatting, whitespace)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Code change that improves performance (e.g., `perf(redis): pipeline session lookups`)
- `test`: Adding or correcting tests
- `chore`: Changes to build process, CI configuration, or dependencies

---

## 💻 Coding Standards & Conventions

### Java & Spring Boot Best Practices
1. **Java 21 Modern Syntax**: Use records for immutable DTOs, pattern matching for `instanceof`, and switch expressions where appropriate.
2. **Distributed Concurrency**:
   - Always acquire distributed locks via Redisson before mutating shared state:
     ```java
     RLock lock = redissonClient.getLock("bid-lock:" + productId);
     if (lock.tryLock(waitSec, leaseSec, TimeUnit.SECONDS)) {
         try {
             // critical section
         } finally {
             if (lock.isHeldByCurrentThread()) {
                 lock.unlock();
             }
         }
     }
     ```
   - Ensure event listeners and webhook handlers are **strictly idempotent**.
3. **Data Validation**:
   - Annotate all incoming request DTOs with `@Valid`, `@NotNull`, `@NotBlank`, `@PositiveOrZero`.
   - Never expose raw JPA entities directly across REST controllers.
4. **Exception Handling**:
   - Use centralized `@RestControllerAdvice` for uniform JSON error responses (`timestamp`, `status`, `error`, `message`, `path`).
5. **Security**:
   - Never log passwords, tokens, or PII.
   - Respect the single-session policy and self-bidding prevention rules.

### React & Frontend Best Practices
1. **Components**: Write clean functional components using modern React 19 patterns.
2. **State Management**: Use Zustand for global application state (`useAuthStore`, `useAuctionStore`).
3. **Styling**: Use utility classes with Tailwind CSS. Maintain consistent spacing, gradients, and dark/light contrast.
4. **Resilient WebSockets**: Handle disconnects, reconnection retries, and network drops gracefully in live bid rooms.

---

## 🤖 AI-Assisted Contributions

We actively support the use of AI tools (Cursor, GitHub Copilot, Antigravity, Claude, ChatGPT) to accelerate high-quality open-source contributions. 

When submitting AI-assisted code:
- **Review every line**: Ensure you understand the implementation details, edge cases, and architectural fit.
- **Maintainer Maturity**: Do not submit unreviewed code or hallucinated dependencies.
- **Test Coverage**: Always write automated unit or integration tests verifying the behavior of AI-generated logic.
- **Consult AI Context Rules**: Refer to [.cursorrules](.cursorrules) and [.github/copilot-instructions.md](.github/copilot-instructions.md) in the repository root.

---

## 🚀 Pull Request Process

1. **Keep PRs Focused**: A PR should address a single concern, bug, or feature. Avoid bundling unrelated formatting or dependency changes.
2. **Run Tests Locally**:
   ```bash
   ./mvnw test
   cd bidstream-ui && npm test
   ```
3. **Verify CI Cleanliness**: Ensure your code passes all linting, compilation, and automated tests.
4. **Fill out the PR Template**: Our repository provides a comprehensive [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md). Check off all applicable items.
5. **Respond to Code Reviews**: Maintainers or fellow contributors may suggest adjustments. Be proactive and communicative!

Thank you for helping make BidStream the premier distributed auction platform!
