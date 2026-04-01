import { BadRequestException, Injectable } from '@nestjs/common';
import { AdvertisementService } from 'modules/advertisement/services/advertisement.service';
import { AlbumService } from 'modules/album/services/album.service';
import { PlaylistService } from 'modules/playlist/services/playlist.service';
import { SongService } from 'modules/songs/services/song.service';
import { IUserRequest } from 'shared/interfaces';

import { StartPlayingDto } from '../dtos';
import { IPlayerContext } from '../interfaces/player-context.interface';

@Injectable()
export class PlayerService {
  // Lưu trạng thái của từng user (in-memory)
  private sessions = new Map<string, IPlayerContext>();

  constructor(
    private readonly songService: SongService,
    private readonly playlistService: PlaylistService,
    private readonly albumService: AlbumService,
    private readonly adsService: AdvertisementService
  ) {}

  private getSession(userId: string): IPlayerContext {
    return this.sessions.get(userId);
  }

  private saveSession(userId: string, data: IPlayerContext) {
    this.sessions.set(userId, data);
  }

  async start(playingDto: StartPlayingDto, user: IUserRequest) {
    const ctx: IPlayerContext = {
      userId: user.userId,
      currentTrack: playingDto.songId,
      queue: [],
      history: [],
      playlistId: playingDto.playlistId,
      albumId: playingDto.albumId,
      isPremium: user.isPremium,
      songPlayedCount: 0,
      nextAds: null,
      isAdsPlaying: false
    };

    // Nếu phát playlist → dựng queue theo playlist
    if (playingDto.playlistId) {
      const playlist = await this.playlistService.getSongIdsOfPlaylistById(playingDto.playlistId);
      if (!playlist.songIds || playlist.songIds.length === 0)
        throw new BadRequestException('Playlist không tồn tại bài hát nào');
      ctx.queue = playlist.songIds.filter((s) => s.toString() !== playingDto.songId) as string[];
    }

    // Nếu phát album → dựng queue theo album
    if (playingDto.albumId) {
      const songs = await this.songService.findSongIdsByAlbumId(playingDto.albumId);
      if (!songs || songs.length === 0) throw new BadRequestException(' Album chưa có bài hát nào');
      const list = songs.map((s) => s._id.toString());
      const index = list.indexOf(playingDto.songId);
      ctx.queue = index >= 0 ? list.slice(index + 1) : list.filter((s) => s !== playingDto.songId);
    }

    this.saveSession(user.userId, ctx);

    return await this.getFullPlayerStatus(user.userId);
  }

  async getNextTrack(currentSongId: string, user: IUserRequest) {
    const ctx = this.getSession(user.userId);
    if (!ctx) throw new BadRequestException('Bạn chưa bắt đầu phát nhạc');

    const wasAdsPlaying = ctx.isAdsPlaying;

    // Nếu vừa phát xong quảng cáo → Reset cờ và CHẠY TIẾP để tìm bài hát tiếp theo
    if (ctx.isAdsPlaying) {
      ctx.isAdsPlaying = false;
      ctx.nextAds = null;
      this.saveSession(user.userId, ctx);
      // Không return ở đây, để logic bên dưới tìm bài hát tiếp theo
    }

    // Chỉ lưu bài hát vào lịch sử (không lưu quảng cáo)
    if (!wasAdsPlaying) {
      ctx.history.unshift(currentSongId);
      ctx.history = ctx.history.slice(0, 10);
    }

    /* ---- Free user: Kiểm tra cần chèn quảng cáo ---- */
    if (!ctx.isPremium) {
      ctx.songPlayedCount++;

      if (ctx.songPlayedCount >= 3) {
        ctx.songPlayedCount = 0;

        const ads = await this.getRandomAds();
        if (ads) {
          ctx.isAdsPlaying = true;
          ctx.nextAds = ads._id.toString();
          this.saveSession(user.userId, ctx);

          return await this.getFullPlayerStatus(user.userId);
        }
      }
    }

    /* ---- Nếu queue còn bài → phát tiếp ---- */
    if (ctx.queue.length > 0) {
      const next = ctx.queue.shift();
      ctx.currentTrack = next;

      this.saveSession(user.userId, ctx);

      return await this.getFullPlayerStatus(user.userId);
    }

    /* ---- Queue hết → random ---- */
    const randomTrack = await this.getRandomSong();
    ctx.currentTrack = randomTrack._id.toString();

    this.saveSession(user.userId, ctx);

    return await this.getFullPlayerStatus(user.userId);
  }

  async getPrevious(user: IUserRequest) {
    const ctx = this.getSession(user.userId);

    if (!ctx || ctx.history.length === 0) throw new BadRequestException('Không có bài để quay lại');

    // Lấy bài từ history
    const prev = ctx.history.shift();

    // Bài hiện tại đẩy về trước hàng đợi
    if (ctx.currentTrack) {
      ctx.queue.unshift(ctx.currentTrack);
    }

    ctx.currentTrack = prev;

    this.saveSession(user.userId, ctx);

    return await this.getFullPlayerStatus(user.userId);
  }

  async playFromQueue(songId: string, user: IUserRequest) {
    const ctx = this.getSession(user.userId);
    if (!ctx) throw new BadRequestException('Bạn chưa bắt đầu phát nhạc');

    const index = ctx.queue.findIndex((id) => id.toString() === songId.toString());
    if (index === -1) throw new BadRequestException('Bài hát không có trong hàng đợi');

    // Lấy ra tất cả các bài từ đầu đến vị trí index
    // splice(0, index + 1) trả về mảng các bài bị vượt qua + bài được chọn
    const skippedFromQueue = ctx.queue.splice(0, index + 1);

    // Bài cuối cùng là bài được chọn để phát
    const chosenSongId = skippedFromQueue.pop();

    // Đưa bài hiện tại cũ và các bài bị vượt qua vào history
    if (ctx.currentTrack) {
      ctx.history.unshift(ctx.currentTrack, ...skippedFromQueue);
    } else {
      ctx.history.unshift(...skippedFromQueue);
    }

    ctx.history = ctx.history.slice(0, 15);
    ctx.currentTrack = chosenSongId;

    this.saveSession(user.userId, ctx);
    return await this.getFullPlayerStatus(user.userId);
  }

  private async getFullPlayerStatus(userId: string) {
    const ctx = this.getSession(userId);
    if (!ctx) return null;

    const isAds = ctx.isAdsPlaying && ctx.nextAds;
    const nowPlayingType = isAds ? 'advertisement' : 'song';
    const nowPlayingId = isAds ? ctx.nextAds : ctx.currentTrack;

    const [nowPlayingDetail, queueDetails, historyDetails] = await Promise.all([
      this.getTrackDetail(nowPlayingType, nowPlayingId),
      Promise.all(ctx.queue.map((id) => this.getTrackDetail('song', id))),
      Promise.all(ctx.history.map((id) => this.getTrackDetail('song', id)))
    ]);

    return {
      nowPlayingId: nowPlayingId,
      nowPlaying: nowPlayingDetail ? { ...nowPlayingDetail, type: nowPlayingType } : null,
      queueIds: ctx.queue,
      queue: queueDetails.map((q) => (q ? { ...q, type: 'song' } : null)).filter(Boolean),
      history: historyDetails.map((h) => (h ? { ...h, type: 'song' } : null)).filter(Boolean)
    };
  }

  private async getTrackDetail(type: 'song' | 'advertisement', id: string) {
    if (type === 'song') {
      return await this.songService.getDetail(id);
    } else {
      return await this.adsService.getDetail(id);
    }
  }

  /* -------------------- Random song -------------------- */
  private async getRandomSong() {
    return await this.songService.genRandomSong();
  }

  /* -------------------- Random advertisement -------------------- */
  private async getRandomAds() {
    return await this.adsService.getRandomAds();
  }
}
