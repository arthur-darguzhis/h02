import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../common/exceptions/domain.exceptions/entity-not-found.exception';
import { PasswordRecovery } from '../application/entities/password-recovery';

@Injectable()
export class PasswordRecoveryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(PasswordRecovery)
    private passwordRecoveryRepository: Repository<PasswordRecovery>,
  ) {}

  async save(passwordRecovery: PasswordRecovery): Promise<void> {
    await this.passwordRecoveryRepository.save(passwordRecovery);
  }

  async getByCode(recoveryCode: string) {
    const passwordRecovery = await this.passwordRecoveryRepository.findOneBy({
      code: recoveryCode,
    });

    if (passwordRecovery === null) {
      throw new EntityNotFoundException('invalid password recovery');
    }

    return passwordRecovery;
  }

  async forTests_getByUserId(userId: string) {
    const passwordRecovery = await this.dataSource.query(
      `SELECT
                id,
                code,
                sending_time as "sendingTime",
                expiration_date as "expirationDate",
                is_confirmed as "isConfirmed",
                user_id as "userId"
            FROM password_recovery
            WHERE user_id = $1`,
      [userId],
    );

    if (passwordRecovery.length === 0) {
      throw new EntityNotFoundException('invalid password recovery');
    }

    return passwordRecovery[0];
  }

  async forTest_resetExpirationDate(id) {
    await this.dataSource.query(
      'UPDATE password_recovery SET expiration_date = $1 WHERE id = $2',
      [new Date(), id],
    );
  }
}
