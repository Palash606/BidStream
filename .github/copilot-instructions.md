# GitHub Copilot Instructions for BidStream

Welcome to the **BidStream** codebase. BidStream is a production-grade, distributed real-time auction ecosystem engineered for high-throughput, sub-100ms bidding.

When generating suggestions or reviewing pull requests in this repository, follow these architecture directives:

---

## 1. System Ecosystem & Microservices

- **`eureka-server` (Port 8761)**: Service discovery registry. All backend services register here.
- **`api-gateway` (Port 8080)**: Spring Cloud Gateway routing `/auth/**` to `identity-service` and `/api/**` to `auction-service`.
- **`identity-service` (Port 8081)**: Manages users, JWT issuance, OAuth, role-switching (Buyer/Seller), and Redis session invalidation.
- **`auction-service` (Port 8082)**: Manages product lots, WebSocket STOMP real-time feeds, Redisson distributed locks, and bid validation.
- **`bidstream-ui` (Port 5173)**: React 19 + Vite frontend application.
- **Persistence**: PostgreSQL (`identity_db`, `auction_db`) for ACID guarantees; Redis 7 for distributed locks (`RLock`), countdown buckets, and session caches.

---

## 2. Distributed Concurrency & Critical Sections

- **Atomic Bidding**: Every incoming bid must be processed inside a Redisson distributed lock (`redissonClient.getLock("bid-lock:" + productId)`).
- **Deadlock Prevention**: Always use `tryLock(wait, lease, TimeUnit)` with explicit timeouts.
- **Clean Cleanup**: Unlock in a `finally` block with `if (lock.isHeldByCurrentThread()) lock.unlock();`.
- **IPL Countdown Timer**: Reset Redis keys `auction-timer:{productId}` and `auction-hit-count:{productId}` when a higher bid is accepted.

---

## 3. Security Guidelines

- **Zero Secrets**: Do NOT suggest committing credentials, hardcoded JWT secrets, or DB passwords.
- **Anti-Self-Bidding**: Validate that the bidder is NOT the seller (`product.getSellerId() != bidderId`).
- **Single-Session Enforcement**: Invalidate existing session tokens in Redis when a user logs in from a new client.
- **DTO Safety**: Never accept or return raw JPA entities in controller methods.

---

## 4. Frontend Standards (React 19 & Zustand)

- Use Zustand stores (`useAuthStore`) for auth state and token refreshing.
- Use Tailwind CSS for utility-first styling.
- Ensure WebSocket subscriptions over SockJS/STOMP are properly subscribed upon mount and unsubscribed upon unmount.
