import * as fs from 'fs';
import * as moment from 'moment';
import { BILIBILI_COOKIE_KEY, BilibiliCookie } from '../components/BilibiliLogin/Qrcode';

/* 获取ffmpeg的地址 */
export function getFFmpeg(): string {
  const ffmpegPath: string | null = localStorage.getItem('FFMPEG_PATH'); // 本机配置

  if (ffmpegPath && fs.existsSync(ffmpegPath)) {
    return ffmpegPath;
  }

  return 'ffmpeg';
}

/* 随机字符串 */
export function rStr(len: number): string {
  const str: string = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890';
  let result: string = '';

  for (let i: number = 0; i < len; i++) {
    const rIndex: number = Math.floor(Math.random() * str.length);

    result += str[rIndex];
  }

  return result;
}

/* 拼接静态文件地址 */
export function source(pathname: string): string {
  if (/^https?/i.test(pathname)) {
    return pathname;
  } else {
    return `https://source3.48.cn/${ pathname }`;
  }
}

/* 获取bilibili的cookie */
export function getBilibiliCookie(): string | undefined {
  const cookieStr: string | null = localStorage.getItem(BILIBILI_COOKIE_KEY);

  if (!cookieStr) {
    return undefined;
  }

  const cookie: BilibiliCookie = JSON.parse(cookieStr);

  return cookie.cookie;
}

export const fileTimeFormat: string = 'YYYY-MM-DD~HH.mm.ss';

/**
 * 生成适合文件路径的时间
 * @param { number | string } value: 时间戳
 */
export function getFileTime(value?: number | string): string {
  if (value) {
    return moment(typeof value === 'string' ? Number(value) : value).format(fileTimeFormat);
  } else {
    return moment().format(fileTimeFormat);
  }
}