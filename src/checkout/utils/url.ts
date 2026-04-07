export function toFormData(input: Record<string, unknown>): URLSearchParams {
  const form = new URLSearchParams();

  for (const [key, value] of Object.entries(input)) {
    if (value === null || value === undefined) {
      continue;
    }

    if (typeof value === 'object') {
      form.set(key, JSON.stringify(value));
      continue;
    }

    form.set(key, String(value));
  }

  return form;
}

export function toQueryString(input: Record<string, string | number | boolean | null | undefined>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(input)) {
    if (value === null || value === undefined) {
      continue;
    }

    search.set(key, String(value));
  }

  return search.toString();
}
