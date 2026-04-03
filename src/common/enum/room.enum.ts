export enum RoomStatus {
  WAITING = 'WAITING',
  STREAMING = 'STREAMING',
  PAUSED = 'PAUSED',
  ENDED = 'ENDED'
}

export enum RoomSourceType {
  SONG = 'SONG',
  ALBUM = 'ALBUM',
  PLAYLIST = 'PLAYLIST'
}

export enum RoomQueueItemStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PLAYING = 'PLAYING',
  PLAYED = 'PLAYED',
  REMOVED = 'REMOVED'
}

export enum RoomParticipantStatus {
  ACTIVE = 'ACTIVE',
  LEFT = 'LEFT',
  KICKED = 'KICKED',
  BANNED = 'BANNED'
}

export enum RoomParticipantRole {
  HOST = 'HOST',
  LISTENER = 'LISTENER'
}

export enum RoomModerationAction {
  KICK = 'KICK',
  BAN = 'BAN'
}

export enum RoomControlAction {
  PLAY = 'PLAY',
  PAUSE = 'PAUSE',
  SEEK = 'SEEK',
  NEXT = 'NEXT',
  END = 'END',
  SYNC = 'SYNC'
}
