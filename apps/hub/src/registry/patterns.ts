import type { ScenarioManifest } from '@varia/core';

export const REGISTERED_SCENARIOS: ScenarioManifest[] = [
  {
    id: 'ecommerce__marketplace_hyperscale__order_checkout',
    domain: 'ecommerce',
    scaleArchetype: 'marketplace_hyperscale',
    businessCapability: 'order_checkout',
    title: 'Flash-Sale Order Processing',
    tagline: 'Coordinating high-speed inventory claims with asynchronous payments',
    description:
      'An educational study on coordinating rapid inventory reservations with asynchronous payments, preventing overselling without overwhelming the database.',
    contextSpec: {
      intent:
        'Guarantee that limited inventory is never oversold during extreme traffic spikes, while keeping the checkout responsive and resilient to external payment failures.',
      businessProblem:
        'A high-velocity flash sale where tens of thousands of buyers attempt to purchase a strictly limited inventory quota (such as 50 units) within the very first seconds of launch.',
      problemStory:
        'Imagine you are building an online store hosting a flash sale for a coveted product with only 50 units in stock. At first, the design seems straightforward: when a customer clicks "Buy Now", the server queries the database, checks that stock remains, decrements the count by one, and redirects the customer to a payment portal.\n\nAt midnight, however, 20,000 customers click "Buy Now" at the exact same moment. If each web request tries to lock the single inventory row in the database, the database connection pool is instantly exhausted. Queries queue up, response times skyrocket, and the website crashes. Worse, if requests execute concurrently without database locks, hundreds of shoppers see the same remaining stock, causing you to sell 500 items when you only physically have 50.',
      realWorldScenario:
        'Traditional relational database transactions (such as SELECT ... FOR UPDATE) force all buyers to wait in a single line at the database disk layer. When payment processors take 1 to 3 seconds to confirm a credit card, holding database locks during that wait paralyzes the entire platform.',
      realWorldAnalogy:
        'Think of a theater with 50 front-row seats. Instead of letting 10,000 fans rush through the lobby doors and mob the ticket counter all at once, an attendant at the entrance hands out exactly 50 numbered wristbands. Once those 50 wristbands are gone, the attendant immediately informs everyone else in line that the seats are sold out. The 50 wristband holders can then walk calmly to the counter to pay and receive their tickets without any stampede or confusion.',
      solutionOverview:
        'The architecture separates the instantaneous reservation of inventory from the slower process of payment authorization. Incoming requests pass through an inspection chain for rate limiting. Then, a lightweight in-memory script (Redis Lua) claims a stock token in less than a millisecond. If claimed, the order is saved locally in the database along with an outbox record. A background Saga orchestrator coordinates payment and fulfillment. If the customer fails to pay in time, the held token is automatically released back to stock.',
      requirements: [
        'Zero Overselling: Physical inventory must never drop below zero, regardless of how many users click checkout at the same moment.',
        'Fast Ingress Acknowledgment: The server must respond to the buyer within 50ms with confirmation that their request has been queued.',
        'Isolation from Payment Latency: Slow third-party banking APIs must never hold database connections or block stock reservation.',
        'Guaranteed Event Delivery: If the message broker experiences a temporary outage, no confirmed order or inventory reservation may ever be lost.',
      ],
      architecturalDecisions: [
        {
          pattern: 'Redis Lua Token Bucket',
          decision: 'In-Memory Atomic Inventory Pre-claim',
          problemSolved:
            'Prevents database lock contention and deadlocks when thousands of buyers target the same product record.',
          whyChosenOverAlternatives:
            'Alternative Rejected: SQL Row-Level Locking ("SELECT ... FOR UPDATE"). Why: Locking a database row on disk serializes all requests, exhausting database connections and crashing the server under heavy traffic. Selected Approach: A single-threaded in-memory Redis script decrements stock atomically in under a millisecond, rejecting excess buyers instantly before they ever touch the database.',
        },
        {
          pattern: 'Transactional Outbox',
          decision: 'Reliable Event Publication via Local Outbox Table',
          problemSolved:
            'Ensures that database state changes and message broker events always remain synchronized without distributed locks.',
          whyChosenOverAlternatives:
            'Alternative Rejected: Sending events directly to Kafka from the HTTP web handler. Why: If the network fails right after the database commits, the message is lost forever. Selected Approach: Writing the order record and the outgoing message into the same database transaction guarantees that events are never lost, even during system crashes.',
        },
        {
          pattern: 'Saga (Orchestration)',
          decision: 'Asynchronous Multi-Step Workflow Coordination',
          problemSolved:
            'Coordinates multi-step orders (inventory, payment, shipping) across independent services without long-lived database locks.',
          whyChosenOverAlternatives:
            'Alternative Rejected: Distributed Two-Phase Commit (2PC). Why: 2PC blocks network resources across multiple servers, making it brittle and slow. Selected Approach: A centralized Saga Orchestrator tracks order status step-by-step and automatically triggers compensating actions (such as releasing inventory) if payment fails.',
        },
        {
          pattern: 'Chain of Responsibility',
          decision: 'Modular Pre-Flight Inspection Pipeline',
          problemSolved:
            'Filters malicious bots, verifies authentication, and enforces rate limits before requests reach the core order logic.',
          whyChosenOverAlternatives:
            'Alternative Rejected: Hardcoding validation checks directly inside the checkout service. Why: Tightly couples business rules with security checks and makes it difficult to add new security rules. Selected Approach: Independent filter handlers can be added, reordered, or removed without modifying the core checkout code.',
        },
      ],
      applicability: {
        whenToUse: [
          'High-demand flash sales or ticket releases where thousands of buyers compete for limited inventory in seconds.',
          'Systems where third-party payment gateways take multiple seconds to respond and must not block inventory holds.',
          'Applications where the user experience can support an asynchronous "Order Processing" state.',
        ],
        whenNotToUse: [
          'Standard e-commerce stores with moderate traffic (under 500 orders per minute)—a single relational database with standard transactions is much simpler and cheaper.',
          'Workflows where the customer requires an immediate, synchronous final receipt before the HTTP response finishes.',
          'Small projects without the team capacity to operate Redis, Kafka, and background worker queues.',
        ],
      },
      tradeOffs: {
        pros: [
          'Instant Responsiveness: Shoppers receive immediate confirmation that their order is queued within milliseconds.',
          'Guaranteed Inventory Integrity: Stock is claimed atomically in memory, making overselling mathematically impossible.',
          'Resilience to External Outages: Sluggish banking gateways or broker downtime cannot take down the checkout portal.',
        ],
        cons: [
          'Eventual Consistency: Shoppers see an "Order Queued" status and must await asynchronous confirmation via websocket or polling.',
          'Operational Overhead: Requires maintaining Redis, PostgreSQL, Kafka, and background poller workers.',
          'Compensating Complexity: Every forward action (like reserving stock) must have a reliable rollback routine if payment fails.',
        ],
      },
    },
    scaleMetrics: {
      throughput: '120,000 req/sec peak',
      concurrency: 'Extreme (10,000 users competing for 50 SKU units)',
      consistency: 'Eventual Consistency via Transactional Outbox + Sagas',
      deploymentModel: 'Partitioned Event-Driven Microservices',
    },
    patternsUsed: [
      {
        name: 'Saga (Orchestration)',
        category: 'architectural',
        guruUrl: 'https://refactoring.guru/design-patterns',
        summary: 'Coordinates multi-service transactions with compensating backward recovery.',
      },
      {
        name: 'Transactional Outbox',
        category: 'architectural',
        summary: 'Guarantees at-least-once domain event publication without distributed locks.',
      },
      {
        name: 'Chain of Responsibility',
        category: 'behavioral',
        guruUrl: 'https://refactoring.guru/design-patterns/chain-of-responsibility',
        summary: 'Executes anti-bot, token bucket quota, and user fraud inspections in sequence.',
      },
      {
        name: 'Flyweight',
        category: 'structural',
        guruUrl: 'https://refactoring.guru/design-patterns/flyweight',
        summary: 'Shares immutable SKU catalog definitions in off-heap cache to minimize GC pressure.',
      },
      {
        name: 'Adapter',
        category: 'structural',
        guruUrl: 'https://refactoring.guru/design-patterns/adapter',
        summary: 'Translates domain payment commands to third-party bank & e-wallet APIs.',
      },
      {
        name: 'Strategy',
        category: 'behavioral',
        guruUrl: 'https://refactoring.guru/design-patterns/strategy',
        summary: 'Switches dynamic flash-sale voucher deduction engines at runtime.',
      },
    ],
    nodes: [
      {
        id: 'node-ingress',
        label: 'Ingress API Gateway',
        subLabel: 'HTTP Rest Controller',
        kind: 'interface_port',
        x: 8,
        y: 45,
        detail: {
          role: 'Entry Point & Response Boundary',
          className: 'FlashSaleIngressController',
          contextJustification:
            'Accepts customer checkout requests over HTTP. It delegates immediately to the validation chain and returns an acknowledgment to the client without blocking worker threads.',
          receives: 'HTTP POST /checkout { userId, skuId, quantity }',
          emits: 'CheckoutContext passed to OrderInspectionChain; immediate HTTP 202 Accepted to client',
          tradeOffs: [
            'Separates network acceptance from processing, requiring client polling or websocket notifications for final confirmation.',
          ],
          javaSnippet: `@RestController
@RequestMapping("/api/v1/flash-sale")
public class FlashSaleIngressController {
  private final OrderInspectionChain inspectionChain;
  private final OrderSagaOrchestrator orchestrator;

  @PostMapping("/checkout")
  public ResponseEntity<CheckoutResponse> checkout(
      @RequestBody @Valid FlashSaleCheckoutRequest request) {
    var context = inspectionChain.inspect(request);
    var orderId = orchestrator.submitOrder(context);
    return ResponseEntity.accepted().body(new CheckoutResponse(orderId, OrderStatus.QUEUED));
  }
}`,
        },
      },
      {
        id: 'node-chain',
        label: 'Pre-Flight Inspection Chain',
        subLabel: 'Chain of Responsibility Pattern',
        kind: 'pattern_anchor',
        patternTag: '#ChainOfResponsibility',
        x: 28,
        y: 25,
        detail: {
          role: 'Pre-Flight Security & Quota Pipeline',
          className: 'OrderInspectionChain',
          pattern: {
            name: 'Chain of Responsibility',
            category: 'behavioral',
            guruUrl: 'https://refactoring.guru/design-patterns/chain-of-responsibility',
            summary: 'Sequentially passes checkout requests along a chain of independent validation handlers.',
          },
          contextJustification:
            'Encapsulates rate-limiting, user fraud checks, and per-account purchase limits into modular filters that can be reordered or swapped without altering checkout logic.',
          receives: 'Inbound CheckoutContext from Ingress Controller',
          emits: 'Verified CheckoutContext forward to Redis Inventory Claim, or aborts with exception',
          tradeOffs: [
            'Each additional filter introduces minor execution latency; filters should avoid remote network roundtrips.',
          ],
          javaSnippet: `public interface InspectionFilter {
  void filter(CheckoutContext context, FilterChain next);
}

public class RateLimitFilter implements InspectionFilter {
  private final RedisRateLimiter limiter;

  @Override
  public void filter(CheckoutContext ctx, FilterChain next) {
    if (!limiter.tryAcquire(ctx.userId(), ctx.skuId())) {
      throw new QuotaExceededException("Account rate limit exceeded");
    }
    next.doFilter(ctx);
  }
}`,
        },
      },
      {
        id: 'node-token-bucket',
        label: 'In-Memory Token Bucket',
        subLabel: 'Atomic Pre-claim Service',
        kind: 'infrastructure_service',
        x: 50,
        y: 15,
        detail: {
          role: 'Atomic Inventory Gatekeeper',
          className: 'RedisInventoryClaimAdapter',
          contextJustification:
            'A single-threaded in-memory script decrements available stock tokens atomically in under a millisecond. If no stock remains, the request is stopped immediately before touching the database.',
          receives: 'ClaimCommand(skuId, requestedQuantity)',
          emits: 'ClaimResult(SUCCESS / EXHAUSTED)',
          tradeOffs: [
            'In-memory reservations must be tracked and synchronized back to the primary database asynchronously.',
          ],
          javaSnippet: `public record InventoryReservation(String skuId, int quantity) {
  public static final String LUA_SCRIPT = """
      local current = tonumber(redis.call('get', KEYS[1]) or '0')
      local req = tonumber(ARGV[1])
      if current >= req then
        redis.call('decrby', KEYS[1], req)
        return 1
      else
        return 0
      end
      """;
}`,
        },
      },
      {
        id: 'node-saga',
        label: 'Order Saga Orchestrator',
        subLabel: 'Saga State Machine',
        kind: 'pattern_anchor',
        patternTag: '#Saga',
        x: 50,
        y: 50,
        detail: {
          role: 'Distributed Workflow Coordinator',
          className: 'OrderSagaOrchestrator',
          pattern: {
            name: 'Saga',
            category: 'architectural',
            summary: 'Coordinates multi-step distributed workflows and executes compensating rollbacks if any step fails.',
          },
          contextJustification:
            'Maintains the overall order lifecycle state machine. It writes the initial order record and coordinates asynchronous payment authorization and inventory release.',
          receives: 'Verified CheckoutContext after successful in-memory stock claim',
          emits: 'Persisted Order entity and Transactional Outbox record to PostgreSQL',
          tradeOffs: [
            'Requires explicit compensating rollback logic for every forward action (such as releasing reserved tokens).',
          ],
          javaSnippet: `public class OrderSagaOrchestrator {
  private final OutboxRepository outbox;

  @Transactional
  public UUID submitOrder(CheckoutContext ctx) {
    var order = Order.createQueued(ctx.orderId(), ctx.userId(), ctx.items());
    var outboxEvent = new OutboxEvent(
      order.id(),
      "ORDER_SUBMITTED",
      order.toJsonPayload()
    );
    outbox.save(outboxEvent);
    return order.id();
  }
}`,
        },
      },
      {
        id: 'node-outbox',
        label: 'PostgreSQL Outbox Table',
        subLabel: 'Transactional Outbox Pattern',
        kind: 'pattern_anchor',
        patternTag: '#TransactionalOutbox',
        x: 72,
        y: 35,
        detail: {
          role: 'Transactional Event Buffer',
          className: 'PostgresOutboxStore',
          pattern: {
            name: 'Transactional Outbox',
            category: 'architectural',
            summary: 'Guarantees reliable message publication by recording events in the same database transaction as business entities.',
          },
          contextJustification:
            'Ensures that domain state changes and outbound event notifications commit together, preventing ghost records or lost messages.',
          receives: 'OutboxEvent created during Order transaction',
          emits: 'Committed event records queried by the message dispatcher worker',
          tradeOffs: [
            'Requires an outbox polling worker or Change Data Capture (CDC) process to read and publish events to Kafka.',
          ],
          javaSnippet: `public record OutboxRecord(
    UUID id,
    String aggregateType,
    UUID aggregateId,
    String eventType,
    String payload,
    Instant createdAt,
    OutboxStatus status
) {}`,
        },
      },
      {
        id: 'node-kafka',
        label: 'Kafka Event Broker',
        subLabel: 'Event Streaming Transport',
        kind: 'infrastructure_service',
        x: 72,
        y: 65,
        detail: {
          role: 'Asynchronous Event Transport',
          className: 'KafkaEventPublisher',
          contextJustification:
            'Transports order events to decoupled background payment and notification consumers without placing load on the web tier.',
          receives: 'Polled OutboxRecord from database dispatcher',
          emits: 'Event message broadcast to "orders.events" partition',
          tradeOffs: [
            'Downstream consumers must be idempotent to handle potential duplicate message deliveries.',
          ],
          javaSnippet: `public void publish(OutboxRecord event) {
  kafkaTemplate.send(
      new ProducerRecord<>("orders.events", event.aggregateId().toString(), event.payload())
  );
}`,
        },
      },
      {
        id: 'node-payment-adapter',
        label: 'Payment Gateway Adapter',
        subLabel: 'Adapter Pattern',
        kind: 'pattern_anchor',
        patternTag: '#Adapter',
        x: 92,
        y: 50,
        detail: {
          role: 'Third-Party Gateway Adapter',
          className: 'ResilientPaymentGatewayAdapter',
          pattern: {
            name: 'Adapter',
            category: 'structural',
            guruUrl: 'https://refactoring.guru/design-patterns/adapter',
            summary: 'Converts the interface of a third-party banking service into an interface that domain services expect.',
          },
          contextJustification:
            'Isolates core order models from external bank API formats, applying retry and timeout policies to prevent slow bank responses from locking threads.',
          receives: 'PaymentCommand from background event consumer',
          emits: 'PaymentReceipt returned to Saga Orchestrator',
          tradeOffs: [
            'External payment gateways may require asynchronous webhook callbacks to confirm final settlement.',
          ],
          javaSnippet: `public interface PaymentGatewayPort {
  PaymentReceipt charge(PaymentCommand command);
}

public class BankAdapter implements PaymentGatewayPort {
  @Override
  public PaymentReceipt charge(PaymentCommand cmd) {
    return externalBankClient.executeTransfer(cmd.account(), cmd.amountCents());
  }
}`,
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'node-ingress', target: 'node-chain', label: '1. Inbound Request' },
      { id: 'e2', source: 'node-chain', target: 'node-token-bucket', label: '2. Claim Stock Token' },
      { id: 'e3', source: 'node-chain', target: 'node-saga', label: '3. Order Hand-off' },
      { id: 'e4', source: 'node-saga', target: 'node-outbox', label: '4. Atomic DB Outbox Write' },
      { id: 'e5', source: 'node-outbox', target: 'node-kafka', label: '5. Dispatch Event' },
      { id: 'e6', source: 'node-kafka', target: 'node-payment-adapter', label: '6. Process Payment' },
    ],
    simulationSteps: [
      {
        stepNumber: 1,
        title: 'Customer Checkout Ingress',
        description:
          'A customer submits an order. The Ingress Gateway accepts the HTTP request and immediately hands it to the validation pipeline.',
        activeNodeIds: ['node-ingress'],
        activeEdgeIds: [],
        dataPayloadSnippet: `{ "userId": "usr_9482", "skuId": "sku_iphone16_deal", "quantity": 1 }`,
      },
      {
        stepNumber: 2,
        title: 'Pre-Flight Security & Quota Validation',
        description:
          'The Chain of Responsibility runs through independent filters to verify account rate limits, bot signatures, and claim quotas.',
        activeNodeIds: ['node-chain'],
        activeEdgeIds: ['e1'],
        dataPayloadSnippet: `[CHAIN-CHECK: PASSED] User quota 0/1 claimed. Device token verified.`,
      },
      {
        stepNumber: 3,
        title: 'Atomic In-Memory Stock Claim',
        description:
          'A single-threaded Redis Lua script verifies and decrements available inventory in memory in under a millisecond.',
        activeNodeIds: ['node-token-bucket'],
        activeEdgeIds: ['e2'],
        dataPayloadSnippet: `REDIS EVAL: key=stock:sku_iphone16_deal, result=SUCCESS (remaining=49)`,
      },
      {
        stepNumber: 4,
        title: 'Order Creation & Outbox Transaction',
        description:
          'The Saga Orchestrator creates the order with "PENDING_PAYMENT" status and writes an event to the local Outbox table in one ACID database transaction.',
        activeNodeIds: ['node-saga', 'node-outbox'],
        activeEdgeIds: ['e3', 'e4'],
        dataPayloadSnippet: `BEGIN TRANSACTION;\nINSERT INTO orders VALUES ('ord_7712', 'PENDING_PAYMENT');\nINSERT INTO outbox_records VALUES ('evt_01', 'ORDER_CREATED');\nCOMMIT;`,
      },
      {
        stepNumber: 5,
        title: 'Asynchronous Event Dispatch & Settlement',
        description:
          'The outbox worker dispatches the event to the Kafka message broker, where the Payment Adapter picks it up for external payment settlement.',
        activeNodeIds: ['node-kafka', 'node-payment-adapter'],
        activeEdgeIds: ['e5', 'e6'],
        dataPayloadSnippet: `Kafka Event [orders.events] -> PaymentGatewayAdapter.charge(orderId="ord_7712", amount=$799.00)`,
      },
    ],
    codeFiles: [
      {
        filename: 'build.gradle',
        path: 'build.gradle',
        language: 'groovy',
        content: `plugins {
    id 'java'
    id 'org.springframework.boot' version '3.3.4'
    id 'io.spring.dependency-management' version '1.1.6'
}

group = 'com.varia.practices'
version = '0.1.0'

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-data-redis'
    implementation 'org.springframework.kafka:spring-kafka'
    runtimeOnly 'org.postgresql:postgresql'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.testcontainers:junit-jupiter'
    testImplementation 'org.testcontainers:postgresql'
    testImplementation 'org.testcontainers:kafka'
}

tasks.named('test') {
    useJUnitPlatform()
}`,
      },
      {
        filename: 'docker-compose.yml',
        path: 'docker-compose.yml',
        language: 'yaml',
        content: `version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/flashsale_db
      - SPRING_DATA_REDIS_HOST=redis
      - SPRING_KAFKA_BOOTSTRAP_SERVERS=kafka:9092
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: flashsale_db
      POSTGRES_USER: varia
      POSTGRES_PASSWORD: varia_secret
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U varia -d flashsale_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  kafka:
    image: confluentinc/cp-kafka:7.6.0
    ports:
      - "9092:9092"
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: 'broker,controller'
      KAFKA_LISTENERS: 'PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093'
      KAFKA_ADVERTISED_LISTENERS: 'PLAINTEXT://kafka:9092'
      KAFKA_CONTROLLER_LISTENER_NAMES: 'CONTROLLER'
      KAFKA_CONTROLLER_QUORUM_VOTERS: '1@kafka:9093'`,
      },
      {
        filename: 'OrderInspectionChain.java',
        path: 'src/main/java/com/varia/practices/chain/OrderInspectionChain.java',
        language: 'java',
        patternTags: ['#ChainOfResponsibility'],
        content: `package com.varia.practices.chain;

import java.util.List;

public sealed interface InspectionFilter permits RateLimitFilter, BotFingerprintFilter, QuotaFilter {
    void execute(CheckoutContext ctx, FilterChain chain);
}

public final class OrderInspectionChain {
    private final List<InspectionFilter> filters;

    public OrderInspectionChain(List<InspectionFilter> filters) {
        this.filters = List.copyOf(filters);
    }

    public void process(CheckoutContext context) {
        new VirtualFilterChain(filters, 0).doFilter(context);
    }

    private record VirtualFilterChain(List<InspectionFilter> filters, int index) implements FilterChain {
        @Override
        public void doFilter(CheckoutContext ctx) {
            if (index < filters.size()) {
                filters.get(index).execute(ctx, new VirtualFilterChain(filters, index + 1));
            }
        }
    }
}`,
      },
      {
        filename: 'OrderSagaOrchestrator.java',
        path: 'src/main/java/com/varia/practices/saga/OrderSagaOrchestrator.java',
        language: 'java',
        patternTags: ['#Saga', '#TransactionalOutbox'],
        content: `package com.varia.practices.saga;

import java.time.Instant;
import java.util.UUID;

public sealed interface OrderEvent permits OrderCreated, InventoryClaimed, PaymentSettled, OrderFailed {}

public record OrderCreated(UUID orderId, String userId, String skuId, int qty) implements OrderEvent {}
public record InventoryClaimed(UUID orderId) implements OrderEvent {}
public record PaymentSettled(UUID orderId, String receiptId) implements OrderEvent {}
public record OrderFailed(UUID orderId, String reason) implements OrderEvent {}

public class OrderSagaOrchestrator {
    public OrderState processEvent(OrderState current, OrderEvent event) {
        return switch (event) {
            case OrderCreated e -> new OrderState(e.orderId(), OrderStatus.PENDING_INVENTORY, Instant.now());
            case InventoryClaimed e -> new OrderState(e.orderId(), OrderStatus.PENDING_PAYMENT, Instant.now());
            case PaymentSettled e -> new OrderState(e.orderId(), OrderStatus.COMPLETED, Instant.now());
            case OrderFailed e -> new OrderState(e.orderId(), OrderStatus.CANCELLED, Instant.now());
        };
    }
}`,
      },
    ],
    folderStructure: [
      {
        path: 'src/main/java/.../domain',
        name: 'domain',
        layer: 'domain',
        purpose: 'Core Business Entities & State Invariants',
        description:
          'Pure Java 21 records and sealed types modeling Order aggregates, status state machines, and inventory claims. Zero framework imports.',
        patternTags: ['#State'],
        keyFiles: [
          'Order.java — Aggregate root enforcing stock claim invariants',
          'OrderState.java — Sealed state interface modeling pending inventory, pending payment, and completed states',
        ],
      },
      {
        path: 'src/main/java/.../application',
        name: 'application',
        layer: 'application',
        purpose: 'Saga Orchestration & Use Cases',
        description:
          'Coordinates multi-step checkout workflow and compensating rollback transactions if payment fails.',
        patternTags: ['#Saga'],
        keyFiles: [
          'OrderSagaOrchestrator.java — Coordinates Redis inventory reservation, payment gateway, and outbox writes',
          'SubmitOrderUseCase.java — Application service handling the flash sale checkout command pipeline',
        ],
      },
      {
        path: 'src/main/java/.../infrastructure/adapters',
        name: 'infrastructure/adapters',
        layer: 'infrastructure',
        purpose: 'Low-Latency Framework Implementations',
        description:
          'Spring Boot REST controllers, Redis Lua token bucket adapters, and PostgreSQL Transactional Outbox writers.',
        patternTags: ['#ChainOfResponsibility', '#TransactionalOutbox'],
        keyFiles: [
          'OrderInspectionChain.java — Chain of Responsibility verifying rate limit and anti-bot token headers',
          'RedisInventoryClaimAdapter.java — Sub-millisecond atomic inventory decrement via Lua script',
          'PostgresOutboxStore.java — Transactional Outbox pattern writer preventing dual-write bugs',
        ],
      },
      {
        path: 'docker-compose.yml',
        name: 'docker-compose.yml & configs',
        layer: 'configuration',
        purpose: 'Multi-Service Infrastructure Topology',
        description:
          'Declarative container definitions for PostgreSQL 16 Alpine, Redis 7 Alpine, and Kafka message broker.',
        keyFiles: [
          'docker-compose.yml — Multi-container services declaration',
          'application.yml — High-concurrency connection pool configurations',
          'build.gradle — Gradle build script with Java 21 toolchain',
        ],
      },
      {
        path: 'src/test/java',
        name: 'src/test',
        layer: 'tests',
        purpose: 'Concurrent Load & Saga Recovery Tests',
        description:
          'Validates zero-overselling under 100 concurrent threads and tests Saga rollback when payments time out.',
        keyFiles: [
          'ConcurrencyOversellTest.java — Verifies 10,000 threads competing for 50 units never oversell',
          'OrderSagaRollbackTest.java — Verifies stock token is restored to Redis if payment fails',
        ],
      },
    ],
    dockerServices: [
      { name: 'app', image: 'java21-flashsale:latest', port: '8080:8080', purpose: 'Java 21 Spring Boot Web App' },
      { name: 'postgres', image: 'postgres:16-alpine', port: '5432:5432', purpose: 'Transactional Outbox & ACID Order Store' },
      { name: 'redis', image: 'redis:7-alpine', port: '6379:6379', purpose: 'Lua Token Bucket Stock Reservation' },
      { name: 'kafka', image: 'confluentinc/cp-kafka:7.6.0', port: '9092:9092', purpose: 'Distributed Event Streaming' },
    ],
    dockerComposeYaml: `version: '3.8'\nservices:\n  app:\n    image: flashsale-app:latest\n    ports:\n      - "8080:8080"`,
    gradleBuildContent: `plugins { id 'java' }`,
    runCommands: {
      cloneAndNavigate: 'cd practices/java21/ecommerce__marketplace_hyperscale__order_checkout',
      startDocker: 'docker compose up -d',
      runTests: './gradlew test',
      sampleCurlTriggers: [
        {
          name: '1. Flash Sale Concurrent Checkout',
          description: 'Fires an order request into the Virtual Thread ingress gateway.',
          command: 'curl -X POST http://localhost:8080/api/v1/flash-sale/checkout -H "Content-Type: application/json" -d \'{"userId":"usr_001","skuId":"sku_iphone16","qty":1}\'',
        },
        {
          name: '2. Inspect Redis Stock Reservation',
          description: 'Checks the decremented atomic token count in Redis.',
          command: 'docker compose exec redis redis-cli get stock:sku_iphone16',
        },
        {
          name: '3. Query Transactional Outbox',
          description: 'Verifies the event written to the PostgreSQL outbox table.',
          command: 'docker compose exec postgres psql -U varia -d flashsale_db -c "SELECT * FROM outbox_records LIMIT 5;"',
        },
      ],
    },
  },

  {
    id: 'ecommerce__d2c_enterprise__order_checkout',
    domain: 'ecommerce',
    scaleArchetype: 'd2c_enterprise',
    businessCapability: 'order_checkout',
    title: 'Multi-Regional Enterprise Checkout',
    tagline: 'Modular architecture for regional compliance and promotional discounts',
    description:
      'An educational study demonstrating why modular monoliths with classic design patterns are superior to distributed microservices when business rules are complex but traffic is moderate.',
    contextSpec: {
      intent:
        'Structure an enterprise checkout system to seamlessly support varying regional regulations (taxes, currencies, invoices) and dynamic promotional pricing, while maintaining absolute transactional consistency in a single database.',
      businessProblem:
        'A global brand retail store operating across international markets with high average order values, intricate regional tax laws, and frequently changing promotional campaigns.',
      problemStory:
        'Imagine you are building an online checkout system for a global clothing brand operating in North America, Europe, and Asia. Unlike a flash sale where raw concurrency is the main obstacle, here the primary difficulty is business rule complexity.\n\nIn the European Union, Value-Added Tax (VAT) must be calculated differently depending on whether the customer is an individual or a registered business. In the United States, sales tax varies across thousands of state and municipal jurisdictions. Meanwhile, marketing teams frequently introduce combinable promotions: VIP discounts, seasonal coupon codes, and bundle offers.\n\nIf you implement all of this using conditional "if/else" branches inside a single checkout service, the code quickly turns into a tangled mess. Adding tax logic for Japan risks accidentally breaking VAT calculations for Germany. Furthermore, splitting this system into independent microservices with distributed message buses introduces eventual consistency bugs and distributed transaction headaches for a store processing only 500 orders a minute.',
      realWorldScenario:
        'When business logic spans dozens of international markets and marketing promotions, naive monolithic architectures suffer from high regression rates. Every new market launch requires editing monolithic switch statements across multiple files, risking unintended side effects.',
      realWorldAnalogy:
        'Think of a travel power adapter kit. When traveling between countries, you do not purchase and carry completely different electrical appliances for each country. Instead, you plug in a regional adapter module that matches the local wall socket, voltage, and grounding standard. The appliance itself remains completely unchanged. Similarly, our core checkout engine remains untouched while regional tax, currency, and invoice modules are plugged in cleanly.',
      solutionOverview:
        'The architecture uses a clean Modular Monolith backed by three classic design patterns. An Abstract Factory creates a matched family of regional tax, currency, and invoice components for the customer\'s jurisdiction. The Strategy pattern encapsulates each promotional discount algorithm, allowing marketing discounts to be dynamically composed at runtime. The State pattern manages the order lifecycle, preventing invalid actions like refunding an unpaid order. Finally, all steps commit together within a single relational database transaction, ensuring immediate consistency without distributed system overhead.',
      requirements: [
        'Single Transaction Consistency: The order total, applied discounts, tax breakdowns, and inventory allocation must commit together in one atomic database transaction.',
        'Open-Closed Regional Extensibility: Supporting a new regional market must require only adding new class implementations, without modifying existing checkout code.',
        'Composable Promotional Strategies: VIP discounts, coupons, and seasonal sales must be evaluated in a deterministic order without hardcoding rules into the Order entity.',
        'Strict State Lifecycle Integrity: Orders must strictly follow valid lifecycle transitions (such as Draft -> Paid -> Fulfilled), with invalid operations prevented by design.',
      ],
      architecturalDecisions: [
        {
          pattern: 'Abstract Factory',
          decision: 'Regional Compliance Family Generator (Tax, Currency, Invoice)',
          problemSolved:
            'Prevents accidental mismatches between regional calculation and invoicing rules across different jurisdictions.',
          whyChosenOverAlternatives:
            'Alternative Rejected: Global Switch-Case Utility Methods. Why: Adding a new country requires editing centralized conditional blocks, violating the Open-Closed Principle and risking regressions in other countries. Selected Approach: The Abstract Factory guarantees that when a customer\'s jurisdiction is identified, all matching regional components (tax calculator, currency handler, legal invoice generator) are instantiated together as a verified family.',
        },
        {
          pattern: 'Strategy Pattern',
          decision: 'Pluggable Promotional Discount Algorithms',
          problemSolved:
            'Eliminates deeply nested conditionals when marketing teams introduce complex, combinable promotional discount rules.',
          whyChosenOverAlternatives:
            'Alternative Rejected: Hardcoding discount calculations inside the Order service. Why: Every new marketing campaign forces developers to alter and re-test core checkout code. Selected Approach: The Strategy pattern encapsulates each promotion algorithm behind a common interface, allowing new discount rules to be added and reordered at runtime without touching the Order aggregate.',
        },
        {
          pattern: 'State Machine Pattern',
          decision: 'Object-Oriented Order Lifecycle Transitions',
          problemSolved:
            'Enforces business rules on order progression and prevents illegal operations, such as shipping an unpaid order or cancelling an order already delivered.',
          whyChosenOverAlternatives:
            'Alternative Rejected: Raw String/Enum Status Fields with Procedural Mutators. Why: Leads to scattered "if (order.status == \\\'PAID\\\')" checks throughout the codebase that are easily bypassed. Selected Approach: The State pattern encapsulates valid transitions inside dedicated state classes, making invalid transitions impossible at compile time.',
        },
        {
          pattern: 'Unit of Work / Modular Monolith',
          decision: 'Single Relational ACID Transaction Boundary',
          problemSolved:
            'Guarantees immediate zero-drift consistency for high-value orders without the cost and complexity of distributed systems.',
          whyChosenOverAlternatives:
            'Alternative Rejected: Event-Driven Microservices with Distributed Sagas. Why: At 500 to 1,000 requests per minute, distributed sagas add massive cognitive load, eventual consistency confusion for buyers, and difficult troubleshooting for zero actual benefit. Selected Approach: A modular monolith with clear package boundaries and standard relational database transactions provides instant consistency, simple unit testing, and exceptional reliability.',
        },
      ],
      applicability: {
        whenToUse: [
          'Enterprise e-commerce stores with moderate traffic (up to a few thousand requests per minute) but high domain and regulatory complexity.',
          'Platforms operating in multiple countries requiring localized tax compliance, currency formatting, and legal invoicing.',
          'Businesses with dynamic marketing promotions that change frequently without requiring system redeployments.',
        ],
        whenNotToUse: [
          'High-velocity flash sales or viral ticket drops where raw concurrent write throughput demands in-memory claims and event streaming.',
          'Simple single-country stores with one currency and flat sales tax rates, where basic configuration values are sufficient.',
        ],
      },
      tradeOffs: {
        pros: [
          'Immediate Consistency: The customer receives a fully verified order, payment confirmation, and legal tax invoice immediately.',
          'Low Infrastructure Burden: Operates reliably on a single relational database without message brokers, outbox pollers, or distributed tracing.',
          'High Maintainability: Adding new markets or promotion types is isolated to new classes, eliminating regression risks in existing markets.',
        ],
        cons: [
          'Throughput Ceiling: Primary relational database write locks cap maximum checkout throughput to standard database capacity (~1,000 requests/sec).',
          'Synchronous Ingress Coupling: If external payment processor APIs experience latency spikes, the customer\'s checkout request must wait.',
        ],
      },
    },
    scaleMetrics: {
      throughput: '500–1,000 req/sec',
      concurrency: 'Moderate, high shopping cart complexity',
      consistency: 'Immediate ACID Consistency (Single Database Unit of Work)',
      deploymentModel: 'Hexagonal Modular Monolith',
    },
    patternsUsed: [
      {
        name: 'Abstract Factory',
        category: 'creational',
        guruUrl: 'https://refactoring.guru/design-patterns/abstract-factory',
        summary: 'Produces regional-compliant tax, currency, and invoice generators (e.g. EU vs US).',
      },
      {
        name: 'Strategy',
        category: 'behavioral',
        guruUrl: 'https://refactoring.guru/design-patterns/strategy',
        summary: 'Calculates dynamic basket discounts (VIP tiers, promo coupons, buy-1-get-1).',
      },
      {
        name: 'State',
        category: 'behavioral',
        guruUrl: 'https://refactoring.guru/design-patterns/state',
        summary: 'Enforces strict valid domain transitions for order processing and refunds.',
      },
      {
        name: 'Decorator',
        category: 'structural',
        guruUrl: 'https://refactoring.guru/design-patterns/decorator',
        summary: 'Wraps order calculations with audit logging, currency conversion, and caching.',
      },
      {
        name: 'Unit of Work',
        category: 'architectural',
        summary: 'Coordinates atomic DB commit of order lines, inventory decrement, and audit log.',
      },
    ],
    nodes: [
      {
        id: 'node-d2c-ctrl',
        label: 'Checkout Inbound Port',
        subLabel: 'REST Controller',
        kind: 'interface_port',
        x: 10,
        y: 50,
        detail: {
          role: 'Hexagonal Boundary Controller',
          className: 'CheckoutApiController',
          contextJustification:
            'Translates inbound HTTP JSON checkout payloads into typed domain commands, isolating domain entities from web transport concerns.',
          receives: 'HTTP POST /api/orders { country, vipStatus, items }',
          emits: 'PlaceOrderCommand to domain checkout use case',
          tradeOffs: [
            'Requires dedicated DTO-to-Command mapping layer, but shields core domain rules from web framework changes.',
          ],
          javaSnippet: `@RestController
@RequestMapping("/api/orders")
public class CheckoutApiController {
  private final CheckoutOrderUseCase checkoutUseCase;

  @PostMapping
  public OrderSummaryDTO checkout(@RequestBody PlaceOrderDTO dto) {
    return checkoutUseCase.execute(dto.toCommand());
  }
}`,
        },
      },
      {
        id: 'node-region-factory',
        label: 'Regional Compliance Factory',
        subLabel: 'Abstract Factory Pattern',
        kind: 'pattern_anchor',
        patternTag: '#AbstractFactory',
        x: 32,
        y: 25,
        detail: {
          role: 'Regional Engine Family Creator',
          className: 'RegionalEngineFactory',
          pattern: {
            name: 'Abstract Factory',
            category: 'creational',
            guruUrl: 'https://refactoring.guru/design-patterns/abstract-factory',
            summary: 'Provides an interface for creating families of related regional tax, currency, and invoice objects without specifying concrete classes.',
          },
          contextJustification:
            'Ensures that when a regional jurisdiction (e.g. Germany / EU) is identified, all matching local tax, currency, and invoice generators are instantiated together as a verified family.',
          receives: 'Customer destination jurisdiction (e.g. CountryCode "DE")',
          emits: 'RegionalEngineFamily containing EuVatCalculator, EurSettler, and EuStandardInvoice',
          tradeOffs: [
            'Adding a new regional product family interface requires updating all concrete factory classes.',
          ],
          javaSnippet: `public interface RegionalEngineFactory {
  TaxCalculator createTaxCalculator();
  InvoiceGenerator createInvoiceGenerator();
  CurrencySettler createCurrencySettler();
}

public class EuropeanUnionEngineFactory implements RegionalEngineFactory {
  public TaxCalculator createTaxCalculator() { return new EuVatCalculator(); }
  public InvoiceGenerator createInvoiceGenerator() { return new EuStandardInvoice(); }
  public CurrencySettler createCurrencySettler() { return new EurSettler(); }
}`,
        },
      },
      {
        id: 'node-discount-strategy',
        label: 'Promotional Discount Engine',
        subLabel: 'Strategy Pattern',
        kind: 'pattern_anchor',
        patternTag: '#Strategy',
        x: 32,
        y: 75,
        detail: {
          role: 'Pluggable Discount Strategy Evaluator',
          className: 'DiscountStrategyEngine',
          pattern: {
            name: 'Strategy',
            category: 'behavioral',
            guruUrl: 'https://refactoring.guru/design-patterns/strategy',
            summary: 'Defines a family of discount algorithms, encapsulates each one, and makes them interchangeable.',
          },
          contextJustification:
            'Allows marketing promotions (VIP tier, seasonal coupon, volume discount) to be evaluated and combined dynamically at runtime without modifying the Order aggregate.',
          receives: 'OrderCart subtotal and active promo codes',
          emits: 'AppliedDiscount result detailing price deduction and promotional audit trail',
          tradeOffs: [
            'Calling code must determine and maintain the priority execution order between competing discount strategies.',
          ],
          javaSnippet: `public interface DiscountStrategy {
  BigDecimal applyDiscount(OrderCart cart);
}

public class VipTierDiscountStrategy implements DiscountStrategy {
  @Override
  public BigDecimal applyDiscount(OrderCart cart) {
    return cart.isVip() ? cart.subtotal().multiply(BigDecimal.valueOf(0.15)) : BigDecimal.ZERO;
  }
}`,
        },
      },
      {
        id: 'node-order-state',
        label: 'Order Lifecycle State Machine',
        subLabel: 'State Machine Pattern',
        kind: 'pattern_anchor',
        patternTag: '#State',
        x: 58,
        y: 50,
        detail: {
          role: 'Domain State Guard & Transition Manager',
          className: 'OrderStateMachine',
          pattern: {
            name: 'State',
            category: 'behavioral',
            guruUrl: 'https://refactoring.guru/design-patterns/state',
            summary: 'Allows an order to alter its behavior when its internal lifecycle state changes.',
          },
          contextJustification:
            'Enforces domain invariants (such as preventing shipments on unpaid orders, or forbidding cancellations on completed orders) via explicit state objects.',
          receives: 'Transition command (e.g. AuthorizeOrderCommand with tax and discount breakdowns)',
          emits: 'Updated immutable OrderState sealed with total invoice amount, or throws IllegalStateTransition',
          tradeOffs: [
            'Increases the number of domain classes, as each distinct lifecycle state is represented by its own class.',
          ],
          javaSnippet: `public sealed interface OrderState permits DraftState, PaidState, ShippedState, CancelledState {
  OrderState pay(Order order, PaymentReceipt receipt);
  OrderState ship(Order order, TrackingNumber tracking);
  OrderState cancel(Order order, String reason);
}`,
        },
      },
      {
        id: 'node-unit-of-work',
        label: 'PostgreSQL Unit of Work',
        subLabel: 'ACID Relational Boundary',
        kind: 'infrastructure_service',
        x: 85,
        y: 50,
        detail: {
          role: 'Single ACID Database Consistency Boundary',
          className: 'JpaOrderRepositoryAdapter',
          contextJustification:
            'Coordinates the atomic persistence of the order record, line items, inventory deduction, and tax breakdown within a single relational database transaction.',
          receives: 'Fully authorized and sealed Order aggregate',
          emits: 'Committed database transaction and OrderReceipt',
          tradeOffs: [
            'Maximum throughput is constrained by the primary database write capacity (~1,000 req/s), which is well suited for enterprise D2C but not viral flash sales.',
          ],
          javaSnippet: `@Transactional(isolation = Isolation.READ_COMMITTED)
public OrderReceipt finalizeOrder(Order order) {
  inventoryRepository.decrement(order.items());
  orderRepository.save(order);
  auditRepository.log("Order finalized: " + order.id());
  return new OrderReceipt(order.id(), order.totalPrice());
}`,
        },
      },
    ],
    edges: [
      { id: 'd1', source: 'node-d2c-ctrl', target: 'node-region-factory', label: '1. Resolve Market Family' },
      { id: 'd2', source: 'node-d2c-ctrl', target: 'node-discount-strategy', label: '2. Evaluate Promotions' },
      { id: 'd3', source: 'node-region-factory', target: 'node-order-state', label: '3. Calculate Regional Taxes' },
      { id: 'd4', source: 'node-discount-strategy', target: 'node-order-state', label: '4. Apply Net Reductions' },
      { id: 'd5', source: 'node-order-state', target: 'node-unit-of-work', label: '5. Atomic ACID Commit' },
    ],
    simulationSteps: [
      {
        stepNumber: 1,
        title: 'Customer Submits European Order',
        description:
          'A customer in Berlin submits an order for $350 in merchandise with a VIP discount code attached.',
        activeNodeIds: ['node-d2c-ctrl'],
        activeEdgeIds: [],
        dataPayloadSnippet: `{ "country": "DE", "vipStatus": true, "items": [{ "sku": "NIKE-AIR-42", "price": 350.00 }] }`,
      },
      {
        stepNumber: 2,
        title: 'Abstract Factory Resolves Regional Family',
        description:
          'The factory inspects the customer destination and instantiates the German VAT calculator (19% MwSt) and EUR currency handler.',
        activeNodeIds: ['node-region-factory'],
        activeEdgeIds: ['d1'],
        dataPayloadSnippet: `Factory Resolved: EuropeanUnionEngineFactory -> [EuVatCalculator (19%), EurSettler]`,
      },
      {
        stepNumber: 3,
        title: 'Strategy Engine Evaluates VIP Discount',
        description:
          'The Strategy pattern executes the VIP Tier algorithm, calculating a 15% discount on the cart subtotal.',
        activeNodeIds: ['node-discount-strategy'],
        activeEdgeIds: ['d2'],
        dataPayloadSnippet: `Strategy: VipTierDiscountStrategy -> Subtotal: $350.00, Discount: -$52.50, Net: $297.50`,
      },
      {
        stepNumber: 4,
        title: 'Order State Transitions to Authorized',
        description:
          'The State machine validates the state change from DRAFT to AUTHORIZED and seals the calculated tax and net totals.',
        activeNodeIds: ['node-order-state'],
        activeEdgeIds: ['d3', 'd4'],
        dataPayloadSnippet: `Order Lifecycle Transition: [DRAFT] -> [AUTHORIZED] (Final Total: €354.03 incl. 19% VAT)`,
      },
      {
        stepNumber: 5,
        title: 'Atomic Database Unit of Work Commit',
        description:
          'The database transaction decrements physical inventory and commits the order record and legal tax lines in one atomic ACID operation.',
        activeNodeIds: ['node-unit-of-work'],
        activeEdgeIds: ['d5'],
        dataPayloadSnippet: `COMMIT TRANSACTION;\nUPDATE inventory SET qty = qty - 1 WHERE sku = 'NIKE-AIR-42';\nINSERT INTO orders (id, total, status) VALUES ('ORD-991', 354.03, 'PAID');`,
      },
    ],
    codeFiles: [
      {
        filename: 'build.gradle',
        path: 'build.gradle',
        language: 'groovy',
        content: `plugins {
    id 'java'
    id 'org.springframework.boot' version '3.3.4'
    id 'io.spring.dependency-management' version '1.1.6'
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    runtimeOnly 'org.postgresql:postgresql'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}`,
      },
      {
        filename: 'docker-compose.yml',
        path: 'docker-compose.yml',
        language: 'yaml',
        content: `version: '3.8'

services:
  d2c-app:
    build: .
    ports:
      - "8081:8081"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://d2c-postgres:5432/d2c_store
    depends_on:
      - d2c-postgres

  d2c-postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: d2c_store
      POSTGRES_USER: varia
      POSTGRES_PASSWORD: varia_secret
    ports:
      - "5433:5432"`,
      },
    ],
    folderStructure: [
      {
        path: 'src/main/java/.../domain',
        name: 'domain',
        layer: 'domain',
        purpose: 'Core Entities, State Machine & Strategy Interfaces',
        description:
          'Pure Java 21 domain classes modeling shopping carts, monetary values, and regional rules. Free of framework annotations.',
        patternTags: ['#State', '#Strategy'],
        keyFiles: [
          'Order.java — Aggregate root maintaining basket items and valid status transitions',
          'OrderState.java — Sealed state interface modeling Draft, Validated, Paid, and Cancelled',
          'DiscountStrategy.java — Interface for pluggable promotional discount calculations',
          'Money.java — Immutable record guarding multi-currency rounding invariants',
        ],
      },
      {
        path: 'src/main/java/.../application',
        name: 'application',
        layer: 'application',
        purpose: 'Use Cases & Application Orchestration',
        description:
          'Executes checkout commands, queries regional engine factories, and applies discount strategies in a clear transaction boundary.',
        patternTags: ['#UnitOfWork'],
        keyFiles: [
          'CheckoutOrderUseCase.java — Coordinates discount evaluation, tax calculation, and payment authorization',
          'CalculateTaxesUseCase.java — Queries the regional factory to compute localized VAT/GST',
        ],
      },
      {
        path: 'src/main/java/.../infrastructure/regional',
        name: 'infrastructure/regional',
        layer: 'infrastructure',
        purpose: 'Abstract Factory Regional Implementations',
        description:
          'Concrete implementations of RegionalEngineFactory ensuring regional compliance for tax, invoice formats, and currency settlement.',
        patternTags: ['#AbstractFactory'],
        keyFiles: [
          'RegionalEngineFactory.java — Abstract factory contract for regional engine families',
          'EuropeanUnionEngineFactory.java — Creates EU VAT calculator and standard EU invoice generator',
          'NorthAmericaEngineFactory.java — Creates US state sales tax calculator and USD settler',
        ],
      },
      {
        path: 'src/main/java/.../infrastructure/decorators',
        name: 'infrastructure/decorators',
        layer: 'infrastructure',
        purpose: 'Structural Decorators & Cross-Cutting Calculations',
        description:
          'Wraps core checkout price calculations with audit logging, currency exchange conversion, and discount caching.',
        patternTags: ['#Decorator'],
        keyFiles: [
          'LoggingOrderCalculatorDecorator.java — Logs every promotional step to the compliance audit log',
          'CurrencyConversionDecorator.java — Converts line items and totals to buyer currency in real-time',
        ],
      },
      {
        path: 'src/main/java/.../infrastructure/persistence',
        name: 'infrastructure/persistence',
        layer: 'infrastructure',
        purpose: 'Relational Database Persistence (Unit of Work)',
        description:
          'Spring Data JPA repositories providing atomic unit of work commits for orders, line items, and audit journals in a single ACID transaction.',
        patternTags: ['#UnitOfWork'],
        keyFiles: [
          'PostgresOrderRepository.java — Enforces atomic writes to the order ledger',
          'OrderEntity.java — JPA entity mapping domain aggregate to database tables',
        ],
      },
      {
        path: 'docker-compose.yml',
        name: 'docker-compose.yml & configs',
        layer: 'configuration',
        purpose: 'PostgreSQL 16 & Mock Stubs',
        description:
          'Runs PostgreSQL 16 Alpine with pre-configured schemas alongside WireMock stubs for regional payment providers.',
        keyFiles: [
          'docker-compose.yml — Multi-container services declaration',
          'application.yml — Spring Boot local profile settings',
          'build.gradle — Gradle build script with Java 21 toolchain',
        ],
      },
      {
        path: 'src/test/java',
        name: 'src/test',
        layer: 'tests',
        purpose: 'Unit & Testcontainers Verification',
        description:
          'Tests promotional calculations with combinations of strategies, validates state machine transitions, and runs real PostgreSQL tests via Testcontainers.',
        keyFiles: [
          'MultiRegionalCheckoutTest.java — Validates tax and invoice generation across EU and US markets',
          'OrderStateTransitionTest.java — Verifies invalid state jumps (e.g. Draft -> Shipped) are prevented',
        ],
      },
    ],
    dockerServices: [
      { name: 'd2c-app', image: 'd2c-brand-app:latest', port: '8081:8081', purpose: 'Spring Boot D2C Monolith' },
      { name: 'd2c-postgres', image: 'postgres:16-alpine', port: '5433:5432', purpose: 'ACID Relational Database' },
    ],
    dockerComposeYaml: `version: '3.8'\nservices:\n  d2c-app:\n    image: d2c-brand-app:latest`,
    gradleBuildContent: `plugins { id 'java' }`,
    runCommands: {
      cloneAndNavigate: 'cd practices/java21/ecommerce__d2c_enterprise__order_checkout',
      startDocker: 'docker compose up -d',
      runTests: './gradlew test',
      sampleCurlTriggers: [
        {
          name: '1. Place D2C Order with Promo Code',
          description: 'Submits a checkout with regional tax and VIP discount.',
          command: 'curl -X POST http://localhost:8081/api/orders -H "Content-Type: application/json" -d \'{"country":"DE","vipStatus":true,"items":[{"sku":"NIKE-AIR-42","price":350}]}\'',
        },
      ],
    },
  },
];
