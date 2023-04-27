import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityNotFoundException } from '../../common/exceptions/domain.exceptions/entity-not-found.exception';
import { UserSession } from '../../users/application/entities/user-session';

@Injectable()
export class UserSessionsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private jwtService: JwtService,
    @InjectRepository(UserSession)
    private userSessionsRepository: Repository<UserSession>,
  ) {}

  async save(userSession: UserSession) {
    await this.userSessionsRepository.save(userSession);
  }

  async findByDeviceId(deviceId: string): Promise<UserSession | never> {
    return await this.userSessionsRepository.findOneBy({ deviceId: deviceId });
  }

  async getByDeviceId(deviceId: string) {
    const userSession = await this.findByDeviceId(deviceId);
    if (userSession === null) {
      throw new EntityNotFoundException(
        `There is not session for deviceId: ${deviceId}`,
      );
    }
    return userSession;
  }

  async findAllSessionsByUser(userId: string): Promise<UserSession[] | never> {
    return await this.userSessionsRepository.findBy({ userId });
  }

  async remove(deviceId: string, userId: string) {
    await this.userSessionsRepository
      .createQueryBuilder()
      .delete()
      .where('device_id = :deviceId AND user_id = :userId', {
        deviceId,
        userId,
      })
      .execute();
  }

  async forTest_findByUserId(userId) {
    return await this.userSessionsRepository.findBy({ userId });
  }

  async deleteAllSessionsByUserId(userId: string) {
    await this.userSessionsRepository
      .createQueryBuilder()
      .delete()
      .where('user_id = :userId', {
        userId,
      })
      .execute();
  }

  async purgeOtherSessions(deviceId: string, userId: string) {
    await this.userSessionsRepository
      .createQueryBuilder()
      .delete()
      .where('device_id <> :deviceId AND user_id = :userId', {
        deviceId,
        userId,
      })
      .execute();
  }

  async purgeSession(deviceId: string) {
    await this.userSessionsRepository
      .createQueryBuilder()
      .delete()
      .where('device_id = :deviceId', {
        deviceId,
      })
      .execute();
  }
}
