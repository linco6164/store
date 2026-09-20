import axios from "axios";

const SMSLINK_URL =
  "https://secure.smslink.ro/sms/gateway/communicate/json.php";

export async function sendSms(
  phone: string,
  message: string,
) {
  const connectionId = process.env.SMSLINK_CONNECTION_ID;
  const password = process.env.SMSLINK_PASSWORD;

  if (!connectionId) {
    throw new Error("SMSLINK_CONNECTION_ID nu este configurat.");
  }

  if (!password) {
    throw new Error("SMSLINK_PASSWORD nu este configurat.");
  }

  try {
    const response = await axios.post(
      SMSLINK_URL,
      {
        connection_id: connectionId,
        password,
        to: phone,
        message,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 15000,
      },
    );

    console.log("📱 SMSLink response:", response.data);

    return response.data;
  } catch (error: any) {
    console.error(
      "❌ SMSLink error:",
      error?.response?.data || error?.message || error,
    );

    throw new Error("SMS-ul nu a putut fi trimis.");
  }
}