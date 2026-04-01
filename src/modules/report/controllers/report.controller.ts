import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ResponseMessage, User } from 'shared/decorators/customize';
import { IUserRequest } from 'shared/interfaces';

import { ReportService } from '../services/report.service';
import { CreateReportDto, QueryReportDto } from '../dtos';
import { UpdateReportStatusDto } from '../dtos/update-report-status.dto';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('')
  @ResponseMessage('Report thành công')
  async create(@Body() reportDto: CreateReportDto, @User() user: IUserRequest) {
    return await this.reportService.create(reportDto, { userId: user.userId });
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật trạng thái thành công')
  async updateStatus(@Param('id') id: string, @Body() statusDto: UpdateReportStatusDto, @User() user: IUserRequest) {
    return await this.reportService.updateStatus(id, statusDto, { userId: user.userId });
  }

  @Get('')
  @ResponseMessage('Lấy ra danh sách report thành công')
  async findAll(@Query() query: QueryReportDto) {
    return await this.reportService.findAll(query);
  }
}
