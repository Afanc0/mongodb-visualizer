export function stringToJson(input: string): Record<string, any> {
  const result: Record<string, any> = {};
  const pairs = input.split(';').filter(Boolean); // remove empty strings from trailing ;

  for (const pair of pairs) {
    const [key, rawValue] = pair.split('=');
    if (key && rawValue !== undefined) {
      const cleanedKey = key.trim();
      let value: any = rawValue.trim().replace(/^['"]|['"]$/g, ''); // remove quotes

      // Optional: auto-convert to number or boolean if possible
      if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      } else if (!isNaN(Number(value))) {
        value = Number(value);
      }

      result[cleanedKey] = value;
    }
  }

  return result;
}