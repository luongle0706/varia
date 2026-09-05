/**
 * Core types for Varia Design Pattern & Architecture Studio.
 */

export type ScaleArchetype =
  | 'd2c_enterprise'
  | 'marketplace_hyperscale'
  | 'regulated_core'
  | 'b2b_multi_tenant';

export type DomainCategory =
  | 'ecommerce'
  | 'fintech'
  | 'logistics'
  | 'saas_workflow'
  | 'analytics';

export type DesignPatternCategory =
  | 'creational'
  | 'structural'
  | 'behavioral'
  | 'architectural';

export type NodeKind =
  | 'interface_port'
  | 'concrete_class'
  | 'pattern_anchor'
  | 'infrastructure_service'
  | 'external_gateway';

export interface PatternReference {
  name: string;
  category: DesignPatternCategory;
  guruSlug?: string;
  guruUrl?: string;
  summary: string;
}

export interface NodeDetail {
  role: string;
  pattern?: PatternReference;
  contextJustification: string;
  tradeOffs: string[];
  javaSnippet: string;
  filePath?: string;
  className?: string;
  receives?: string;
  emits?: string;
}

export interface ScenarioFlowNode {
  id: string;
  label: string;
  subLabel?: string;
  kind: NodeKind;
  patternTag?: string;
  x: number; // 0-100 percentage for responsive canvas
  y: number; // 0-100 percentage
  width?: number;
  height?: number;
  detail: NodeDetail;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  style?: 'solid' | 'dashed' | 'pulse';
}

export interface FlowSimulationStep {
  stepNumber: number;
  title: string;
  description: string;
  activeNodeIds: string[];
  activeEdgeIds: string[];
  dataPayloadSnippet?: string;
}

export interface CodeFileEntry {
  path: string;
  filename: string;
  language: 'java' | 'groovy' | 'yaml' | 'sql' | 'bash';
  content: string;
  patternTags?: string[];
}

export interface DockerServiceMeta {
  name: string;
  image: string;
  port: string;
  purpose: string;
}

export interface FolderExplanationNode {
  path: string;
  name: string;
  layer: 'domain' | 'application' | 'infrastructure' | 'configuration' | 'tests' | 'scripts';
  purpose: string;
  description: string;
  patternTags?: string[];
  keyFiles?: string[];
}

export interface ArchitectureDecision {
  pattern: string;
  decision: string;
  problemSolved: string;
  whyChosenOverAlternatives: string;
}

export interface ScenarioContextSpec {
  intent?: string;
  businessProblem: string;
  problemStory?: string;
  realWorldScenario: string;
  realWorldAnalogy?: string;
  solutionOverview?: string;
  requirements: string[];
  architecturalDecisions: ArchitectureDecision[];
  applicability?: {
    whenToUse: string[];
    whenNotToUse: string[];
  };
  tradeOffs: {
    pros: string[];
    cons: string[];
  };
}

export interface ScenarioManifest {
  id: string; // e.g. ecommerce__marketplace_hyperscale__order_checkout
  domain: DomainCategory;
  scaleArchetype: ScaleArchetype;
  businessCapability: string;
  title: string;
  tagline: string;
  description: string;
  scaleMetrics?: {
    throughput: string;
    concurrency: string;
    consistency: string;
    deploymentModel: string;
  };
  contextSpec?: ScenarioContextSpec;
  patternsUsed: PatternReference[];
  nodes: ScenarioFlowNode[];
  edges: FlowEdge[];
  simulationSteps: FlowSimulationStep[];
  codeFiles: CodeFileEntry[];
  folderStructure?: FolderExplanationNode[];
  dockerServices: DockerServiceMeta[];
  dockerComposeYaml: string;
  gradleBuildContent: string;
  runCommands: {
    cloneAndNavigate: string;
    startDocker: string;
    runTests: string;
    sampleCurlTriggers: Array<{
      name: string;
      description: string;
      command: string;
    }>;
  };
}

export interface ScenarioFilter {
  domain?: DomainCategory | 'all';
  scale?: ScaleArchetype | 'all';
  searchQuery?: string;
}

/**
 * Validates whether a scenario ID matches the mandatory naming rule:
 * [Domain]__[Scale_Archetype]__[Business_Capability]
 */
export function validateScenarioId(id: string): boolean {
  const pattern = /^[a-z0-9]+__[a-z0-9_]+__[a-z0-9_]+$/;
  return pattern.test(id);
}

/**
 * Parses a scenario ID into its constituent components.
 */
export function parseScenarioId(id: string): {
  domain: string;
  scaleArchetype: string;
  businessCapability: string;
} | null {
  if (!validateScenarioId(id)) return null;
  const parts = id.split('__');
  return {
    domain: parts[0] ?? '',
    scaleArchetype: parts[1] ?? '',
    businessCapability: parts[2] ?? '',
  };
}
