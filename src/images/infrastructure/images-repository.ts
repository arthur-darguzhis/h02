import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Image } from '../application/entity/image';

@Injectable()
export class ImagesRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
  ) {}

  async findUserReaction(imageId: string) {
    return await this.imageRepository.findOneBy({ id: imageId });
  }

  async save(image: Image) {
    return await this.imageRepository.save(image);
  }
}
