import { describe, it, expect } from 'vitest';
import { validateScenarioId, parseScenarioId, type ScenarioManifest } from '../src/patterns/index.js';

describe('Design Pattern & Architecture Contracts', () => {
  describe('validateScenarioId', () => {
    it('accepts compliant scenario IDs with domain, archetype and capability', () => {
      expect(validateScenarioId('ecommerce__d2c_enterprise__order_checkout')).toBe(true);
      expect(validateScenarioId('ecommerce__marketplace_hyperscale__order_checkout')).toBe(true);
      expect(validateScenarioId('fintech__regulated_core__double_entry_ledger')).toBe(true);
    });

    it('rejects invalid or non-conformant scenario IDs', () => {
      expect(validateScenarioId('ecommerce_order_checkout')).toBe(false); // single underscore
      expect(validateScenarioId('ecommerce__order')).toBe(false); // missing capability
      expect(validateScenarioId('Ecommerce__D2C__Order')).toBe(false); // uppercase
      expect(validateScenarioId('')).toBe(false);
    });
  });

  describe('parseScenarioId', () => {
    it('correctly parses compliant scenario IDs', () => {
      const parsed = parseScenarioId('ecommerce__marketplace_hyperscale__order_checkout');
      expect(parsed).toEqual({
        domain: 'ecommerce',
        scaleArchetype: 'marketplace_hyperscale',
        businessCapability: 'order_checkout',
      });
    });

    it('returns null for non-compliant IDs', () => {
      expect(parseScenarioId('invalid-scenario-id')).toBeNull();
    });
  });

  describe('ScenarioManifest structure integrity', () => {
    it('allows constructing a valid ScenarioManifest object', () => {
      const sample: ScenarioManifest = {
        id: 'ecommerce__d2c_enterprise__order_checkout',
        domain: 'ecommerce',
        scaleArchetype: 'd2c_enterprise',
        businessCapability: 'order_checkout',
        title: 'Nike/Uniqlo D2C Checkout',
        tagline: 'Rich Domain Model & ACID Order Processing',
        description: 'Demonstrates Abstract Factory, Strategy, and State.',
        scaleMetrics: {
          throughput: '500 req/s',
          concurrency: 'Low-to-Medium',
          consistency: 'Immediate ACID',
          deploymentModel: 'Hexagonal Modular Monolith',
        },
        patternsUsed: [
          {
            name: 'Strategy',
            category: 'behavioral',
            summary: 'Dynamic promotional discount engine',
          },
        ],
        nodes: [
          {
            id: 'node-checkout-ctrl',
            label: 'Checkout Controller',
            kind: 'interface_port',
            x: 10,
            y: 50,
            detail: {
              role: 'Inbound HTTP Port',
              contextJustification: 'Hexagonal inbound adapter for REST payload mapping.',
              tradeOffs: ['Adds layer indirection but decouples HTTP transport.'],
              javaSnippet: 'public record CheckoutRequest(String cartId) {}',
            },
          },
        ],
        edges: [],
        simulationSteps: [],
        codeFiles: [],
        dockerServices: [],
        dockerComposeYaml: 'version: "3.8"',
        gradleBuildContent: 'plugins { id "java" }',
        runCommands: {
          cloneAndNavigate: 'cd practices/java21/scenario',
          startDocker: 'docker compose up -d',
          runTests: './gradlew test',
          sampleCurlTriggers: [],
        },
      };

      expect(sample.id).toBe('ecommerce__d2c_enterprise__order_checkout');
      expect(sample.patternsUsed.length).toBe(1);
      expect(sample.nodes[0]?.kind).toBe('interface_port');
    });
  });
});
