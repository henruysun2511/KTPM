import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SongService } from 'modules/songs/services/song.service';
import { ArtistService } from 'modules/artist/services/artist.service';
import { AlbumService } from 'modules/album/services/album.service';
import { PlaylistService } from 'modules/playlist/services/playlist.service';
import { ReportStatus, ReportTargetType } from 'common/enum';
import { UserService } from 'modules/user/services/user.service';
import { IUserRequest } from 'shared/interfaces';
import { checkMongoId } from 'shared/utils/validateMongoId.util';

import { CreateReportDto } from '../dtos/create-report.dto';
import { ReportRepository } from '../repositories/report.repository';
import { UpdateReportStatusDto } from '../dtos/update-report-status.dto';
import { QueryReportDto } from '../dtos';
import { buildReportFilterQuery } from '../queries/report.query';

@Injectable()
export class ReportService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly TARGET_MAP: Readonly<Record<ReportTargetType, any>>;

  constructor(
    private readonly reportRepo: ReportRepository,
    private readonly songService: SongService,
    private readonly artistService: ArtistService,
    private readonly albumService: AlbumService,
    private readonly playlistService: PlaylistService,
    private readonly userService: UserService
  ) {
    this.TARGET_MAP = {
      song: this.songService,
      artist: this.artistService,
      album: this.albumService,
      playlist: this.playlistService,
      user: this.userService
    } as const;
  }

  async create(reportDto: CreateReportDto, user: Partial<IUserRequest>) {
    // Chec targetId có tồn tại ko
    await this.throwIfTargetIdNotExist(reportDto.targetType, reportDto.targetId);
    return await this.reportRepo.create({ ...reportDto, reporterId: user.userId });
  }

  private async throwIfTargetIdNotExist(targetType: ReportTargetType, targetId: string) {
    const service = this.TARGET_MAP[targetType];
    if (!service) throw new BadRequestException('Loại target không hợp lệ');

    const target = await service.checkExist(targetId);
    if (!target) throw new NotFoundException('Không tìm thấy đối tượng');
  }

  async updateStatus(id: string, statusDto: UpdateReportStatusDto, user: Partial<IUserRequest>) {
    checkMongoId(id);
    const updated = await this.reportRepo.updateStatus(id, {
      status: statusDto.status,
      handledAt: new Date(),
      handledBy: user.userId
    });
    if (updated.matchedCount === 0) throw new NotFoundException('Không có report nào như vậy');
  }

  async findAll(query: QueryReportDto) {
    const page = query.page || 1;
    const size = query.size || 10;
    const skip = (page - 1) * size;

    const { filter, sort } = buildReportFilterQuery(query);

    const [totalElements, data] = await Promise.all([
      this.reportRepo.countDocuments(filter),
      this.reportRepo.findAll(filter, skip, size, sort)
    ]);
    const totalPages = Math.ceil(totalElements / size);

    return {
      meta: {
        page,
        size,
        totalPages,
        totalElements
      },
      data
    };
  }
}
