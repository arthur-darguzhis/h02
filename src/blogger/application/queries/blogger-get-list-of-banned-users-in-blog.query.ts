import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  BlogUserBans,
  BlogUserBansDocument,
} from '../../../blogs/blog-user-bans-schema';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from '../../../blogs/blogs-schema';
import { InjectModel } from '@nestjs/mongoose';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';

export class BloggerGetListOfBannedUsersInBlogQuery {
  constructor(
    public readonly blogId,
    public readonly bloggerId,
    public readonly searchLoginTerm,
    public readonly sortBy,
    public readonly sortDirection,
    public readonly pageNumber,
    public readonly pageSize,
  ) {}
}

@QueryHandler(BloggerGetListOfBannedUsersInBlogQuery)
export class BloggerGetListOfBannedUsersForBlogHandler
  implements IQueryHandler
{
  constructor(
    @InjectModel(BlogUserBans.name)
    private blogUserBansModel: Model<BlogUserBansDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
  ) {}

  async execute(query: BloggerGetListOfBannedUsersInBlogQuery) {
    const blog: BlogDocument = await this.blogModel.findById(query.blogId);

    if (blog?.blogOwnerInfo?.userId !== query.bloggerId) {
      throw new UnauthorizedActionException(
        'Unauthorized action. This blog belongs to another blogger.',
      );
    }

    const filter = { blogId: query.blogId, 'banInfo.isBanned': true };
    if (query.searchLoginTerm) {
      filter['searchLoginTerm'] = {
        $regex: query.searchLoginTerm,
        $options: 'i',
      };
    }

    const count = await this.blogUserBansModel.countDocuments(filter);
    const direction = query.sortDirection === 'asc' ? 1 : -1;
    const howManySkip = (query.pageNumber - 1) * query.pageSize;
    const users = await this.blogUserBansModel
      .find(filter)
      .sort({ [query.sortBy]: direction })
      .skip(howManySkip)
      .limit(query.pageSize)
      .lean();

    return {
      pagesCount: Math.ceil(count / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: count,
      items: users.map(this.mapper),
    };
  }

  private mapper(blogUserBans: BlogUserBansDocument) {
    return {
      id: blogUserBans.userId,
      login: blogUserBans.login,
      banInfo: {
        isBanned: blogUserBans.banInfo.isBanned,
        banDate: blogUserBans.banInfo.banDate,
        banReason: blogUserBans.banInfo.banReason,
      },
    };
  }
}
