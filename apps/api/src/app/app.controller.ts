import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from '../auth/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  getData() {
    return this.appService.getData();
  }

  @Post('seed')
  @Public()
  async seed() {
    return this.appService.seedDatabase();
  }
}
