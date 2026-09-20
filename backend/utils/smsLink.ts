import axios from "axios";

const SMSLINK_URL =
  "https://secure.smslink.ro/sms/gateway/communicate/json.php";

interface SendSmsOptions {
  test?: boolean;
}

export async function sendSms(
  phone: string,
  message: string,
  options: SendSmsOptions = {},
) {
  const connectionId = process.env.SMSLINK_CONNECTION_ID;
  const password = process.env.SMSLINK_PASSWORD;

  if (!connectionId) {
    throw new Error("SMSLINK_CONNECTION_ID nu este configurat.");
  }

  if (!password) {
    throw new Error("SMSLINK_PASSWORD nu este configurat.");
  }

  const response = await axios.post(
    SMSLINK_URL,
    {
      connection_id: connectionId,
      password,
      to: phone,
      message,
      test: options.test ? 1 : 0,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 15000,
    },
  );

  console.log("📱 SMSLink:", response.data);

  if (response.data?.response_type === "ERROR") {
    throw new Error(
      response.data?.response_message ||
        "SMSLink a returnat o eroare.",
    );
  }

  return response.data;
}