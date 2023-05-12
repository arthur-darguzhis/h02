import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ImagesRepository } from '../../infrastructure/images-repository';
import { Image } from '../entity/image';
import mediaDirPath from '../../../../media/media-dir-path';
import sharp from 'sharp';
import * as Buffer from 'buffer';
import { v4 as uuidv4 } from 'uuid';
import { UnprocessableEntityException } from '@nestjs/common';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';

export class UploadWallpaperForBlogCommand {
  constructor(
    public readonly fileBuffer: Buffer,
    public readonly blogId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(UploadWallpaperForBlogCommand)
export class UploadWallpaperForBlogUseCase implements ICommandHandler {
  constructor(
    private imagesRepository: ImagesRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async execute(command: UploadWallpaperForBlogCommand) {
    const blog = await this.blogsRepository.getById(command.blogId);
    if (blog.userId !== command.userId) {
      throw new UnauthorizedActionException(
        'Unauthorized action. This blog belongs to another blogger.',
      );
    }
    const photoMetadata = await sharp(command.fileBuffer).metadata();
    if (photoMetadata.width !== 1028) {
      throw new UnprocessableEntityException('photo width must be 1028');
    }

    if (photoMetadata.height !== 312) {
      throw new UnprocessableEntityException('photo width height be 1028');
    }
    const fileName = uuidv4() + '.' + photoMetadata.format;
    const pathToSave = mediaDirPath + '/../../media/' + fileName;
    const image = await this.saveImage(
      1028,
      312,
      pathToSave,
      command.fileBuffer,
    );
    blog.wallpaper = image.id;
    await this.blogsRepository.save(blog);
  }

  private async saveImage(width, height, pathToSave, fileBuffer) {
    await sharp(fileBuffer).resize(width, height).toFile(pathToSave);
    const photoMetadata = await sharp(pathToSave).metadata();
    const photoBuffer = await sharp(pathToSave).toBuffer();
    const image = new Image();
    image.url = pathToSave;
    image.height = height;
    image.width = width;
    image.size = photoBuffer.length;
    return await this.imagesRepository.save(image);
  }
}
