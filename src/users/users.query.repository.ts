import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users-schema';
import { Model } from 'mongoose';
import { PaginatedUserListDto } from './dto/paginatedUserList.dto';
import {
  mapUserToMeViewModel,
  mapUserToViewModel,
  MeViewModel,
} from './user.mapper';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getPaginatedUsersList(dto: PaginatedUserListDto) {
    const {
      searchEmailTerm,
      searchLoginTerm,
      sortBy,
      sortDirection,
      pageSize,
      pageNumber,
    } = dto;

    const filter = {};
    const or = [];
    if (searchLoginTerm) {
      or.push({ login: { $regex: searchLoginTerm, $options: 'i' } });
    }

    if (searchEmailTerm) {
      or.push({ email: { $regex: searchEmailTerm, $options: 'i' } });
    }

    if (or.length > 0) {
      filter['$or'] = or;
    }

    const count = await this.userModel.countDocuments(filter);
    const direction = sortDirection === 'asc' ? 1 : -1;
    const howManySkip = (pageNumber - 1) * pageSize;
    const users = await this.userModel
      .find(filter)
      .sort({ [sortBy]: direction })
      .skip(howManySkip)
      .limit(pageSize)
      .lean();

    return {
      pagesCount: Math.ceil(count / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: count,
      items: users.map(mapUserToViewModel),
    };
  }

  async getInfoAboutCurrentUser(currentUserId): Promise<MeViewModel | null> {
    const user = await this.userModel.findOne({ _id: currentUserId });
    return user ? mapUserToMeViewModel(user) : null;
  }
}
