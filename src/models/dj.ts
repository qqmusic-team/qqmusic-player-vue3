export interface DJBanner {
	targetId: number;
	targetType: number;
	pic: string;
	url: string;
	typeTitle: string;
	exclusive: boolean;
}

export interface DJCategory {
	id: number;
	name: string;
	pic84x84Id: number;
	pic84x84Str: string;
	picWeb: string;
	picPCWhite: string;
	picPCBlack: string;
	pic84x84: string;
}

export interface DJRadio {
	id: number;
	name: string;
	picId: number;
	picUrl: string;
	pic84x84Id: number;
	pic84x84: string;
	programCount: number;
	subCount: number;
	createTime: number;
	categoryId: number;
	category: string;
	rcmdText: string;
	fee: number;
	copyrightId: number;
	artistId: number;
	artists: DJRadioArtist[];
	dj: DJRadioDJ;
	description: string;
}

export interface DJRadioArtist {
	id: number;
	name: string;
	picId: number;
	img1v1Id: number;
	briefDesc: string;
	picUrl: string;
	img1v1Url: string;
	albumSize: number;
	alias: unknown[];
	trans: string;
	musicSize: number;
	topicPerson: number;
}

export interface DJRadioDJ {
	id: number;
	name: string;
	picId: number;
	img1v1Id: number;
	briefDesc: string;
	picUrl: string;
	img1v1Url: string;
	albumSize: number;
	alias: unknown[];
	trans: string;
	musicSize: number;
	topicPerson: number;
}

export interface DJProgram {
	id: number;
	name: string;
	copywriter: string;
	mainSong: DJProgramMainSong;
	dj: DJProgramDJ;
	radio: DJProgramRadio;
	serial: number;
	createTime: number;
	commentCount: number;
	likedCount: number;
	listenerCount: number;
	shareCount: number;
	subscribedCount: number;
	duration: number;
	description: string;
	coverUrl: string;
	blurCoverUrl: string;
}

export interface DJProgramMainSong {
	id: number;
	name: string;
	position: number;
	alias: unknown[];
	status: number;
	fee: number;
	copyrightId: number;
	disc: string;
	no: number;
	artists: DJProgramMainSongArtist[];
	album: DJProgramMainSongAlbum;
	starred: boolean;
	popularity: number;
	score: number;
	starredNum: number;
	duration: number;
	playedNum: number;
	dayPlays: number;
	hearTime: number;
	ringtone: string;
	copyFrom: string;
	commentThreadId: string;
	ftype: number;
	rtUrls: unknown[];
	copyright: number;
	mark: number;
	originCoverType: number;
	single: number;
	mvid: number;
	rtype: number;
	exclusive: boolean;
}

export interface DJProgramMainSongArtist {
	name: string;
	id: number;
	picId: number;
	img1v1Id: number;
	briefDesc: string;
	picUrl: string;
	img1v1Url: string;
	albumSize: number;
	alias: unknown[];
	trans: string;
	musicSize: number;
	topicPerson: number;
}

export interface DJProgramMainSongAlbum {
	name: string;
	id: number;
	type: string;
	size: number;
	picId: number;
	blurPicUrl: string;
	companyId: number;
	pic: number;
	picUrl: string;
	publishTime: number;
	description: string;
	tags: string;
	company: string;
	briefDesc: string;
	artist: DJProgramMainSongArtist;
	songs: unknown[];
	alias: unknown[];
	status: number;
	copyrightId: number;
	commentThreadId: string;
	artists: DJProgramMainSongArtist[];
	subType: string;
	onSale: boolean;
	mark: number;
	picId_str: string;
}

export interface DJProgramDJ {
	id: number;
	name: string;
	picId: number;
	img1v1Id: number;
	briefDesc: string;
	picUrl: string;
	img1v1Url: string;
	albumSize: number;
	alias: unknown[];
	trans: string;
	musicSize: number;
	topicPerson: number;
}

export interface DJProgramRadio {
	id: number;
	name: string;
	picId: number;
	picUrl: string;
	pic84x84Id: number;
	pic84x84: string;
	programCount: number;
	subCount: number;
	createTime: number;
	categoryId: number;
	category: string;
	rcmdText: string;
	fee: number;
	copyrightId: number;
	artistId: number;
	artists: DJProgramMainSongArtist[];
	dj: DJProgramDJ;
	description: string;
}
