/**
 * Special error class for non-2XX hAPI responses. If you get this error,
 * it means that the request itself was successful, but the action was not.
 * That could be due to invalid parameters, some kind of failed precondition
 * or even an internal server error, which is unlikely, but still possible.
 */
export class ApiError extends Error {
  /** Raw hAPI response text. Almost always it's going to be an encoded JSON string. */
  readonly rawText: string;

  /** Numeric response status. This is never 2XX. */
  readonly status: number;

  /**
   * Creates an instance of this class and attempts to extract
   * any useful data from the raw response text.
   *
   * @param rawText Raw hAPI response text.
   * @param status Numeric response status.
   */
  constructor(rawText: string, status: number) {
    super(`Request failed with status ${status}`);

    this.rawText = rawText;
    this.status = status;

    try {
      const error = JSON.parse(rawText);
      if (!error || !Array.isArray(error._embedded?.["fx:errors"])) return;

      this.message += " and the following errors:\n";
      this.message += error._embedded["fx:errors"]
        .filter((item: any) => item && typeof item === "object" && typeof item.message === "string")
        .map((item: any) => `- ${item.message}`)
        .join("\n");
    } catch {}
  }
}
