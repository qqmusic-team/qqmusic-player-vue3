 
import { first, last, sampleSize, sample, chunk, trimEnd } from "lodash";
import dayjs from "dayjs";
import { useNumberFormat } from "@/utils/number";

declare global {
  interface Array<T> {
    /**
     * 获取数组第一个元素
     */
    first(_this: T[]): T;

    last(_this: T[]): T;
    sample(_this: T[]): T;

    /**
     * 获得 n 个随机元素
     * @param size
     */
    sampleSize(_this: T[], _size: number): T[];

    /**
     * 将数组（array）拆分成多个 size 长度的区块
     * @param size
     */
    chunk(_this: T[], _size: number): T[][];
  }

  interface String {
    /**
     * 转换成int类型
     */
    toInt(_this: string): number;

    trimEnd(_this: string, _chars?: string): string;
  }

  interface Number {
    toDate(_this: number, _format?: string): string;

    numberFormat(_this: number): string | number;
  }
}

Array.prototype.first = function <T>(this: T[]): T {
  return first<T>(this) as T;
};
Array.prototype.last = function <T>(this: T[]): T {
  return last<T>(this) as T;
};
Array.prototype.sample = function <T>(this: T[]): T {
  return sample<T>(this) as T;
};
Array.prototype.sampleSize = function <T>(this: T[], size: number): T[] {
  return sampleSize<T>(this, size) as T[];
};
Array.prototype.chunk = function <T>(this: T[], size: number): T[][] {
  return chunk<T>(this, size) as T[][];
};
String.prototype.toInt = function (this: string): number {
  return parseInt(this);
};

String.prototype.trimEnd = function (this: string, chars: string = " "): string {
  return trimEnd(this, chars);
};

Number.prototype.toDate = function (this: number, format: string = "YYYY-MM-DD"): string {
  return dayjs(this).format(format);
};

Number.prototype.numberFormat = function (this: number): string | number {
  return useNumberFormat(this);
};
