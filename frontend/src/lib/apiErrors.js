export function getApiErrorMessage(error, fallback) {
  const payload = error?.response?.data;

  if (typeof payload?.message === 'string' && payload.message.trim()) {
    return payload.message;
  }

  if (payload && typeof payload === 'object') {
    const firstValidationMessage = Object.values(payload).find(
      (value) => typeof value === 'string' && value.trim()
    );
    if (firstValidationMessage) {
      return firstValidationMessage;
    }
  }

  return fallback;
}
