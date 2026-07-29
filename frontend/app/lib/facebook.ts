declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

let sdkPromise: Promise<void> | null = null;

export function loadFacebookSDK() {
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<void>((resolve, reject) => {
    console.log("Loading Facebook SDK...");

    window.fbAsyncInit = function () {
      console.log("fbAsyncInit called");

      window.FB.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
        cookie: true,
        xfbml: false,
        version: "v24.0",
      });

      console.log("FB.init completed");
      resolve();
    };

    const existing = document.getElementById("facebook-jssdk");

    if (existing) {
      console.log("SDK script already exists");
      return;
    }

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log("sdk.js loaded");
    };

    script.onerror = () => {
      reject(new Error("Failed to load SDK"));
    };

    document.body.appendChild(script);
  });

  return sdkPromise;
}