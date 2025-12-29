import { defineStore } from "pinia";
import { ref } from "vue";
import type { PersonalizedPrivateContent, Video, VideoGroup } from "@/models/video";
import { usePersonalizedMv, usePersonalizedPrivateContentList, useVideoGroupList, useVideoTimelineRecommend } from "@/utils/api";
import type { PersonalizedMv } from "@/models/personalized";

export const useVideoStore = defineStore('video', () => {

    const videoTimelineRecommend = ref<Video[]>([])
    const getVideoTimelineRecommend = async () => {
        if (videoTimelineRecommend.value.length) return;
        videoTimelineRecommend.value = await useVideoTimelineRecommend()
    }


    const personalizedPrivateContent = ref<PersonalizedPrivateContent[]>([])
    const getPersonalizedPrivateContent = async (forceRefresh: boolean = false) => {
        // 如果有缓存数据且不强制刷新，则直接返回
        if (personalizedPrivateContent.value.length && !forceRefresh) return;
        console.log('Loading personalized private content...');
        try {
            const data = await usePersonalizedPrivateContentList(4);
            console.log('Personalized private content data:', data);
            // 确保数据是数组格式
            if (Array.isArray(data)) {
                personalizedPrivateContent.value = data;
            } else {
                console.error('Personalized private content data is not an array:', data);
                personalizedPrivateContent.value = [];
            }
        } catch (error) {
            console.error('Error loading personalized private content:', error);
            personalizedPrivateContent.value = [];
        }
    }

    const personalizedMv = ref<PersonalizedMv[]>([])
    const getPersonalizedMv = async () => {
        if (personalizedMv.value.length) return;
        personalizedMv.value = await usePersonalizedMv()
    }

    const videoGroup = ref<VideoGroup[]>([])
    const getVideoGroup = async () => {
        if (videoGroup.value.length) return;
        videoGroup.value = await useVideoGroupList()
    }

    return {
        videoTimelineRecommend, getVideoTimelineRecommend,

        personalizedPrivateContent, getPersonalizedPrivateContent,

        personalizedMv, getPersonalizedMv,

        videoGroup, getVideoGroup,
    }

});
