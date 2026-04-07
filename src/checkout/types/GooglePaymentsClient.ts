export type GooglePaymentsClient = {
  isReadyToPay: (request: Record<string, unknown>) => Promise<{ result: boolean }>;
  loadPaymentData: (request: Record<string, unknown>) => Promise<Record<string, unknown>>;
  createButton: (options: Record<string, unknown>) => HTMLElement;
};
