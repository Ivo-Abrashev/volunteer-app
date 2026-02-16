export function convertSofiaToUTC(dateString) {
  const date = new Date(dateString);
  return date.toISOString();
}