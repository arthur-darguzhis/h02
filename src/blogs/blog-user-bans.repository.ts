import { InjectModel } from '@nestjs/mongoose';
import { BlogUserBans, BlogUserBansDocument } from './blog-user-bans-schema';
import { Model } from 'mongoose';
import { EntityNotFoundException } from '../common/exceptions/domain.exceptions/entity-not-found.exception';

export class BlogUserBansRepository {
  constructor(
    @InjectModel(BlogUserBans.name)
    private blogUserBansModel: Model<BlogUserBansDocument>,
  ) {}

  async save(
    blogUserBansModel: BlogUserBansDocument,
  ): Promise<BlogUserBansDocument> {
    return blogUserBansModel.save();
  }

  async delete(
    blogUserBansModel: BlogUserBansDocument,
  ): Promise<BlogUserBansDocument> {
    return blogUserBansModel.deleteOne();
  }

  async findOne(
    blogId: string,
    userId: string,
  ): Promise<BlogUserBansDocument | null> {
    return this.blogUserBansModel.findOne({
      blogId,
      userId,
    });
  }

  // async getOne(
  //   blogId: string,
  //   userId: string,
  // ): Promise<BlogUserBansDocument | never> {
  //   const blogUserBan = await this.blogUserBansModel.findOne({
  //     blogId,
  //     userId,
  //   });
  //   if (!blogUserBan) {
  //     throw new EntityNotFoundException(
  //       `There is no user with id: ${userId} banned for blog with id: ${blogId} `,
  //     );
  //   }
  //   return blogUserBan;
  // }
}
