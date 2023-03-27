import { InjectModel } from '@nestjs/mongoose';
import { BlogUserBans, BlogUserBansDocument } from './blog-user-bans-schema';
import { Model } from 'mongoose';

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
    return this.blogUserBansModel.findOne({ blogId, userId });
  }
}
