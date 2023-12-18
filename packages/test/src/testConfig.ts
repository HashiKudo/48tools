interface TestConfig {
  bilibili: {
    useProxy: boolean;
    proxy: string;
    cookie?: string;
  };
  douyin: {
    cookie?: string;
  };
}

export const testConfig: TestConfig = {
  bilibili: {
    // 如果为true，会跑港澳台的测试用例
    useProxy: false,
    proxy: 'http://127.0.0.1:15732',
    cookie: '***REMOVED***'
  },
  douyin: {
    cookie: undefined
  }
};