// utils/paymentUtils.ts

import { string } from "@metaplex-foundation/umi/serializers";
import { PublicKey } from "@solana/web3.js";

export interface PaymentForm {
  amount: string;
  label: string;
  message: string;
  email: string;
  memo: string;
  merchant_wallet_address: string;
  redirectUrl: string;
}

export interface PaymentSubmissionData
  extends Omit<PaymentForm, "amount" | "merchant_wallet_address"> {
  amount: number;
  merchant_wallet_address: string;
  loyalty: string | null;
}

/**
 * Validates the payment form data
 * @param form - The form data to validate
 * @param isConnected - Whether the wallet is connected
 * @returns Object with isValid boolean and error message if invalid
 */
export const validatePaymentForm = (
  form: PaymentForm,
  isConnected: boolean
): { isValid: boolean; error: string } => {
  console.log("🔍 Validating payment form...");

  if (!form.amount || parseFloat(form.amount) <= 0) {
    console.log("❌ Validation failed: Invalid amount");
    return {
      isValid: false,
      error: "Please enter a valid amount greater than 0",
    };
  }

  if (!form.label.trim()) {
    console.log("❌ Validation failed: Missing label");
    return {
      isValid: false,
      error: "Please enter a merchant organization name",
    };
  }

  if (!form.message.trim()) {
    console.log("❌ Validation failed: Missing message");
    return { isValid: false, error: "Please enter a message" };
  }

  if (!form.memo.trim()) {
    console.log("❌ Validation failed: Missing memo");
    return { isValid: false, error: "Please enter a memo" };
  }

  if (!form.email.trim()) {
    console.log("❌ Validation failed: Missing email");
    return { isValid: false, error: "Please enter email" };
  }

  if (!form.redirectUrl.trim()) {
    console.log("❌ Validation failed: Missing redirect URL");
    return { isValid: false, error: "Please enter a redirect URL" };
  }

  if (!isConnected) {
    console.log("❌ Connect wallet");
    return { isValid: false, error: "Connect your wallet" };
  }

  // Validate URL format
  try {
    new URL(form.redirectUrl);
  } catch {
    console.log("❌ Validation failed: Invalid URL format");
    return { isValid: false, error: "Please enter a valid redirect URL" };
  }

  console.log("✅ Payment form validation passed");
  return { isValid: true, error: "" };
};

/**
 * Handles wallet connection
 * @param openWallet - Function to open the wallet connection modal
 * @param setError - Function to set error state
 */
export const handleWalletConnect = (
  openWallet: () => void,
  setError: (error: string) => void
): void => {
  console.log("🔗 Attempting to connect wallet...");
  try {
    openWallet();
    console.log("✅ Wallet connection modal opened");
  } catch (err) {
    console.error("❌ Failed to open wallet connection:", err);
    setError("Failed to open wallet connection");
  }
};

/**
 * Handles file upload for loyalty JSON
 * @param file - The uploaded file
 * @param setLoyaltyJson - Function to set loyalty JSON state
 * @param setSuccess - Function to set success message
 * @param setError - Function to set error message
 */
export const handleLoyaltyFileUpload = (
  file: File,
  setLoyaltyJson: (json: any) => void,
  setSuccess: (message: string) => void,
  setError: (error: string) => void
): void => {
  console.log("📁 File upload initiated...");
  console.log("📄 File selected:", file.name, "Size:", file.size, "bytes");

  const reader = new FileReader();

  reader.onload = (event) => {
    try {
      const result = event.target?.result;
      if (typeof result === "string") {
        const json = JSON.parse(result);
        setLoyaltyJson(json);
        setSuccess("JSON file uploaded successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        console.error("❌ File could not be read as text");
        setError("File could not be read as text.");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      console.error("❌ Invalid JSON file:", err);
      setError("Invalid JSON file. Please check the format.");
      setTimeout(() => setError(""), 3000);
    }
  };

  reader.onerror = (err) => {
    console.error("❌ File reading error:", err);
    setError("Failed to read the file. Please try again.");
    setTimeout(() => setError(""), 3000);
  };

  reader.readAsText(file);
};

/**
 * Submits payment data to create a payment link
 * @param form - The payment form data
 * @param address - The wallet address:
 * @param loyaltyJson - Optional loyalty JSON data
 * @param showUpload - Whether loyalty upload is enabled
 * @returns Promise with the API response data
 */
export interface SubmissionData {
  amount: number;
  message: string;
  memo: string;
  reference: string;
  merchant_wallet_address: string;
}
export const submitPayment = async (
  memo: string,
  amount: number,
  message: string,
  reference: string,
  address: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  const submissionData: SubmissionData = {
    amount: amount,
    message: message,
    memo: memo,
    reference: reference,
    merchant_wallet_address: address,
  };

  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submissionData),
  });

  console.log("📡 API Response status:", res.status);

  const data = await res.json();
  console.log("📡 API Response data:", data);

  return { success: true, data };
};

export const submitPaymentData = async (
  form: PaymentForm,
  address: string,
  loyaltyJson: any,
  showUpload: boolean
): Promise<{ success: boolean; data?: any; error?: string }> => {
  console.log("🚀 Payment link generation started...");
  console.log("📤 Sending payment data:", form);

  try {
    const submissionData: PaymentSubmissionData = {
      amount: parseFloat(form.amount),
      label: form.label,
      message: form.message,
      email: form.email,
      memo: form.memo,
      merchant_wallet_address: address,
      redirectUrl: form.redirectUrl,
      loyalty: showUpload ? JSON.stringify(loyaltyJson) : null,
    };

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submissionData),
    });

    console.log("📡 API Response status:", res.status);

    const data = await res.json();
    console.log("📡 API Response data:", data);

    if (!res.ok || !data.success) {
      const errorMsg = data.error || "Failed to create payment link";
      console.error("❌ Payment link creation failed:", errorMsg);
      return { success: false, error: errorMsg };
    } else {
      console.log("✅ Payment link created successfully:", data.id);
      return { success: true, data };
    }
  } catch (err) {
    console.error("❌ Network/API error:", err);
    return {
      success: false,
      error:
        "Something went wrong. Please check your connection and try again.",
    };
  }
};

/**
 * Copies text to clipboard
 * @param text - The text to copy
 * @param setCopied - Function to set copied state
 * @param setSuccess - Function to set success message
 * @param setError - Function to set error message
 */
export const copyToClipboard = async (
  text: string,
  setCopied: (copied: boolean) => void
): Promise<void> => {
  console.log("📋 Attempting to copy link to clipboard...");
  try {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    console.log("✅ Link copied to clipboard successfully");

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  } catch (err) {
    console.error("❌ Failed to copy link to clipboard:", err);
  }
};

/**
 * Downloads QR code as PNG image
 * @param canvasId - The ID of the QR code canvas element
 * @param filename - The filename for the downloaded image (default: "qrcode.png")
 */
export const downloadQRCode = (
  canvasId: string,
  filename: string = "qrcode.png"
): void => {
  console.log("📥 Downloading QR code...");
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) {
    console.error("❌ QR code canvas not found");
    return;
  }

  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  console.log("✅ QR code downloaded successfully");
};
