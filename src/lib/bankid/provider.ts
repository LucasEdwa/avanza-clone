import "server-only";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import https from "node:https";

export type StartResponse = { orderRef: string; autoStartToken: string; qrStartToken: string; qrStartSecret: string };
export type CollectResponse = {
  orderRef: string;
  status: "pending" | "failed" | "complete";
  hintCode?: string;
  completionData?: {
    user: { personalNumber: string; name: string; givenName: string; surname: string };
    device?: { ipAddress: string };
    signature?: string;
    ocspResponse?: string;
  };
};

export type StartParams = {
  endUserIp: string;
  userVisibleData?: string; // markdown (simpleMarkdownV1)
  personalNumber?: string;
};

export interface BankIdProvider {
  mode: "simulator" | "test";
  auth(p: StartParams): Promise<StartResponse>;
  sign(p: StartParams & { userVisibleData: string }): Promise<StartResponse>;
  /** For the simulator the collect result is read from the DB in the service layer. */
  collect(orderRef: string): Promise<CollectResponse | null>;
  cancel(orderRef: string): Promise<void>;
}

export class BankIdError extends Error {
  constructor(
    public errorCode: string,
    public details?: string,
  ) {
    super(`${errorCode}${details ? `: ${details}` : ""}`);
  }
}

// ---------- Simulator: generates the same tokens as the real API ----------
class SimulatorProvider implements BankIdProvider {
  mode = "simulator" as const;
  async auth(): Promise<StartResponse> {
    return { orderRef: randomUUID(), autoStartToken: randomUUID(), qrStartToken: randomUUID(), qrStartSecret: randomUUID() };
  }
  async sign(): Promise<StartResponse> {
    return this.auth();
  }
  async collect() {
    return null;
  }
  async cancel() {}
}

// ---------- Real BankID test environment (RP API v6, mutual TLS) ----------
class TestEnvProvider implements BankIdProvider {
  mode = "test" as const;
  private agent: https.Agent;
  private base: string;

  constructor() {
    const pfxPath = process.env.BANKID_PFX_PATH;
    if (!pfxPath) throw new Error("BANKID_PFX_PATH saknas för BANKID_MODE=test");
    this.base = process.env.BANKID_API_URL ?? "https://appapi2.test.bankid.com/rp/v6.0";
    this.agent = new https.Agent({
      pfx: readFileSync(pfxPath),
      passphrase: process.env.BANKID_PFX_PASSPHRASE ?? "qwerty123",
      ca: process.env.BANKID_CA_PATH ? readFileSync(process.env.BANKID_CA_PATH) : undefined,
      keepAlive: true,
    });
  }

  private call<T>(path: string, body: unknown): Promise<T> {
    const url = new URL(this.base + path);
    const data = JSON.stringify(body);
    return new Promise((resolve, reject) => {
      const req = https.request(
        url,
        {
          method: "POST",
          agent: this.agent,
          headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) },
          timeout: 10000,
        },
        (res) => {
          let buf = "";
          res.on("data", (c) => (buf += c));
          res.on("end", () => {
            const json = buf ? JSON.parse(buf) : {};
            if ((res.statusCode ?? 500) >= 400) reject(new BankIdError(json.errorCode ?? "internalError", json.details));
            else resolve(json as T);
          });
        },
      );
      req.on("error", reject);
      req.on("timeout", () => req.destroy(new BankIdError("requestTimeout")));
      req.end(data);
    });
  }

  private body(p: StartParams) {
    return {
      endUserIp: p.endUserIp,
      ...(p.userVisibleData
        ? { userVisibleData: Buffer.from(p.userVisibleData, "utf8").toString("base64"), userVisibleDataFormat: "simpleMarkdownV1" }
        : {}),
      ...(p.personalNumber ? { requirement: { personalNumber: p.personalNumber } } : {}),
    };
  }

  auth(p: StartParams) {
    return this.call<StartResponse>("/auth", this.body(p));
  }
  sign(p: StartParams & { userVisibleData: string }) {
    return this.call<StartResponse>("/sign", this.body(p));
  }
  collect(orderRef: string) {
    return this.call<CollectResponse>("/collect", { orderRef });
  }
  async cancel(orderRef: string) {
    await this.call("/cancel", { orderRef }).catch(() => {});
  }
}

let provider: BankIdProvider | null = null;
export function getProvider(): BankIdProvider {
  if (!provider) provider = process.env.BANKID_MODE === "test" ? new TestEnvProvider() : new SimulatorProvider();
  return provider;
}
