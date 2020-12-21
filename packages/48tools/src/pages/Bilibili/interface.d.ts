// 接口请求到的视频信息
export interface VideoInfo {
  durl?: Array<{
    backup_url: string;
    url: string;
  }>;
  format: string;
}

// 接口请求到的音频信息
export interface AudioInfo {
  code: number;
  data: {
    cdns?: Array<string>;
  };
  message: string;
}

// 直播间信息
export interface RoomInit {
  code: number;
  msg: string;
  message: string;
  data: {
    room_id: number;
    short_id: number;
    uid: number;
    live_status: number;
  };
}

// 直播间地址信息
export interface RoomPlayUrl {
  code: number;
  message: string;
  data: {
    durl: Array<{ url: string }>;
  };
}