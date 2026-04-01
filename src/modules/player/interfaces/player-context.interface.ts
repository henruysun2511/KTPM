export interface IPlayerContext {
  userId: string;

  currentTrack: string; // id bài hiện tại
  queue: string[]; // danh sách bài sắp phát
  history: string[]; // lưu tối đa 3 bài đã nghe xong

  playlistId?: string;
  albumId?: string;

  isPremium: boolean;

  songPlayedCount: number; // đếm để chèn quảng cáo
  nextAds?: string | null; // id quảng cáo được chọn
  isAdsPlaying: boolean;
}
