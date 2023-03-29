import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TestingService } from './testing.service';

@Controller('testing')
export class TestingController {
  constructor(private testingService: TestingService) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllData() {
    await this.testingService.dropDatabase();
  }
}
