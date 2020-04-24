import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const income = (await this.find({ where: [{ type: 'income' }] })).reduce(
      (acc: number, item: Transaction) => Number(acc) + Number(item.value),
      0,
    );

    const outcome = (await this.find({ where: [{ type: 'outcome' }] })).reduce(
      (acc: number, item: Transaction) => Number(acc) + Number(item.value),
      0,
    );

    const total = income - outcome;
    return { income, outcome, total };
  }
}

export default TransactionsRepository;