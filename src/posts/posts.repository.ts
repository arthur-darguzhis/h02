import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './posts-schema';
import { Model } from 'mongoose';
import { UpdatePostDTO } from './dto/updatePostDTO';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async save(postModel: PostDocument): Promise<PostDocument> {
    return postModel.save();
  }

  async updatePost(postId: string, dto: UpdatePostDTO): Promise<true | never> {
    const isUpdated = await this.postModel.findByIdAndUpdate(postId, dto, {
      new: true,
    });
    if (!isUpdated) throw new Error('');
    //TODO здесь выкидывать исключение но какое свое или нестовское, если нестовское то проект привязывается к несту плюс там исключения для запросов
    return true;
  }

  async deleteById(postId: string): Promise<true | never> {
    const isRemoved = await this.postModel.findByIdAndRemove(postId);

    if (!isRemoved) throw new Error('');
    //TODO здесь выкидывать исключение но какое свое или нестовское, если нестовское то проект привязывается к несту плюс там исключения для запросов
    return true;
  }
}
