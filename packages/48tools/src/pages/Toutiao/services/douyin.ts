import got, { type Response as GotResponse } from 'got';
import { pcUserAgent } from '../../../utils/utils';
import { awemePostQuery } from '../Douyin/function/signUtils';
import type { AwemePostResponse, DouyinHtmlResponseType, DouyinUserApiType } from './interface';
import type { VideoQuery } from '../types';

type RequestDouyinHtmlReturn = (urlCb: string | ((url?: string) => string), cookie?: string) => Promise<DouyinHtmlResponseType>;

/**
 * 获取抖音网页的html
 * @param { string } url: 抖音地址
 */
function requestDouyinHtml(url?: string): RequestDouyinHtmlReturn {
  async function _requestDouyinHtml(urlCb: string | ((url?: string) => string), cookie: string = ''): Promise<DouyinHtmlResponseType> {
    const uri: string = typeof urlCb === 'function' ? urlCb(url) : urlCb;
    const res: GotResponse<string> = await got.get(uri, {
      responseType: 'text',
      headers: {
        'User-Agent': pcUserAgent,
        Cookie: '__ac_referer=__ac_blank;' + cookie,
        Host: new URL(uri).host
      },
      followRedirect: false
    });

    const acNonceStr: string | undefined = res?.headers?.['set-cookie']?.find?.(
      (o: string): boolean => o.includes('__ac_nonce'));

    return acNonceStr ? {
      type: 'cookie',
      cookie: acNonceStr.split(/s*;s*/)[0].split(/=/)[1],
      html: res.body
    } : {
      type: 'html',
      html: res.body
    };
  }

  return _requestDouyinHtml;
}

export const requestDouyinVideo: RequestDouyinHtmlReturn = requestDouyinHtml('https://www.douyin.com/video/');
export const requestDouyinUser: RequestDouyinHtmlReturn = requestDouyinHtml('https://www.douyin.com/user/');
export const requestDouyinUrl: RequestDouyinHtmlReturn = requestDouyinHtml();

/**
 * 抖音302地址的处理
 * @param { string } uri
 */
export async function requestGetVideoRedirectUrl(uri: string): Promise<string> {
  const res: GotResponse<string> = await got.get(uri, {
    responseType: 'text',
    headers: {
      Host: 'www.douyin.com',
      'User-Agent': pcUserAgent
    },
    followRedirect: false
  });

  return res.body;
}

/**
 * 请求user的视频列表
 * @param { string } cookie: string
 * @param { VideoQuery } videoQuery: user id
 */
export async function requestAwemePost(cookie: string, videoQuery: VideoQuery): Promise<AwemePostResponse | string> {
  const query: string = awemePostQuery(videoQuery.secUserId, videoQuery.maxCursor);
  const res: GotResponse<AwemePostResponse> = await got.get(
    `https://www.douyin.com/aweme/v1/web/aweme/post/?${ query }`, {
      responseType: 'json',
      headers: {
        Referer: `https://www.douyin.com/user/${ videoQuery.secUserId }`,
        Host: 'www.douyin.com',
        'User-Agent': pcUserAgent,
        Cookie: cookie
      },
      followRedirect: false
    });

  return res.body;
}

export async function requestAwemePostReturnType(cookie: string, videoQuery: VideoQuery): Promise<DouyinUserApiType> {
  const res: AwemePostResponse | string = await requestAwemePost(cookie, videoQuery);

  return { type: 'userApi', data: typeof res === 'object' ? res : undefined };
}

/* 请求ttwid */
export async function requestTtwidCookie(): Promise<string | undefined> {
  const res: GotResponse = await got.post('https://ttwid.bytedance.com/ttwid/union/register/', {
    responseType: 'json',
    json: {
      region: 'union',
      aid: 1768,
      needFid: false,
      service: 'www.ixigua.com',
      migrate_info: { ticket: '', source: 'source' },
      cbUrlProtocol: 'https',
      union: true
    }
  });

  return res.headers?.['set-cookie']?.[0];
}