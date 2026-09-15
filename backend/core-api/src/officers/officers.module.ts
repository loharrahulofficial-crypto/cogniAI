import { Module } from '@nestjs/common';
import { OfficersController } from './officers.controller';
import { OfficersService } from './officers.service';

@Module({
  controllers: [OfficersController],
  providers: [OfficersService],
  exports: [OfficersService],
})
export class OfficersModule {}
