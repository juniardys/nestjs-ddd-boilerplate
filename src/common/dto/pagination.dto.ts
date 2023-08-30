import { IsNumber, Min, IsOptional } from 'class-validator';
import { Exclude, Type } from 'class-transformer';
import { Injectable } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';

@Exclude()
@Injectable()
export class Pagination {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(10)
  limit?: number;
}
