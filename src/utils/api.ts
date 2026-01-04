import type { Banner } from "@/models/banner";
import type {
  DjProgram,
  Personalized,
  PersonalizedMv,
  PersonalizedNewSong,
} from "@/models/personalized";
import type { PlayListDetail, PlaylistHighqualityTag } from "@/models/playlist";
import type { PlayListCat } from "@/models/playlist_cat";
import type { Song } from "@/models/song";
import type { SongUrl } from "@/models/song_url";
import type { TopListDetail } from "@/models/toplist_detail";
import http from "@/utils/http";
import type { Artist, Mv } from "@/models/artist";
import type { ArtistDesc, ArtistDetail } from "@/models/artist_detail";
import type { Album } from "@/models/album";
import type { PersonalizedPrivateContent, Video, VideoGroup } from "@/models/video";
import type { SearchHotDetail, SearchSuggest } from "@/models/search";
import type { MvUrl } from "@/models/mv";
import type { PlayListHot } from "@/models/playlist_hot";
import type { UserProfile } from "@/models/user";
import type { DJCategory, DJRadio, DJProgram as DJProgramFull } from "@/models/dj";

export async function useLogin(phone: string, password: string) {
  return await http.get<{
    code: number;
    cookie: string;
    token: string;
  }>("login/cellphone", { phone: phone, password: password });
}

export async function useLoginStatus() {
  return await http.get<{
    data: {
      code: number;
      profile: UserProfile;
    };
  }>("login/status");
}

export async function useSongUrl(id: number) {
  const { data } = await http.get<{ data: SongUrl[] }>("/song/url", { id: id });
  return data.first();
}

export async function useDetail(id: number): Promise<Song> {
  const { songs } = await http.get<{ songs: Song[] }>("/song/detail", { ids: id });
  return songs.first() as Song;
}

export async function useBanner() {
  const { banners } = await http.get<{ banners: Banner[] }>("/banner", { type: 1 });
  return banners;
}

export async function usePersonalized() {
  const { result } = await http.get<{ result: Personalized[] }>("/personalized");
  return result;
}

export async function usePersonalizedNewSong() {
  const { result } = await http.get<{ result: PersonalizedNewSong[] }>("/personalized/newsong");
  return result;
}

export async function usePlayListDetail(id: number, s: number = 8) {
  const { playlist } = await http.get<{ playlist: PlayListDetail }>("/playlist/detail", {
    id: id,
    s: s,
  });
  return playlist;
}

export async function usePlayListTrackAll(id: number) {
  const { songs } = await http.get<{ songs: Song[] }>("playlist/track/all", { id: id });
  return songs;
}

export async function useTopListDetail() {
  const { list } = await http.get<{ list: TopListDetail[] }>("/toplist/detail");
  return list;
}
export async function useArtistTopSongs(id: number) {
  return await http.get<{ songs: Song[] }>("artist/top/song", { id: id });
}
export async function usePlayListCatList() {
  const { sub, categories } = await http.get<{ sub: PlayListCat[]; categories: string[] }>(
    "playlist/catlist"
  );

  return { sub, categories };
}

export async function userArtistList(pageData: {
  type: number;
  area: number;
  initial: string;
  page: number;
  limit: number;
}) {
  const res = await http.get<{ artists: Artist[] }>("artist/list", {
    type: pageData.type,
    area: pageData.area,
    initial: pageData.initial,
    limit: pageData.limit,
    offset: (pageData.page - 1) * pageData.limit,
  });

  return res.artists;
}

export async function useArtistDetail(id: number) {
  const { data } = await http.get<{ data: ArtistDetail }>("artist/detail", { id: id });
  return data;
}

export async function useArtistDesc(id: number) {
  return await http.get<ArtistDesc>("artist/desc", { id: id });
}

export async function useArtistSongs(
  id: number,
  order: string = "time",
  limit: number = 10,
  offset: number = 0
) {
  return await http.get<{ songs: Song[] }>("artist/songs", {
    id: id,
    order: order,
    limit: limit,
    offset: offset,
  });
}

export async function useArtistAlbum(id: number, limit: number = 10, offset: number = 0) {
  return await http.get<{ hotAlbums: Album[] }>("artist/album", {
    id: id,
    limit: limit,
    offset: offset,
  });
}

export async function useArtistMv(id: number, limit: number = 10, offset: number = 0) {
  return await http.get<{ mvs: Mv[] }>("artist/mv", { id: id, limit: limit, offset: offset });
}

export async function useVideoTimelineRecommend(offset: number = 0) {
  const { datas } = await http.get<{ datas: Video[] }>("video/timeline/recommend", {
    offset: offset,
  });
  return datas;
}

export async function usePersonalizedPrivateContentList(limit: number = 10, offset: number = 0) {
  const { result } = await http.get<{ result: PersonalizedPrivateContent[] }>(
    "personalized/privatecontent/list",
    {
      limit: limit,
      offset: offset,
    }
  );
  return result;
}

export async function usePersonalizedMv() {
  const { result } = await http.get<{ result: PersonalizedMv[] }>("personalized/mv");
  return result;
}

export async function usePersonalizedDjProgram() {
  const { result } = await http.get<{ result: DjProgram[] }>("personalized/djprogram");
  return result;
}

export async function useVideoGroupList() {
  const { data } = await http.get<{ data: VideoGroup[] }>("video/group/list");
  return data;
}

export async function useVideoGroup(id?: number, offset?: number) {
  const { datas } = await http.get<{ datas: Video[] }>(id ? "video/group" : "video/timeline/all", {
    id: id,
    offset: offset,
  });
  return datas;
}

export async function useAlbum(id: number) {
  const { album, songs } = await http.get<{ album: Album; songs: Song[] }>("album", { id: id });

  return { album, songs };
}

export async function useSearchHotDetail() {
  const { data } = await http.get<{ data: SearchHotDetail[] }>("search/hot/detail");
  return data;
}

export async function useSearchSuggest(keywords: string) {
  const { result } = await http.get<{ result: SearchSuggest }>("search/suggest", {
    keywords: keywords,
  });
  return result;
}

export async function useMvDetail(_mvid: number) {}

export async function useMvUrl(id: number) {
  const { data } = await http.get<{ data: MvUrl }>("mv/url", { id: id });
  return data;
}

export async function usePlaylistHighqualityTags() {
  const { tags } = await http.get<{ tags: PlaylistHighqualityTag[] }>("playlist/highquality/tags");

  return tags;
}

export async function usePlaylistHot() {
  const { tags } = await http.get<{ tags: PlayListHot[] }>("playlist/hot");

  return tags;
}

export async function useTopPlaylistHighquality(params?: {
  limit?: number;
  before?: number;
  cat: string;
}) {
  return await http.get<{
    playlists: PlayListDetail[];
    total: number;
    more: boolean;
    lasttime: number;
  }>("top/playlist/highquality", params);
}

export async function usePlaylistByCategory(cat: string, limit: number = 10) {
  const { playlists } = await http.get<{ playlists: PlayListDetail[] }>("top/playlist", {
    cat: cat,
    limit: limit,
  });
  return playlists;
}

export async function useSimilarSongs(id: number) {
  const { songs } = await http.get<{ songs: Song[] }>("simi/song", { id: id });
  return songs;
}

export async function useDownloadSong(id: number) {
  const songDetail = await useDetail(id);
  const songUrl = await useSongUrl(id);

  return {
    song: songDetail,
    url: songUrl.url,
  };
}

export async function useCommentHot(id: number, limit: number = 10) {
  const { hotComments, total } = await http.get<{
    hotComments: Record<string, unknown>[];
    total: number;
  }>("comment/hot", {
    id: id,
    type: 0,
    limit: limit,
  });
  return { hotComments, total };
}

export async function useAlbumList(area: string = "ALL", limit: number = 30, offset: number = 0, sort: string = "latest") {
  return await http.get<{
    products: {
      albumId: number;
      albumName: string;
      coverUrl: string;
      pubTime: number;
      [key: string]: unknown;
    }[];
    total: number;
    more: boolean;
  }>("album/list", {
    area: area,
    limit: limit,
    offset: offset,
    sort: sort,
  });
}

export async function useAlbumNewest(area: string = "ALL", limit: number = 10) {
  return await http.get<{ albums: Album[]; total: number }>("album/newest", {
    area: area,
    limit: limit,
  });
}

export async function useAlbumNew(area: string = "ALL", limit: number = 10) {
  return await http.get<{
    albums: {
      id: number;
      name: string;
      picUrl: string;
      publishTime: number;
      [key: string]: unknown;
    }[];
    total: number;
  }>("album/new", {
    area: area,
    limit: limit,
  });
}

export async function useAlbumToplist() {
  return await http.get<{ albumList: Album[] }>("album/toplist");
}

export async function useAlbumSaleboard(type: number = 1) {
  return await http.get<{ data: Record<string, unknown>[] }>("album/saleboard", {
    albumType: type,
  });
}

export async function useAlbumDetailDynamic(id: number) {
  return await http.get<{
    isSub: boolean;
    subCount: number;
    shareCount: number;
    commentCount: number;
  }>("album/detail/dynamic", {
    id: id,
  });
}

export async function useDjCatelist() {
  const { categories } = await http.get<{ categories: DJCategory[] }>("dj/catelist");
  return categories;
}

export async function useDjRecommend() {
  const { data } = await http.get<{ data: DJRadio[] }>("dj/recommend");
  return data;
}

export async function useDjHot(cateId?: number, limit: number = 6) {
  const { djRadios } = await http.get<{ djRadios: DJRadio[] }>("dj/hot", {
    cateId: cateId,
    limit: limit,
  });
  return djRadios;
}

export async function useDjProgram(rid: number, limit: number = 30, offset: number = 0) {
  const { count, programs } = await http.get<{ count: number; programs: DJProgramFull[] }>(
    "dj/program",
    {
      rid: rid,
      limit: limit,
      offset: offset,
    }
  );
  return { count, programs };
}

export async function useDjProgramToplist(limit: number = 30, offset: number = 0) {
  const { count, toplist } = await http.get<{ count: number; toplist: DJProgramFull[] }>(
    "dj/program/toplist",
    {
      limit: limit,
      offset: offset,
    }
  );
  return { count, toplist };
}

export async function useDjProgramDetail(id: number) {
  const { program } = await http.get<{ program: DJProgramFull }>("dj/program/detail", {
    id: id,
  });
  return program;
}

export async function useDjRadioHot(cateId?: number, limit: number = 30, offset: number = 0) {
  const { count, djRadios } = await http.get<{ count: number; djRadios: DJRadio[] }>(
    "dj/radio/hot",
    {
      cateId: cateId,
      limit: limit,
      offset: offset,
    }
  );
  return { count, djRadios };
}

export async function useDjRadioPaygift(limit: number = 4, offset: number = 0) {
  const { data } = await http.get<{ data: DJRadio[] }>("dj/paygift", {
    limit: limit,
    offset: offset,
  });
  return data;
}

export async function useDjToplist(limit: number = 30, offset: number = 0) {
  const { toplist } = await http.get<{ toplist: DJRadio[] }>("dj/toplist", {
    limit: limit,
    offset: offset,
  });
  return toplist;
}

export async function useDjCategoryRecommend() {
  const { data } = await http.get<{ data: DJRadio[] }>("dj/category/recommend");
  return data;
}

export async function useDjRadioDetail(id: number) {
  const { data } = await http.get<{ data: DJRadio }>("dj/detail", { rid: id });
  return data;
}

/**
 * 获取个性化推荐歌单，支持指定数量
 * @param limit 返回数量
 */
export async function usePersonalizedWithLimit(limit: number = 10) {
  const { result } = await http.get<{ result: Personalized[] }>("/personalized", { limit });
  return result;
}
