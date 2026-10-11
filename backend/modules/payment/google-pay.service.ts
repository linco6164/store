import crypto from "crypto";

type JsonRecord = Record<string, any>;

export interface GooglePayBuyerData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface GooglePayAddressData {
  city: string;
  county: string;
  postalCode?: string;
  details: string;
}

export interface GooglePayProductData {
  name: string;
  code: string;
  category: string;
  price: number;
}

export interface StartGooglePayInput {
  paymentId: string;
  providerOrderId: string;
  amount: number;
  currency: string;
  gatewayToken: string;
  notifyUrl: string;
  redirectUrl: string;
  buyer: GooglePayBuyerData;
  address: GooglePayAddressData;
  product: GooglePayProductData;
  userAgent?: string;
  ipAddress?: string;
}

function requiredEnv(name: string): string {
  const value = String(process.env[name] ?? "").trim();

  if (!value) {
    throw new Error(`GOOGLE_PAY_CONFIG_MISSING:${name}`);
  }

  return value;
}

function isRecord(value: unknown): value is JsonRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

class GooglePayService {
  isSandbox(): boolean {
    return String(process.env.NETOPIA_SANDBOX ?? "true").toLowerCase() !== "false";
  }

  getConfiguration() {
    const gatewayMerchantId = stringValue(
      process.env.NETOPIA_GOOGLE_PAY_MERCHANT_ID,
    ) || requiredEnv("NETOPIA_SIGNATURE");
    const googleMerchantId = stringValue(process.env.GOOGLE_PAY_MERCHANT_ID);

    if (!this.isSandbox() && !googleMerchantId) {
      throw new Error("GOOGLE_PAY_CONFIG_MISSING:GOOGLE_PAY_MERCHANT_ID");
    }

    return {
      provider: "google_pay",
      data: {
        environment: this.isSandbox() ? "TEST" : "PRODUCTION",
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
          {
            type: "CARD",
            tokenizationSpecification: {
              type: "PAYMENT_GATEWAY",
              parameters: {
                gateway: "netopia",
                gatewayMerchantId,
              },
            },
            parameters: {
              allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
              allowedCardNetworks: ["MASTERCARD", "VISA"],
              billingAddressRequired: true,
              billingAddressParameters: {
                format: "FULL",
                phoneNumberRequired: true,
              },
              assuranceDetailsRequired: true,
            },
          },
        ],
        merchantInfo: {
          merchantName:
            stringValue(process.env.GOOGLE_PAY_MERCHANT_NAME) || "Nexora Store",
          ...(googleMerchantId ? { merchantId: googleMerchantId } : {}),
        },
        transactionInfo: {
          countryCode: "RO",
          currencyCode: "RON",
          totalPriceStatus: "FINAL",
        },
      },
    };
  }

  extractGatewayToken(paymentData: unknown): string {
    if (!isRecord(paymentData)) {
      throw new Error("INVALID_GOOGLE_PAY_DATA");
    }

    const paymentMethodData = paymentData.paymentMethodData;
    const tokenizationData = isRecord(paymentMethodData)
      ? paymentMethodData.tokenizationData
      : undefined;
    const token = isRecord(tokenizationData)
      ? stringValue(tokenizationData.token)
      : "";

    if (!token || token.length > 100_000) {
      throw new Error("INVALID_GOOGLE_PAY_TOKEN");
    }

    return token;
  }

  createActionState(paymentId: string, providerOrderId: string): string {
    return crypto
      .createHmac("sha256", requiredEnv("NETOPIA_API_KEY"))
      .update(`${paymentId}:${providerOrderId}`)
      .digest("hex");
  }

  verifyActionState(
    paymentId: string,
    providerOrderId: string,
    state: string,
  ): boolean {
    if (!/^[a-f0-9]{64}$/i.test(state)) {
      return false;
    }

    const expected = this.createActionState(paymentId, providerOrderId);
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(state, "hex"),
    );
  }

  async startPayment(input: StartGooglePayInput): Promise<JsonRecord> {
    return this.postNetopia("/payment/card/start", {
      config: {
        emailTemplate: "confirm",
        notifyUrl: input.notifyUrl,
        redirectUrl: input.redirectUrl,
        language: "ro",
      },
      payment: {
        options: {
          installments: 1,
          bonus: 0,
        },
        instrument: {
          type: "card",
          token: input.gatewayToken,
        },
        data: {
          BROWSER_USER_AGENT: input.userAgent ?? "",
          OS: "",
          OS_VERSION: "",
          MOBILE: "false",
          IP_ADDRESS: input.ipAddress ?? "",
        },
      },
      order: {
        ntpID: "",
        posSignature: requiredEnv("NETOPIA_SIGNATURE"),
        dateTime: new Date().toISOString(),
        description: `Nexora Store - ${input.product.name}`,
        orderID: input.providerOrderId,
        amount: input.amount,
        currency: input.currency,
        billing: this.netopiaContact(input.buyer, input.address),
        shipping: this.netopiaContact(input.buyer, input.address),
        products: [
          {
            name: input.product.name,
            code: input.product.code,
            category: input.product.category,
            price: input.product.price,
            vat: 0,
          },
        ],
        installments: {
          selected: 1,
          available: [0],
        },
        data: {
          paymentMethod: "google_pay",
          buyerId: input.buyer.id,
          paymentId: input.paymentId,
        },
      },
    });
  }

  async verifyAuthentication(input: {
    authenticationToken: string;
    ntpId: string;
    paRes: string;
  }): Promise<JsonRecord> {
    if (
      !input.authenticationToken ||
      !input.ntpId ||
      !input.paRes ||
      input.paRes.length > 100_000
    ) {
      throw new Error("INVALID_GOOGLE_PAY_3DS_RESPONSE");
    }

    return this.postNetopia("/payment/card/verify-auth", {
      authenticationToken: input.authenticationToken,
      ntpID: input.ntpId,
      formData: {
        paRes: input.paRes,
      },
    });
  }

  unwrapResponse(response: unknown): JsonRecord {
    if (!isRecord(response)) {
      throw new Error("NETOPIA_GOOGLE_PAY_INVALID_RESPONSE");
    }

    return isRecord(response.data) ? response.data : response;
  }

  private netopiaContact(
    buyer: GooglePayBuyerData,
    address: GooglePayAddressData,
  ) {
    return {
      email: buyer.email,
      phone: buyer.phone || "0000000000",
      firstName: buyer.firstName,
      lastName: buyer.lastName,
      city: address.city,
      country: 642,
      state: address.county,
      postalCode: address.postalCode ?? "",
      details: address.details,
    };
  }

  private async postNetopia(
    path: string,
    body: JsonRecord,
  ): Promise<JsonRecord> {
    const baseUrl = this.isSandbox()
      ? "https://secure.sandbox.netopia-payments.com"
      : "https://secure.mobilpay.ro/pay";

    let response: globalThis.Response;

    try {
      response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: {
          Authorization: requiredEnv("NETOPIA_API_KEY"),
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(20_000),
      });
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        throw new Error("NETOPIA_GOOGLE_PAY_TIMEOUT");
      }

      throw new Error("NETOPIA_GOOGLE_PAY_UNAVAILABLE");
    }

    const responseText = await response.text();
    let decoded: unknown;

    try {
      decoded = responseText ? JSON.parse(responseText) : {};
    } catch (_) {
      throw new Error("NETOPIA_GOOGLE_PAY_INVALID_RESPONSE");
    }

    if (!response.ok || !isRecord(decoded)) {
      throw new Error(`NETOPIA_GOOGLE_PAY_HTTP_${response.status}`);
    }

    return decoded;
  }
}

export const googlePayService = new GooglePayService();
