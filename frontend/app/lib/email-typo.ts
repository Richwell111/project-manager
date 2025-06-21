import fuzzysort from "fuzzysort";

const commonDomains = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "icloud.com",
  "hotmail.com",
  "aol.com",
  "protonmail.com",
  "live.com",
];

export function isEmailTypo(email: string): string | null {
  const parts = email.split("@");
  if (parts.length !== 2) return null;

  const domain = parts[1];
  const result = fuzzysort.go(domain, commonDomains, {
    threshold: -1000, // Adjust sensitivity
    limit: 1,
  });

  if (
    result.total > 0 &&
    result[0].score < -10 &&
    result[0].target !== domain
  ) {
    return `${parts[0]}@${result[0].target}`;
  }

  return null;
}
