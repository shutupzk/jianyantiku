
import moment from 'moment';
import crypto from 'crypto';

//MD5签名
export const md5 = (str) => {
  var md5sum = crypto.createHash('md5');
  md5sum.update(str);
  str = md5sum.digest('hex');
  return str;
};

export const checkPhoneNumber = (phone) => {
  const r = /(1([3578][0-9]))\d{8}/;
  return (r.test(phone) && (phone.length === 11));
}

export const checkIdCard = (num) => {
  const re = new RegExp(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/);
  let arrSplit = num.match(re);
  let dtmBirth = new Date(arrSplit[2] + "/" + arrSplit[3] + "/" + arrSplit[4]);
  let bGoodDay;
  bGoodDay = (dtmBirth.getFullYear() === Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) === Number(arrSplit[3])) && (dtmBirth.getDate() === Number(arrSplit[4]));
  if (!bGoodDay) {
    return false;
  } else {
    let valnum;
    let arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    let arrCh = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    let nTemp = 0, i;
    for (i = 0; i < 17; i++) {
      nTemp += num.substr(i, 1) * arrInt[i];
    }
    valnum = arrCh[nTemp % 11];
    if (valnum !== num.substr(17, 1)) {
      return false;
    }
    return num;
  }
}

export const subBirthday = (certNo) => {
  return certNo.substr(6, 4) + '-' + certNo.substr(10, 2) + '-' + certNo.substr(12, 2)
}

export const subSex = (certNo) => {
  return certNo.substr(16, 1) % 2 + ""
}

export const getAge = (birthDay) => {
  return moment().format('YYYY') * 1 - birthDay.substr(0, 4) * 1
}

export const createTradeNo = () => {
  let year = (moment().format('YY') * 1 - 15)
  let seconds = moment().format('DDD') * 24 * 60 * 60 + moment().format('HH') * 60 * 60 + moment().format('mm') * 60 + moment().format('ss') * 1
  let order = seconds.toString(36)
  order = secondsFormat(order, 5)
  let ran = ((Math.random() + '').substr(4, 3) + moment().format('SSS'))
  let random = (ran * 1).toString(36)
  random = secondsFormat(random, 4)
  order = year.toString(36) + order
  order += random
  return order.toUpperCase()
}

export const createTransactionNo = () => {
  let date = moment().format('YYYYMMDDHHmmss')
  let sss = moment().format('SSS')
  sss = secondsFormat(sss, 3)
  let r1 = (Math.random() + '').substr(4, 3)
  let r2 = (Math.random() + '').substr(4, 3)
  let r3 = (Math.random() + '').substr(4, 3)
  let r4 = (Math.random() + '').substr(4, 3)
  return date + sss + r1 + r2 + r3 + r4
}

function secondsFormat(str, length) {
  if (str.length >= length) {
    return str
  } else {
    for (; str.length < length;) {
      str = '0' + str
    }
    return str
  }
}
