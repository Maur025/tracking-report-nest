import { TransactionContext } from './transaction-context.js';

export abstract class TransactionHandler {
  abstract handle<T>(
    transaction: (context: TransactionContext) => Promise<T>,
  ): Promise<T>;
}
