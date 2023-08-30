import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { UserService } from '@/modules/users/services/user.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiCustomHeader } from '@/shared/swagger/decorator';
import { ResponseSuccessInterceptor } from '@/interceptors/response.interceptor';
import { ResponseMessage } from '@/common/decorators/response.decorator';

@ApiTags('Users')
@ApiCustomHeader()
@Controller('users')
@UseInterceptors(ResponseSuccessInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  @ResponseMessage('Successfully retrieved!')
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }
}
