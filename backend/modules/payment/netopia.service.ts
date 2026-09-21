import crypto from "crypto";
import fs from "fs";
import path from "path";
import { XMLParser } from "fast-xml-parser";
import forge from "node-forge";

export interface NetopiaCheckoutData {
  orderId: string;
  amount: number;
  currency: string;
  details: string;
  confirmUrl: string;
  returnUrl: string;
  billing: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    city?: string;
    county?: string;
    postalCode?: string;
    country?: string;
  };
}

export interface DecryptedNotification {
  orderId: string;
  ntpId?: string;
  action?: string;
  errorCode: number;
  errorMessage?: string;
  processedAmount?: number;
  currency?: string;
  raw: Record<string, unknown>;
}

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value || !value.trim()) {
    throw new Error(`Lipsește variabila de mediu ${name}.`);
  }

  return value.trim();
}

function resolveConfiguredPath(value: string): string {
  return path.isAbsolute(value) ? value : path.resolve(process.cwd(), value);
}

function xmlEscape(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Citește certificatul public NETOPIA.
 *
 * Sunt acceptate:
 * 1. NETOPIA_PUBLIC_KEY cu certificatul PEM direct
 * 2. NETOPIA_PUBLIC_KEY_PATH cu certificatul PEM direct
 * 3. NETOPIA_PUBLIC_KEY_PATH ca path către un fișier
 */
function readPublicCertificate(): string {
  const direct =
    process.env.NETOPIA_PUBLIC_KEY?.trim() ||
    process.env.NETOPIA_PUBLIC_KEY_PATH?.trim();

  if (!direct) {
    throw new Error(
      "Lipsește NETOPIA_PUBLIC_KEY sau NETOPIA_PUBLIC_KEY_PATH din environment.",
    );
  }

  // Render poate păstra \n ca text literal.
  const value = direct.replace(/\\n/g, "\n").trim();

  // Certificatul/cheia este introdus direct în environment.
  if (
    value.includes("-----BEGIN CERTIFICATE-----") ||
    value.includes("-----BEGIN PUBLIC KEY-----") ||
    value.includes("-----BEGIN RSA PUBLIC KEY-----")
  ) {
    return value;
  }

  // Dacă nu este PEM, îl tratăm ca path către fișier.
  const resolvedPath = resolveConfiguredPath(value);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(
      `NETOPIA public certificate/key nu există la calea: ${resolvedPath}`,
    );
  }

  return fs.readFileSync(resolvedPath, "utf8").replace(/\\n/g, "\n").trim();
}

/**
 * Extrage cheia publică utilizabilă de crypto.publicEncrypt()
 * din certificatul X.509 NETOPIA.
 *
 * Important:
 * NETOPIA_PUBLIC_KEY poate fi:
 *
 * -----BEGIN CERTIFICATE-----
 * ...
 * -----END CERTIFICATE-----
 *
 * crypto.publicEncrypt() nu trebuie să primească certificatul
 * în forma brută; extragem cheia publică SPKI din certificat.
 */
function getPublicKeyFromCertificate(certificate: string): string {
  const normalized = certificate.replace(/\\n/g, "\n").trim();

  if (normalized.includes("-----BEGIN CERTIFICATE-----")) {
    try {
      return crypto
        .createPublicKey(normalized)
        .export({
          type: "spki",
          format: "pem",
        })
        .toString();
    } catch (error) {
      throw new Error(
        `Certificatul public NETOPIA nu poate fi decodat: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  // Dacă avem deja o cheie publică PEM, o folosim direct.
  if (
    normalized.includes("-----BEGIN PUBLIC KEY-----") ||
    normalized.includes("-----BEGIN RSA PUBLIC KEY-----")
  ) {
    return normalized;
  }

  throw new Error(
    "NETOPIA_PUBLIC_KEY nu este un certificat sau o cheie publică PEM validă.",
  );
}

/**
 * Citește cheia privată NETOPIA.
 *
 * Sunt acceptate:
 * - NETOPIA_PRIVATE_KEY
 * - NETOPIA_PRIVATE_KEY_PATH
 * - PEM direct
 * - path către fișier
 */
function readPrivateKey(): string {
  const direct =
    process.env.NETOPIA_PRIVATE_KEY?.trim() ||
    process.env.NETOPIA_PRIVATE_KEY_PATH?.trim();

  if (!direct) {
    throw new Error(
      "Lipsește NETOPIA_PRIVATE_KEY sau NETOPIA_PRIVATE_KEY_PATH din environment.",
    );
  }

  const value = direct.replace(/\\n/g, "\n").trim();

  // Cheia este introdusă direct în environment.
  if (
    value.includes("-----BEGIN PRIVATE KEY-----") ||
    value.includes("-----BEGIN RSA PRIVATE KEY-----") ||
    value.includes("-----BEGIN EC PRIVATE KEY-----")
  ) {
    return value;
  }

  // Dacă nu este PEM, o tratăm ca path.
  const resolvedPath = resolveConfiguredPath(value);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`NETOPIA private key nu există la calea: ${resolvedPath}`);
  }

  return fs.readFileSync(resolvedPath, "utf8").replace(/\\n/g, "\n").trim();
}

function formatNetopiaTimestamp(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");

  return (
    `${date.getFullYear()}` +
    `${pad(date.getMonth() + 1)}` +
    `${pad(date.getDate())}` +
    `${pad(date.getHours())}` +
    `${pad(date.getMinutes())}` +
    `${pad(date.getSeconds())}`
  );
}

/**
 * Creează envelope-ul criptat pentru NETOPIA.
 *
 * AES-256-CBC:
 * - criptează XML-ul
 *
 * RSA:
 * - criptează cheia AES folosind cheia publică NETOPIA
 */
function encryptEnvelope(xml: string) {
  const aesKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);

  const encryptedData = Buffer.concat([
    cipher.update(Buffer.from(xml, "utf8")),
    cipher.final(),
  ]);

  // Citim certificatul public.
  const certificate = readPublicCertificate();

  // IMPORTANT:
  // Dacă avem BEGIN CERTIFICATE, extragem cheia publică
  // înainte de crypto.publicEncrypt().
  const publicKey = getPublicKeyFromCertificate(certificate);

  const encryptedKey = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    aesKey,
  );

  return {
    env_key: encryptedKey.toString("base64"),
    data: encryptedData.toString("base64"),
    cipher: "aes-256-cbc",
    iv: iv.toString("base64"),
  };
}

function decryptEnvelope(
  envKeyBase64: string,
  dataBase64: string,
  cipherName: string | undefined,
  ivBase64: string | undefined,
): string {
  if (!envKeyBase64 || !dataBase64) {
    throw new Error("Răspuns NETOPIA incomplet: lipsesc env_key/data.");
  }

  const privateKey = readPrivateKey();

  const encryptedData = Buffer.from(dataBase64, "base64");

  const forgePrivateKey = forge.pki.privateKeyFromPem(privateKey);

  const aesKeyBytes = forgePrivateKey.decrypt(
    forge.util.decode64(envKeyBase64),
    "RSAES-PKCS1-V1_5",
  );

  const aesKey = Buffer.from(aesKeyBytes, "binary");

  const normalizedCipher = (cipherName ?? "aes-256-cbc").toLowerCase();

  if (normalizedCipher !== "aes-256-cbc") {
    throw new Error(
      `Cipher NETOPIA nesuportat: ${cipherName ?? "necunoscut"}.`,
    );
  }

  if (!ivBase64) {
    throw new Error("NETOPIA nu a trimis IV pentru AES-256-CBC.");
  }

  const iv = Buffer.from(ivBase64, "base64");

  const decipher = crypto.createDecipheriv("aes-256-cbc", aesKey, iv);

  return Buffer.concat([
    decipher.update(encryptedData),
    decipher.final(),
  ]).toString("utf8");
}

function buildCardXml(data: NetopiaCheckoutData): string {
  const amount = data.amount.toFixed(2);

  const timestamp = formatNetopiaTimestamp();

  const address = data.billing.address ?? "";
  const city = data.billing.city ?? "";
  const county = data.billing.county ?? "";
  const postalCode = data.billing.postalCode ?? "";
  const country = data.billing.country ?? "RO";
  const phone = data.billing.phone ?? "";

  return `<?xml version="1.0" encoding="utf-8"?>
<order
  type="card"
  id="${xmlEscape(data.orderId)}"
  timestamp="${xmlEscape(timestamp)}"
>
  <signature>${xmlEscape(requiredEnv("NETOPIA_SIGNATURE"))}</signature>

  <url>
    <confirm>${xmlEscape(data.confirmUrl)}</confirm>
    <return>${xmlEscape(data.returnUrl)}</return>
  </url>

  <invoice
    currency="${xmlEscape(data.currency)}"
    amount="${xmlEscape(amount)}"
  >
    <details>${xmlEscape(data.details)}</details>

    <contact_info>
      <billing type="person">
        <first_name>${xmlEscape(data.billing.firstName)}</first_name>

        <last_name>${xmlEscape(data.billing.lastName)}</last_name>

        <country>${xmlEscape(country)}</country>

        <county>${xmlEscape(county)}</county>

        <city>${xmlEscape(city)}</city>

        <zip_code>${xmlEscape(postalCode)}</zip_code>

        <address>${xmlEscape(address)}</address>

        <email>${xmlEscape(data.billing.email)}</email>

        <mobile_phone>${xmlEscape(phone)}</mobile_phone>
      </billing>
    </contact_info>
  </invoice>

  <ipn_cipher>aes-256-cbc</ipn_cipher>
</order>`;
}

function findFirstValue(object: Record<string, any>, keys: string[]): unknown {
  for (const key of keys) {
    if (object[key] !== undefined && object[key] !== null) {
      return object[key];
    }
  }

  return undefined;
}

function deepFind(object: unknown, keys: string[]): unknown {
  if (!object || typeof object !== "object") {
    return undefined;
  }

  const record = object as Record<string, unknown>;

  const direct = findFirstValue(record as Record<string, any>, keys);

  if (direct !== undefined) {
    return direct;
  }

  for (const value of Object.values(record)) {
    const found = deepFind(value, keys);

    if (found !== undefined) {
      return found;
    }
  }

  return undefined;
}

class NetopiaService {
  private getGatewayUrl(): string {
    const sandbox =
      String(process.env.NETOPIA_SANDBOX ?? "true").toLowerCase() === "true";

    return sandbox
      ? "https://sandboxsecure.mobilpay.ro"
      : "https://secure.mobilpay.ro";
  }

  createCheckoutEnvelope(data: NetopiaCheckoutData) {
    const xml = buildCardXml(data);

    const envelope = encryptEnvelope(xml);

    return {
      gatewayUrl: this.getGatewayUrl(),
      ...envelope,
    };
  }

  decryptNotification(input: {
    envKey: string;
    data: string;
    cipher?: string;
    iv?: string;
  }): DecryptedNotification {
    const xml = decryptEnvelope(
      input.envKey,
      input.data,
      input.cipher,
      input.iv,
    );

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
    });

    const parsed = parser.parse(xml);

    const root =
      (parsed.notify as Record<string, unknown> | undefined) ??
      (parsed.order as Record<string, unknown> | undefined) ??
      parsed;

    const orderId = String(
      deepFind(root, ["@_id", "orderId", "orderID", "purchaseId"]) ?? "",
    );

    const ntpIdValue = deepFind(root, ["ntpID", "ntpId", "rrn"]);

    const actionValue = deepFind(root, ["action"]);

    const errorCodeValue = deepFind(root, ["errorCode", "error_code"]);

    const errorMessageValue = deepFind(root, ["errorMessage", "error_message"]);

    const processedAmountValue = deepFind(root, [
      "processedAmount",
      "processed_amount",
    ]);

    const currencyValue = deepFind(root, ["currency"]);

    const errorCode = Number(errorCodeValue ?? 0);

    const processedAmount = Number(processedAmountValue);

    if (!orderId) {
      throw new Error("Notificarea NETOPIA nu conține orderId.");
    }

    return {
      orderId,

      ntpId: ntpIdValue !== undefined ? String(ntpIdValue) : undefined,

      action: actionValue !== undefined ? String(actionValue) : undefined,

      errorCode: Number.isFinite(errorCode) ? errorCode : 0,

      errorMessage:
        errorMessageValue !== undefined ? String(errorMessageValue) : undefined,

      processedAmount: Number.isFinite(processedAmount)
        ? processedAmount
        : undefined,

      currency: currencyValue !== undefined ? String(currencyValue) : undefined,

      raw: parsed,
    };
  }

  buildConfirmResponse(options: {
    errorType: number;
    errorCode: number;
    message: string;
  }): string {
    const message = xmlEscape(options.message);

    if (options.errorCode === 0) {
      return `<?xml version="1.0" encoding="utf-8"?><crc>${message}</crc>`;
    }

    return `<?xml version="1.0" encoding="utf-8"?><crc error_type="${options.errorType}" error_code="${options.errorCode}">${message}</crc>`;
  }
}

export const netopiaService = new NetopiaService();
