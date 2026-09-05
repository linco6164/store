import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.emanuel200.mobile",
        sha256_cert_fingerprints: [
          "B2:89:91:21:8D:EF:90:D7:48:A7:04:27:B7:3F:27:CA:8A:F2:7D:2B:5E:B7:B4:E9:A4:D5:85:C4:A2:AD:26:17"
        ]
      }
    }
  ]);
}