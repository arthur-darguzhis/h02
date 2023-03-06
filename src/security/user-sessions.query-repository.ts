import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserSessions, UserSessionsDocument } from './user-sessions-schema';
import { mapUserSessionToViewModel } from './user-sessions.mapper';

Injectable();
export class UserSessionsQueryRepository {
  constructor(
    @InjectModel(UserSessions.name)
    private userSessionsModel: Model<UserSessionsDocument>,
  ) {}

  async findByUserId(userId) {
    const activeSessions = await this.userSessionsModel
      .find({
        userId: userId,
      })
      .lean();

    return activeSessions.map(mapUserSessionToViewModel);
  }
}
