import { createSign } from "crypto";
import { LoginType } from "../login-types";

/**
 * Node.js signature function using crypto module
 * Signs a message with RSA-SHA256 for Node.js environments
 */
export const signMessage = (
  clientId: string,
  loginType: LoginType,
  account: string,
  privateKey: string
): {
  signature: string;
  timestamp: number;
} => {
  const timestamp = Date.now();
  const message = `${loginType}|${account}|${clientId}|${timestamp}`;

  const privateKeyBuffer = Buffer.from(privateKey, "base64");
  const sign = createSign("RSA-SHA256");
  sign.update(message);
  const signature = sign.sign({
    key: privateKeyBuffer,
    format: "der",
    type: "pkcs1",
  });

  return {
    signature: signature.toString("base64"),
    timestamp: timestamp,
  };
};
