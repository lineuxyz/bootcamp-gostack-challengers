import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transactionId = await transactionsRepository.findOne(id);

    if (!transactionId) throw new AppError('Transaction does not exist');

    await transactionsRepository.remove(transactionId);
  }
}

export default DeleteTransactionService;