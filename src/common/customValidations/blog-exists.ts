import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { BlogsService } from '../../blogs/blogs.service';

@ValidatorConstraint({ name: 'BlogExists', async: true })
@Injectable()
export class BlogExists implements ValidatorConstraintInterface {
  constructor(private readonly blogsService: BlogsService) {}

  async validate(blogId: string, args: ValidationArguments) {
    const blog = await this.blogsService.isBlogExists(blogId);
    return !!blog; // return true if blog exists, false otherwise
  }

  defaultMessage(args: ValidationArguments) {
    return 'Blog with id $value does not exist';
  }
}
