// redux saga
import { delay} from 'redux-saga';
import {call, all, fork, put, take, takeLatest} from 'redux-saga/effects'
// redux actions
import {
  ActionInitizeDone,
  ActionSetLoginInformation, 
  ActionSetPartsCount,
  ActionSetAllUserNames,
  IAction,
  ActionClearLoginInformation,
} from './actions'

// other libs
import axios from 'axios'
import qs from 'qs'
import {Notification} from 'element-react'

// helpers
import {serverURL} from './config'
import getAuthHeader from './authHeader'

// get current user's status from the server, and ask again in 60 seconds
export function* getMyStatus() {
  try {
    const res = yield call(axios.get,serverURL+'/api/currentUser', getAuthHeader());
    const {id, fullName, groups, token} = res.data;
    if (id === 'guest') {
      // force logout if current user becomes a guest
      yield put(ActionClearLoginInformation());
    } else {
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('tokenTimeStamp', new Date().toLocaleString());
      }
      // save id, full name and groups to redux store.
      yield put(ActionSetLoginInformation(id, fullName, groups));
      // yield call(delay, 60000);
      // yield put({type:'GET_MY_STATUS'});
    }
  } catch (err) {
    // force log out if any error happened
    yield put(ActionClearLoginInformation());
  }
}

// initialize, get token and other information from server to fill sotre states.
export function* initialize() {
  try {
    const res = yield call(axios.get,serverURL+'/api/currentUser', getAuthHeader());
    const {id, fullName, groups, token} = res.data;
    if (id === 'guest') {
      yield put(ActionClearLoginInformation());
    } else {
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('tokenTimeStamp', new Date().toLocaleString());
      }
      yield put(ActionSetLoginInformation(id, fullName, groups));
      // get notifications when initilizing
      yield put({type:'GET_NOTIFICATIONS'});
    }
  } catch (err) {
    yield put(ActionClearLoginInformation());
  }
  yield put(ActionInitizeDone());
}

// get all user names from server
export function* getUserList() {
  try {
    const res = yield call(axios.get,serverURL+'/api/users/names/', getAuthHeader());
    yield put(ActionSetAllUserNames(res.data));
  } catch (err) {
    if (err.response && err.response.status === 401) {
      yield put(ActionClearLoginInformation());
    }
  }
}

function showNotification(notification: any) {
  Notification.info({
    title: notification.title,
    message: notification.message,
    duration: 10000,
    onClick: () => {
      window.location.href = notification.link;
    }
  })
}

// get all notifications from the server if current user is admin
export function* getNotifications() {
  try {
    const lastNotificationTime = localStorage.getItem('lastNotificationTime');
    if (lastNotificationTime===null || Date.now() - (new Date(lastNotificationTime).getTime()) > 3600000) {
      localStorage.setItem('lastNotificationTime', new Date().toISOString());
      const res = yield call(axios.get,serverURL+'/api/notifications', getAuthHeader());
      for (const notification of res.data) {
        yield call(showNotification,notification);
        yield call(delay, 10000);
      }
      yield call(delay, 600000); // 10 minutes
      yield put({type:'GET_NOTIFICATIONS'}); // fetch notifications again
    }
  } catch (err) {
    // do nothing because the user isn't an admin.
  }
}

export function* watchMyInformation() {
  yield takeLatest('INITIALIZE', initialize);
  yield takeLatest('GET_MY_STATUS', getMyStatus);
  yield takeLatest('GET_USER_LIST', getUserList);
  yield takeLatest('GET_NOTIFICATIONS', getNotifications);
}

export function* getPartsCount() {
  try {
    const res = yield call(axios.get,serverURL+'/api/parts/count', getAuthHeader());
    yield put(ActionSetPartsCount(res.data));
  } catch (err) {
    if (err.response && err.response.status === 401) {
      yield put(ActionClearLoginInformation());
    }
  }
}

export function* getParts(action: IAction) {
  const {type, skip, limit, user, sortBy, desc} = action.data;
  const res = yield call(
    axios.get, serverURL+'/api/parts?' + 
    qs.stringify({
    type,
    skip,
    limit,
    user,
    sortBy,
    desc,
  }),
  getAuthHeader());
  console.log(res);
  let data = [];
  switch (type) {
  case 'bacterium':
    data = res.data.map(item => ({
      labName: item.labName,
      personalName: item.personalName,
      tags: item.content.tags ? item.content.tags.join('; ') : '',
      hostStrain: item.content.hostStrain ? item.content.hostStrain : '',
      markers: item.content.markers ? item.content.markers.join('; ') : '',
      date: item.date ? (new Date(item.date)).toLocaleDateString() : '',
      comment: item.comment ? item.comment : '',
      attachments: item.attachments,
    }))
  break;
  case 'primer':
    data = res.data.map(item => ({
      labName: item.labName,
      personalName: item.personalName,
      tags: item.content.tags ? item.content.tags.join('; ') : '',
      date: item.date ? (new Date(item.date)).toLocaleDateString() : '',
      comment: `${item.content.description} ${item.comment}`,
      attachments: item.attachments,
      sequence: item.content.sequence,
      orientation: item.content.orientation,
      meltingTemperature: item.content.meltingTemperature,
      concentration: item.content.concentration,
      vendor: item.content.vendor,
    }))
  case 'yeast':
  case 'primer':
    data = res.data.map(item => ({
      labName: item.labName,
      personalName: item.personalName,
      tags: item.content.tags ? item.content.tags.join('; ') : '',
      date: item.date ? (new Date(item.date)).toLocaleDateString() : '',
      comment: item.comment,
      attachments: item.attachments,
      
      parents: item.content.parents ? item.content.parents.join('; ') : '' ,
      genotype: item.content.genotype ? item.content.genotype.join('; ') : '' ,
      plasmidType: item.content.plasmidType,
      markers: item.content.markers ? item.content.markers.join('; ') : '' ,
    }))
  break;
  }
}

function* addPartsToBasket(action:IAction) {
  const ids = action.data;
  try {
    const res = yield call(axios.post, serverURL+'/api/picklist/0/items/', ids, getAuthHeader());
    yield put({type:'SET_CURRENT_BASKET', data:res.data});
  } catch (err) {
    Notification.error('failed to add parts into basket');
  }
}

function* getCurrentBasket(action:IAction) {
  try {
    const res = yield call(axios.get, serverURL+'/api/picklist/0', getAuthHeader());
    yield put({type:'SET_CURRENT_BASKET', data:res.data});
  } catch (err) {
    Notification.error('failed read basket');
  }
}

function* deletePartFromBasket(action:IAction) {
  const {basketId, partId} = action.data;
  try {
    const res = yield call(axios.delete, serverURL+`/api/picklist/${basketId}/items/${partId}`, getAuthHeader());
    yield put({type:'SET_CURRENT_BASKET', data:res.data});
  } catch (err) {
    Notification.error('failed read basket');
  }
}

function* clearBasket(action:IAction) {
  const basketId = action.data;
    try {
    const res = yield call(axios.delete, serverURL+`/api/picklist/${basketId}/items/`, getAuthHeader());
    yield put({type:'SET_CURRENT_BASKET', data:res.data});
  } catch (err) {
    Notification.error('failed read basket');
  }
}

export function* watchParts() {
  yield takeLatest('GET_PARTS_COUNT', getPartsCount);
  yield takeLatest('GET_PARTS', getParts);
  yield takeLatest('ADD_PARTS_TO_BASKET', addPartsToBasket);
  yield takeLatest('GET_CURRENT_BASKET', getCurrentBasket);
  yield takeLatest('DELETE_PART_FROM_BASKET', deletePartFromBasket);
  yield takeLatest('CLEAR_BASKET', clearBasket);
}

export default function* rootSaga() {
  yield all([
    fork(watchMyInformation),
    fork(watchParts),
  ]);
}