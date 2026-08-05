export type PurchaseFailureCode =
  | 'cancelled'
  | 'pending'
  | 'network'
  | 'product-unavailable'
  | 'store-unavailable'
  | 'verification-failed'
  | 'unknown';

export type PurchaseSnapshot = {
  configured: boolean;
  hasPremium: boolean;
  localizedPrice: string | null;
  failure: PurchaseFailureCode | null;
};

export type PurchaseResult = {
  hasPremium: boolean;
  failure: PurchaseFailureCode | null;
};

export interface PurchaseClient {
  configure(): Promise<PurchaseSnapshot>;
  refresh(): Promise<PurchaseSnapshot>;
  purchaseLifetime(): Promise<PurchaseResult>;
  restore(): Promise<PurchaseResult>;
  subscribe(listener: (snapshot: PurchaseSnapshot) => void): () => void;
}
