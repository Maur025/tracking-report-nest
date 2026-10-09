export const transformSafeString = <T>(value: T): string => {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return String(value);
  }

  return JSON.stringify(value);
};
