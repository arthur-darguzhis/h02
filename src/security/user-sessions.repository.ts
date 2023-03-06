import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserSessions, UserSessionsDocument } from './user-sessions-schema';
import { EntityNotFoundException } from '../common/exceptions/domain.exceptions/entity-not-found.exception';

Injectable();
export class UserSessionsRepository {
  constructor(
    @InjectModel(UserSessions.name)
    private userSessionsModel: Model<UserSessionsDocument>,
  ) {}

  async findByDeviceId(deviceId: string): Promise<UserSessionsDocument | null> {
    const userSession = await this.userSessionsModel.findOne({
      deviceId: deviceId,
    });
    return userSession;
  }

  async getByDeviceId(deviceId: string): Promise<UserSessionsDocument | never> {
    const userSession = await this.userSessionsModel.findOne({
      deviceId: deviceId,
    });
    if (!userSession)
      throw new EntityNotFoundException(
        `There is not session for deviceId: ${deviceId}`,
      );
    return userSession;
  }

  async purgeSessionByDeviceId(deviceId, userId) {
    await this.userSessionsModel.deleteOne({
      deviceId: deviceId,
      userId: userId,
    });
  }

  async purgeOtherSessions(deviceId: string, userId: string) {
    await this.userSessionsModel.deleteMany({
      deviceId: { $ne: deviceId },
      userId: userId,
    });
  }

  async save(userSession: UserSessionsDocument) {
    return await userSession.save();
  }

  async deleteByDeviceId(deviceId: string, userId: string): Promise<boolean> {
    const result = await this.userSessionsModel.deleteOne({
      deviceId: deviceId,
      userId: userId,
    });
    return result.deletedCount === 1;
  }
}
