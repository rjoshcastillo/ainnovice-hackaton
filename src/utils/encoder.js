export function oneHotEncode(value, categories) {
  const index = categories.indexOf(value);
  return categories.map((_, i) => (i === index ? 1 : 0));
}