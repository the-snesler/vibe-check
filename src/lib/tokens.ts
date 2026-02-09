function generateToken(byteLength: number = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function generateSessionId(): string {
  return generateToken(32);
}

export function generateApiKey(): string {
  return `sk_${generateToken(24)}`;
}

export function generateOverlandToken(): string {
  return `ol_${generateToken(24)}`;
}
