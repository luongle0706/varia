# Varia Architecture & Design Pattern Sandboxes (Java 21)

This directory contains standalone, reproducible, production-scale architecture practices that combine multiple classic (GoF), cloud, and enterprise design patterns.

---

## 1. Scenario Naming Invariant

Every practice folder must strictly follow the context-driven taxonomy rule:

```
[Domain]__[Scale_Archetype]__[Business_Capability]
```

### Archetypes:
- **`d2c_enterprise`**: Moderate traffic (100–1,000 req/s), high domain complexity, strong ACID consistency, rich domain model (e.g. Nike, Uniqlo, Apple Store).
- **`marketplace_hyperscale`**: Extreme traffic (100,000+ req/s), flash-sale contention, distributed eventual consistency, partitioned workloads (e.g. Shopee, Amazon).
- **`regulated_core`**: Zero-loss, immutable audit trails, strict regulatory compliance (e.g. Core Banking, Healthcare Records).
- **`b2b_multi_tenant`**: Dynamic tenant isolation, customizable plugin pipelines, policy variability.

---

## 2. Technical Stack Invariants

- **Runtime**: **Java 21 (LTS)** using modern idioms:
  - `record` for immutable value objects, DTOs, and domain events.
  - `sealed interface` and `sealed class` for algebraic domain types.
  - Pattern matching for `switch` expressions.
  - Virtual Threads (`Thread.ofVirtual()`) for scalable I/O.
- **Build System**: **Gradle** with `build.gradle` (Groovy DSL) and the Gradle Wrapper (`./gradlew`).
- **Configuration**: Declarative **YAML** (`docker-compose.yml`, `application.yml`).
- **Local-First Containerization**: Every practice includes its own `docker-compose.yml` with dependencies (Postgres, Redis, Kafka, WireMock stubs) pre-configured and seed data included.

---

## 3. Standard Local Developer Workflow

```bash
# 1. Navigate to the scenario practice
cd practices/java21/<scenario_name>

# 2. Boot dependencies and mock servers
docker compose up -d

# 3. Build & run test suites locally
./gradlew test

# 4. Trigger simulated curl workflows
./scripts/run-simulation.sh
```
