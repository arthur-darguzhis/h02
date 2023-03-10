import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from './blogs-schema';
import { Injectable } from '@nestjs/common';
import { UpdateBlogDto } from './dto/updateBlogDto';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async save(blogModel: BlogDocument): Promise<BlogDocument> {
    return blogModel.save();
  }

  async findById(blogId: string): Promise<BlogDocument | null> {
    const blog = await this.blogModel.findById(blogId);
    if (!blog) {
      return null;
    }
    return blog;
  }

  async getById(blogId: string): Promise<BlogDocument | never> {
    const blog = await this.blogModel.findById(blogId);
    if (!blog) throw new Error('');
    //TODO здесь выкидывать исключение но какое свое или нестовское, если нестовское то проект привязывается к несту плюс там исключения для запросов
    return blog;
  }

  async deleteById(blogId: string): Promise<true | never> {
    const isRemoved = await this.blogModel.findByIdAndRemove(blogId);

    if (!isRemoved) throw new Error('');
    //TODO здесь выкидывать исключение но какое свое или нестовское, если нестовское то проект привязывается к несту плюс там исключения для запросов
    return true;
  }

  async updateBlog(blogId: string, dto: UpdateBlogDto): Promise<true | never> {
    const isUpdated = await this.blogModel.findByIdAndUpdate(blogId, dto, {
      new: true,
    });
    if (!isUpdated) throw new Error('');
    //TODO здесь выкидывать исключение но какое свое или нестовское, если нестовское то проект привязывается к несту плюс там исключения для запросов
    return true;
  }
}
