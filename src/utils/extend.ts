import {first,last, sampleSize,sample, chunk, trimEnd} from 'lodash'
import dayjs from 'dayjs'

// 扩展全局接口
declare global {
    interface Array<T> {
        /**
         * 获取数组第一个元素
         */
        first<T>(this: T[]): T

        last<T>(this: T[]): T
        sample<T>(this: T[]): T

        /**
         * 获得 n 个随机元素
         * @param size
         */
        sampleSize<T>(this: T[], size: number): T[]

        /**
         * 将数组（array）拆分成多个 size 长度的区块
         * @param size
         */
        chunk<T>(this: T[], size: number): T[][]

    }

    interface String {
        /**
         * 转换成int类型
         */
        toInt(this: string): number

        trimEnd(this: string, chars?: string): string
    }

    interface Number {
        toDate(this: number, format?: string): string

        numberFormat(this: number): string | number
    }
}

// 实现数组扩展方法
Array.prototype.first = function <T>(this: T[]): T {
    return first<T>(this) as T
}
Array.prototype.last = function <T>(this: T[]): T {
    return last<T>(this) as T
}
Array.prototype.sample = function <T>(this: T[]): T {
    return sample<T>(this) as T
}
Array.prototype.sampleSize = function <T>(this: T[], size: number): T[] {
    return sampleSize<T>(this, size) as T[]
}
Array.prototype.chunk = function <T>(this: T[], size: number): T[][] {
    return chunk<T>(this, size) as T[][]
}

// 实现字符串扩展方法
String.prototype.toInt = function (this: string): number {
    return parseInt(this)
}

String.prototype.trimEnd = function (this: string, chars: string = ' '): string {
    return trimEnd(this, chars)
}

// 实现数字扩展方法
Number.prototype.toDate = function (this: number, format: string = 'YYYY-MM-DD'): string {
    return dayjs(this).format(format)
}

// 数字格式化工具函数
export function useNumberFormat(number: number): string | number {
    if (number > 100000000) {
        return Number((number / 100000000).toFixed(1)) + ' 亿';
    }

    if (number > 10000000) {
        return Number((number / 10000000).toFixed(1)) + ' 千万';
    }

    if (number > 10000) {
        return Number((number / 10000).toFixed(1)) + ' 万';
    }

    return number;
}

// 播放时间格式化函数
export function useFormatDuring(during: number): string {
    const s = Math.floor(during) % 60;
    during = Math.floor(during / 60);
    const i = during % 60;

    const ii = i < 10 ? `0${i}` : i;
    const ss = s < 10 ? `0${s}` : s;

    return ii + ':' + ss;
}

// 导出格式化函数到全局
Number.prototype.numberFormat = function (this: number): string | number {
    return useNumberFormat(this)
}
