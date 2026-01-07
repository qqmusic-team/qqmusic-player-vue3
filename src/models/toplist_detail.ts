 import type { Song } from "./song";

export interface TopListDetail {
	subscribers: unknown[];
	subscribed?: unknown;
	creator?: unknown;
	artists?: unknown;
	tracks: Song[];
	updateFrequency: string;
	backgroundCoverId: number;
	backgroundCoverUrl?: unknown;
	titleImage: number;
	titleImageUrl?: unknown;
	englishTitle?: unknown;
	opRecommend: boolean;
	recommendInfo?: unknown;
	subscribedCount: number;
	cloudTrackCount: number;
	userId: number;
	highQuality: boolean;
	createTime: number;
	specialType: number;
	coverImgId: number;
	newImported: boolean;
	anonimous: boolean;
	updateTime: number;
	trackCount: number;
	coverImgUrl: string;
	commentThreadId: string;
	trackUpdateTime: number;
	totalDuration: number;
	privacy: number;
	playCount: number;
	trackNumberUpdateTime: number;
	adType: number;
	description: string;
	ordered: boolean;
	tags: unknown[];
	status: number;
	name: string;
	id: number;
	coverImgId_str: string;
	ToplistType: string;
}
 
