import { Module } from '@nestjs/common';
import { TransactionHandlerImpl } from './db/transaction/transaction-handler-impl.js';
import { TransactionHandler } from './db/transaction/transaction-handler.js';

@Module({
  providers: [
    {
      provide: TransactionHandler,
      useClass: TransactionHandlerImpl,
    },
  ],
  exports: [TransactionHandler],
})
export class SharedModule {}
