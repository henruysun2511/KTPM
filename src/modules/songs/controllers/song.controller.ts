import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Put, Query, Res } from '@nestjs/common';
import axios from 'axios';
import { Response } from 'express';
import { createReadStream, createWriteStream, existsSync } from 'fs';
import { join } from 'path';
import { Public, ResponseMessage, User } from 'shared/decorators/customize';
import { IUserRequest } from 'shared/interfaces';
import { pipeline } from 'stream/promises';
import { CreateSongDto, QuerySongDtoForClient, UpdateSongDto } from '../dtos';
import { UpdateStatusDto } from '../dtos/update-status.dto';
import { SongService } from '../services/song.service';

@Controller('songs')
export class SongController {
  constructor(private readonly songService: SongService) { }

  @Get('stream-local/:id')
  @Public()
  @ResponseMessage('Stream song local (Test Plan 1 - Heavy I/O)')
  async streamLocal(@Param('id') id: string, @Res() res: Response) {
    // 1. Truy vấn DB trực tiếp (tốn tài nguyên hơn dùng Cache)
    const song = await this.songService.getDetail(id);
    if (!song) throw new NotFoundException('Bài hát không tồn tại');

    const fileName = `${id}.mp3`;
    const uploadDir = join(process.cwd(), 'uploads', 'songs');
    const filePath = join(uploadDir, fileName);

    // Đảm bảo thư mục tồn tại
    if (!existsSync(uploadDir)) {
      const fs = require('fs');
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 2. TÁC VỤ NẶNG: Nếu chưa có file local thì download từ Cloudinary về
    // Điều này gây tốn Network Bandwidth và Disk Write I/O của server
    if (!existsSync(filePath)) {
      try {
        const writer = createWriteStream(filePath);
        const response = await axios.get(song.mp3Link as string, {
          responseType: 'stream'
        });
        await pipeline(response.data, writer);
      } catch (error) {
        throw new NotFoundException('Không thể tải file từ Cloudinary');
      }
    }

    // 3. TÁC VỤ NẶNG: Server tự đọc disk và stream bytes
    // Server phải giữ một socket mở và liên tục đọc ổ cứng để pipe dữ liệu
    const fs = require('fs');
    const stat = fs.statSync(filePath);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Accept-Ranges', 'bytes');

    const fileStream = createReadStream(filePath);

    // Pipe sẽ chiếm dụng bộ nhớ đệm (buffer) của Node.js khi có hàng ngàn user cùng lúc
    fileStream.pipe(res);
  }

  @ResponseMessage('Đăng bài hát thành công')
  @Post('')
  async create(@Body() createSongDto: CreateSongDto, @User() user: IUserRequest) {
    return this.songService.create(createSongDto, user);
  }

  // @Public()
  // @Get('top')
  // @ResponseMessage('Lấy ra top bài hát thành công')
  // getTopSongs() {
  //   return this.songService.getTopSongs();
  // }

  @Get('')
  @Public()
  @ResponseMessage('Lấy ra danh sách bài hát thành công')
  async getSongsForClient(@Query() query: QuerySongDtoForClient) {
    return await this.songService.getSongsForClient(query);
  }

  // Update có thể có file hoặc không
  @Put(':id')
  async update(@Param('id') id: string, @Body() songDto: UpdateSongDto, @User() user: IUserRequest) {
    return this.songService.update(id, songDto, user);
  }

  @ResponseMessage('Cập nhật trạng thái thành công')
  @Patch('update-status')
  async updateStatus(@Body() statusDto: UpdateStatusDto, @User() user: IUserRequest) {
    return await this.songService.updateStatus(statusDto, user.userId);
  }

  @Get('leaderboard')
  @Public()
  @ResponseMessage('Lấy bảng xếp hạng thành công')
  async getLeaderboard(@Query('type') type: 'all' | 'week' | 'month' = 'all') {
    return await this.songService.getLeaderboard(type);
  }

  @Get('detail/:id')
  @Public()
  @ResponseMessage('Lấy ra chi tiết bài hát thành công')
  async getDetail(@Param('id') id: string) {
    return await this.songService.getDetail(id);
  }

  @Get(':artistId')
  @ResponseMessage('Lấy ra danh sách bài hát của nghệ sĩ thành công')
  async getSongsByArtistId(@Param('artistId') artistId: string) {
    return await this.songService.getSongsByArtistid(artistId);
  }

  @Delete(':id')
  @ResponseMessage('Xóa thành công')
  async removeForArtist(@Param('id') id: string, @User() user: IUserRequest) {
    return await this.songService.removeForArtist(id, user.userId);
  }

  @Patch(':id/view')
  async incrementViews(@Param('id') id: string, @User() user: IUserRequest) {
    // Truyền thêm userId nếu có (khách thì user?.userId sẽ undefined)
    return await this.songService.incrementViews(id, user?.userId);
  }
}
