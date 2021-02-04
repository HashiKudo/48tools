import { useState, useEffect, ReactElement, Dispatch as D, SetStateAction as S, MouseEvent } from 'react';
import * as PropTypes from 'prop-types';
import type { Dispatch } from 'redux';
import { useDispatch } from 'react-redux';
import { Empty, Button, message } from 'antd';
import * as dayjs from 'dayjs';
import style from './qrcode.sass';
import { idbSaveAccount } from './reducers/weiboLogin';
import { requestQrcode, requestQrcodeCheck, requestLogin, requestCrossDomainUrl } from './services/WeiboLogin';
import type { QrcodeImage, QrcodeCheck, LoginReturn } from './services/interface';

let qrcodeLoginTimer: NodeJS.Timeout | null = null; // 轮循，判断是否登陆
let qrid: string | null = null;

/* 微博二维码 */
function Qrcode(props: { onCancel: Function }): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [imageData, setImageData]: [string | undefined, D<S<string | undefined>>] = useState(undefined); // 二维码

  // 登陆成功
  async function loginSuccess(alt: string): Promise<void> {
    const resLogin: LoginReturn = await requestLogin(alt);
    const resCookie: string[] = await requestCrossDomainUrl(resLogin.crossDomainUrlList[resLogin.crossDomainUrlList.length - 1]);
    const cookie: string = resCookie.map((o: string): string => o.split(/;\s*/)[0]).join('; ');

    await dispatch(idbSaveAccount({
      data: {
        id: resLogin.uid,
        username: resLogin.nick,
        cookie,
        lastLoginTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
    }));
    props.onCancel();
    message.success('登陆成功！');
  }

  // 判断是否登陆
  async function qrcodeLoginCheck(): Promise<void> {
    try {
      const res: QrcodeCheck = await requestQrcodeCheck(qrid!);

      if (Number(res.retcode) === 20000000) {
        loginSuccess(res.data.alt); // 登陆成功
      }
    } catch (err) {
      console.error(err);
    }

    qrcodeLoginTimer = setTimeout(qrcodeLoginCheck, 1_000);
  }

  // 生成二维码
  async function createQrcode(): Promise<void> {
    if (qrcodeLoginTimer !== null) {
      clearTimeout(qrcodeLoginTimer);
    }

    const res: QrcodeImage = await requestQrcode();

    qrid = res.data.qrid;
    setImageData(`https:${ res.data.image }`);
    qrcodeLoginTimer = setTimeout(qrcodeLoginCheck, 1_000);
  }

  // 重新生成二维码
  function handleResetCreateQrcodeClick(event: MouseEvent<HTMLButtonElement>): void {
    createQrcode();
  }

  useEffect(function(): () => void {
    createQrcode();

    return function(): void {
      if (qrcodeLoginTimer !== null) {
        clearTimeout(qrcodeLoginTimer);
      }

      qrid = null;
    };
  }, []);

  return (
    <div className={ style.content }>
      <div className={ style.qrcodeBox }>
        { imageData ? <img src={ imageData } /> : <Empty description={ false } /> }
      </div>
      <Button className={ style.resetBtn } onClick={ handleResetCreateQrcodeClick }>刷新二维码</Button>
    </div>
  );
}

Qrcode.propTypes = {
  onCancel: PropTypes.func // 关闭弹出层的回调函数
};

export default Qrcode;