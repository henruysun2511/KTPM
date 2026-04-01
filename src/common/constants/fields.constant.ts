export const FIELDS = {
  ALBUM: {
    CLIENT: '_id name img'
  },
  SONG: {
    CLIENT: 'imageUrl name artistId'
  },
  PLAYLIST: {
    CLIENT: 'name'
  },
  ARTIST: {
    ADMIN: '_id name biography country status followers avatarUrl',
    CLIENT: 'avatarUrl name'
  },
  NEWS: {
    CLIENT: 'title content imageUrl status createdAt'
  }
};
