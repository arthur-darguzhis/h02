import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  testRejectedPromiseAfterSendingResponse() {
    // const myPromise = new Promise((resolve, reject) => {
    //   setTimeout(() => {
    //     reject('Promise resolved after 5 seconds');
    //   }, 5000);
    // });
    return 'Hello World!';
  }
}
