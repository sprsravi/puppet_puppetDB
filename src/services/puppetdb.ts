const PUPPETDB_URL = import.meta.env.VITE_PUPPETDB_URL || 'http://localhost:8082';

export interface PuppetNode {
  certname: string;
  deactivated: string | null;
  expired: string | null;
  catalog_timestamp: string;
  facts_timestamp: string;
  report_timestamp: string;
  catalog_environment: string;
  facts_environment: string;
  report_environment: string;
  latest_report_status: string;
  latest_report_noop: boolean;
  latest_report_noop_pending: boolean;
  latest_report_hash: string;
  cached_catalog_status: string;
}

export interface PuppetReport {
  certname: string;
  hash: string;
  environment: string;
  status: string;
  noop: boolean;
  noop_pending: boolean;
  puppet_version: string;
  report_format: number;
  configuration_version: string;
  start_time: string;
  end_time: string;
  producer_timestamp: string;
  producer: string;
  transaction_uuid: string;
  catalog_uuid: string;
  code_id: string | null;
  cached_catalog_status: string;
  resources?: PuppetResource[];
  metrics?: Record<string, unknown>;
  logs?: PuppetLog[];
}

export interface PuppetResource {
  resource_type: string;
  resource_title: string;
  containment_path: string[];
  file: string | null;
  line: number | null;
  tags: string[];
  events: PuppetEvent[];
}

export interface PuppetEvent {
  status: string;
  timestamp: string;
  property: string | null;
  new_value: unknown;
  old_value: unknown;
  message: string | null;
}

export interface PuppetLog {
  level: string;
  message: string;
  source: string;
  tags: string[];
  timestamp: string;
}

export interface PuppetFact {
  certname: string;
  name: string;
  value: unknown;
  environment: string;
}

export interface NodeFacts {
  certname: string;
  environment: string;
  values: Record<string, unknown>;
  timestamp: string;
  producer_timestamp: string;
  producer: string;
}

class PuppetDBService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async query(endpoint: string, params?: Record<string, string>): Promise<unknown> {
    const url = new URL(`${this.baseUrl}/pdb/query/v4${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`PuppetDB query failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getNodes(): Promise<PuppetNode[]> {
    return this.query('/nodes') as Promise<PuppetNode[]>;
  }

  async getNode(certname: string): Promise<PuppetNode> {
    const nodes = await this.query('/nodes', {
      query: JSON.stringify(['=', 'certname', certname])
    }) as PuppetNode[];

    if (!nodes || nodes.length === 0) {
      throw new Error(`Node ${certname} not found`);
    }

    return nodes[0];
  }

  async getReports(limit: number = 100): Promise<PuppetReport[]> {
    return this.query('/reports', {
      limit: limit.toString(),
      'order_by': JSON.stringify([{ field: 'producer_timestamp', order: 'desc' }])
    }) as Promise<PuppetReport[]>;
  }

  async getNodeReports(certname: string, limit: number = 50): Promise<PuppetReport[]> {
    return this.query('/reports', {
      query: JSON.stringify(['=', 'certname', certname]),
      limit: limit.toString(),
      'order_by': JSON.stringify([{ field: 'producer_timestamp', order: 'desc' }])
    }) as Promise<PuppetReport[]>;
  }

  async getReport(hash: string): Promise<PuppetReport> {
    const reports = await this.query('/reports', {
      query: JSON.stringify(['=', 'hash', hash])
    }) as PuppetReport[];

    if (!reports || reports.length === 0) {
      throw new Error(`Report ${hash} not found`);
    }

    return reports[0];
  }

  async getFacts(certname?: string): Promise<PuppetFact[]> {
    if (certname) {
      return this.query('/facts', {
        query: JSON.stringify(['=', 'certname', certname])
      }) as Promise<PuppetFact[]>;
    }
    return this.query('/facts') as Promise<PuppetFact[]>;
  }

  async getNodeFacts(certname: string): Promise<NodeFacts> {
    const facts = await this.query('/nodes', {
      query: JSON.stringify(['=', 'certname', certname])
    }) as PuppetNode[];

    if (!facts || facts.length === 0) {
      throw new Error(`Facts for node ${certname} not found`);
    }

    const factValues = await this.query('/facts', {
      query: JSON.stringify(['=', 'certname', certname])
    }) as PuppetFact[];

    const values: Record<string, unknown> = {};
    factValues.forEach(fact => {
      values[fact.name] = fact.value;
    });

    return {
      certname,
      environment: facts[0].facts_environment,
      values,
      timestamp: facts[0].facts_timestamp,
      producer_timestamp: facts[0].facts_timestamp,
      producer: certname,
    };
  }

  async getFactNames(): Promise<string[]> {
    const result = await this.query('/fact-names') as { name: string }[];
    return result.map(item => item.name);
  }

  async searchFacts(factName: string, factValue?: string): Promise<PuppetFact[]> {
    let query;
    if (factValue) {
      query = JSON.stringify(['and',
        ['=', 'name', factName],
        ['~', 'value', factValue]
      ]);
    } else {
      query = JSON.stringify(['=', 'name', factName]);
    }

    return this.query('/facts', { query }) as Promise<PuppetFact[]>;
  }

  async executeQuery(queryString: string): Promise<unknown> {
    return this.query('/nodes', { query: queryString });
  }

  async getEnvironments(): Promise<string[]> {
    const result = await this.query('/environments') as { name: string }[];
    return result.map(env => env.name);
  }

  async getMetrics(): Promise<Record<string, unknown>> {
    const response = await fetch(`${this.baseUrl}/metrics/v1/mbeans`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Metrics query failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const puppetDB = new PuppetDBService(PUPPETDB_URL);
