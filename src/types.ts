export interface GraphNode {
  id: string;
  title: string;
  phase: number;
  dependsOn: string[];
  requiresArtifacts: string[];
}

export interface GraphDocument {
  nodes: GraphNode[];
}
