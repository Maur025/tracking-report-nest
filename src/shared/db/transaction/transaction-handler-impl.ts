import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TransactionContext } from './transaction-context.js';
import { TransactionHandler } from './transaction-handler.js';

@Injectable()
export class TransactionHandlerImpl extends TransactionHandler {
  constructor(private readonly dataSource: DataSource) {
    super();
  }

  async handle<T>(
    transaction: (context: TransactionContext) => Promise<T>,
  ): Promise<T> {
    return this.dataSource.transaction(async (manager) => {
      const context = {
        enterpriseRepository: manager.getRepository('Enterprise'),
        enterpriseConfigRepository: manager.getRepository('EnterpriseConfig'),
      } as TransactionContext;

      return transaction(context);
    });
  }
}
