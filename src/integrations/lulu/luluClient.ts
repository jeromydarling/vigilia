/**
 * luluClient — Lulu Print API client for seasonal journal printing.
 *
 * WHAT: Creates print jobs, uploads PDFs, tracks fulfillment via Lulu's REST API.
 * WHERE: Called by the lulu-create-print-job edge function after PDF generation.
 * WHY: "Generate a print-ready PDF for each resident at each liturgical season,
 *       push it through a POD API, ship directly to family."
 *
 * Lulu API docs: https://developers.lulu.com/
 * - REST API with OAuth2
 * - Webhooks for order status
 * - No minimum runs
 * - White-label fulfillment
 * - Free API access, no service fees
 *
 * Credentials: configured via environment variables in Lovable/Supabase.
 */

const LULU_API_BASE = 'https://api.lulu.com';
const LULU_SANDBOX_BASE = 'https://api.sandbox.lulu.com';

export interface LuluConfig {
  apiKey: string;
  apiSecret: string;
  sandbox?: boolean;
}

export interface ShippingAddress {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  stateCode: string;
  postcode: string;
  countryCode: string;
  phoneNumber?: string;
  email?: string;
}

export interface PrintJobSpec {
  /** Title shown on spine/cover (for Lulu internal, not printed on saddle-stitch) */
  title: string;
  /** URL of the uploaded interior PDF */
  interiorUrl: string;
  /** URL of the uploaded cover PDF (if separate) */
  coverUrl?: string;
  /** Shipping destination */
  shippingAddress: ShippingAddress;
  /** Quantity to print */
  quantity: number;
}

export interface LuluOrderResponse {
  id: string;
  status: string;
  lineItems: Array<{
    id: string;
    title: string;
    quantity: number;
    status: string;
  }>;
  shippingAddress: ShippingAddress;
  createdAt: string;
}

/**
 * Lulu Print API client.
 * Handles authentication, PDF upload, order creation, and status tracking.
 */
export class LuluClient {
  private baseUrl: string;
  private apiKey: string;
  private apiSecret: string;
  private accessToken: string | null = null;

  constructor(config: LuluConfig) {
    this.baseUrl = config.sandbox ? LULU_SANDBOX_BASE : LULU_API_BASE;
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
  }

  /**
   * Authenticate with Lulu API (OAuth2 client credentials).
   */
  async authenticate(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/realms/glasstree/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.apiKey,
        client_secret: this.apiSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`Lulu auth failed: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
  }

  private getHeaders(): HeadersInit {
    if (!this.accessToken) throw new Error('Not authenticated. Call authenticate() first.');
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Create a print job for a seasonal journal.
   *
   * Spec: 5.5"×8.5", saddle-stitched, B&W interior, matte cover
   * Lulu pod_package_id for digest booklet: "0425X0687" (5.5x8.5 saddle stitch)
   */
  async createPrintJob(spec: PrintJobSpec): Promise<LuluOrderResponse> {
    await this.authenticate();

    const orderPayload = {
      line_items: [
        {
          title: spec.title,
          quantity: spec.quantity,
          // Lulu product specification for 5.5"x8.5" saddle-stitched booklet
          pod_package_id: '0425X0687BWSTDSS060UW444MXX',
          interior: {
            source_url: spec.interiorUrl,
            color: 'BW', // Black & white
            source_type: 'PDF',
          },
          cover: spec.coverUrl ? {
            source_url: spec.coverUrl,
            source_type: 'PDF',
          } : undefined,
        },
      ],
      shipping_address: {
        name: spec.shippingAddress.name,
        street1: spec.shippingAddress.street1,
        street2: spec.shippingAddress.street2 || '',
        city: spec.shippingAddress.city,
        state_code: spec.shippingAddress.stateCode,
        postcode: spec.shippingAddress.postcode,
        country_code: spec.shippingAddress.countryCode,
        phone_number: spec.shippingAddress.phoneNumber || '',
        email: spec.shippingAddress.email || '',
      },
      shipping_level: 'MAIL', // Standard mail (cheapest)
    };

    const response = await fetch(`${this.baseUrl}/print-jobs/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lulu create print job failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      status: data.status?.name || 'CREATED',
      lineItems: (data.line_items || []).map((li: any) => ({
        id: li.id,
        title: li.title,
        quantity: li.quantity,
        status: li.status?.name || 'CREATED',
      })),
      shippingAddress: spec.shippingAddress,
      createdAt: data.date_created || new Date().toISOString(),
    };
  }

  /**
   * Get the status of an existing print job.
   */
  async getPrintJobStatus(printJobId: string): Promise<LuluOrderResponse> {
    await this.authenticate();

    const response = await fetch(`${this.baseUrl}/print-jobs/${printJobId}/`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Lulu get status failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      status: data.status?.name || 'UNKNOWN',
      lineItems: (data.line_items || []).map((li: any) => ({
        id: li.id,
        title: li.title,
        quantity: li.quantity,
        status: li.status?.name || 'UNKNOWN',
      })),
      shippingAddress: data.shipping_address,
      createdAt: data.date_created,
    };
  }

  /**
   * Get shipping cost estimate for a print job.
   */
  async getShippingEstimate(
    countryCode: string,
    quantity: number,
  ): Promise<{ currency: string; totalCost: number }> {
    await this.authenticate();

    const response = await fetch(`${this.baseUrl}/print-job-cost-calculations/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        line_items: [{
          pod_package_id: '0425X0687BWSTDSS060UW444MXX',
          page_count: 24,
          quantity,
        }],
        shipping_address: { country_code: countryCode },
        shipping_level: 'MAIL',
      }),
    });

    if (!response.ok) {
      throw new Error(`Lulu cost estimate failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      currency: data.currency || 'USD',
      totalCost: parseFloat(data.total_cost_excl_tax || '0'),
    };
  }
}

/**
 * Create a Lulu client from environment variables.
 * In production (Lovable/Supabase), these are set as secrets.
 */
export function createLuluClient(sandbox = false): LuluClient {
  const apiKey = typeof process !== 'undefined'
    ? process.env.LULU_API_KEY || ''
    : '';
  const apiSecret = typeof process !== 'undefined'
    ? process.env.LULU_API_SECRET || ''
    : '';

  return new LuluClient({ apiKey, apiSecret, sandbox });
}
