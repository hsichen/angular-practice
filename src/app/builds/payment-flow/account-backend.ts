import { Observable, map, timer } from 'rxjs';

/**
 * The simulated backend. The config panel on the page stands in for what the server knows;
 * `fetchAccountState` is the request a real app would make when the user hits Launch.
 */

export type PaymentMethod = 'card' | 'bank';

/** A bill the user can pay. */
export interface BillingAccount {
  id: string;
  name: string;
  last4: string;
}

/** What the server says about the user, fetched once per Launch. */
export interface AccountState {
  /** The payment method on file, or null if none has been set up yet. */
  paymentMethod: PaymentMethod | null;
  /** Bills the user can pay. Always at least one. */
  accounts: BillingAccount[];
}

/** The config panel's settings: the "database" the fake backend reads from. */
export interface BackendConfig {
  paymentMethodOnFile: boolean;
  accountCount: 1 | 3;
  checkFails: boolean;
}

export const DEFAULT_BACKEND_CONFIG: BackendConfig = {
  paymentMethodOnFile: true,
  accountCount: 3,
  checkFails: false,
};

export const BACKEND_LATENCY_MS = 800;

export const BILLING_ACCOUNTS: readonly BillingAccount[] = [
  { id: 'electric', name: 'Electric', last4: '4821' },
  { id: 'water', name: 'Water', last4: '0937' },
  { id: 'internet', name: 'Internet', last4: '5512' },
];

/**
 * Simulated GET /account-state. Cold, like HttpClient: nothing happens until you subscribe,
 * and each subscription is a new request. Emits once and completes after BACKEND_LATENCY_MS,
 * or errors after the same delay when `config.checkFails` is set.
 */
export function fetchAccountState(config: BackendConfig): Observable<AccountState> {
  return timer(BACKEND_LATENCY_MS).pipe(
    map(() => {
      if (config.checkFails) {
        throw new Error('503 Service Unavailable');
      }
      return {
        paymentMethod: config.paymentMethodOnFile ? 'card' : null,
        accounts: BILLING_ACCOUNTS.slice(0, config.accountCount),
      };
    }),
  );
}
