import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users-schema';
import { Model } from 'mongoose';
import { PaginatedUserListDTO } from './dto/paginatedUserListDTO';
import { mapUserToViewModel } from './user.mapper';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getPaginatedUsersList(dto: PaginatedUserListDTO) {
    const {
      searchEmailTerm,
      searchLoginTerm,
      sortBy,
      sortDirection,
      pageSize,
      pageNumber,
    } = dto;

    //TODO Посмотреть как у других сделанно построениен вот этих условий
    const filter = {};
    const or = [];
    if (searchLoginTerm) {
      or.push({ login: { $regex: searchLoginTerm, $options: 'i' } });
    }

    if (searchEmailTerm) {
      or.push({ email: { $regex: searchEmailTerm, $options: 'i' } });
    }

    filter['$or'] = or;
    const count = await this.userModel.countDocuments(filter);

    const howManySkip = (pageNumber - 1) * pageSize;
    const users = await this.userModel
      .find(filter)
      .sort(`${sortBy}: ${sortDirection}`)
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
}
