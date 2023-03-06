import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './posts-schema';
import { Model } from 'mongoose';
import { UpdatePostDto } from './dto/updatePost.dto';
import { EntityNotFoundException } from '../common/exceptions/domain.exceptions/entity-not-found.exception';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async save(postModel: PostDocument): Promise<PostDocument> {
    return postModel.save();
  }

  async updatePost(postId: string, dto: UpdatePostDto): Promise<true | never> {
    const isUpdated = await this.postModel.findByIdAndUpdate(postId, dto, {
      new: true,
    });
    if (!isUpdated) {
      throw new EntityNotFoundException(`Post with id: ${postId} is not found`);
    }
    return true;
  }

  async deleteById(postId: string): Promise<true | never> {
    const isRemoved = await this.postModel.findByIdAndRemove(postId);

    if (!isRemoved) {
      throw new EntityNotFoundException(`Post with id: ${postId} is not found`);
    }
    return true;
  }
}
