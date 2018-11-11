// redux action

// interface of all actions
export interface IAction {
  type: string,
  data: any,
}

// dispatched when currentUser and notification downloaded at the first time.
export const INITIALIZE_DONE = 'INITIALIZE_DONE';
export function ActionInitizeDone () {
  return {type: INITIALIZE_DONE};
}

// dispatched when user clicks login button in the login dialog
export const LOGIN = 'LOGIN';
export function ActionLogin (
  username :string, 
  profilePicture: string,
  groups :string,
) {
  return {
    type: LOGIN,
    data: {username, profilePicture, groups}
  }
}

// dispatched when user clicks the login menu item
export const LOGIN_DIALOG_VISIBLE = 'SHOW_LOGIN';
export function ActionLoginDialogVisible (
  visible: boolean,
) {
  return {
    type: LOGIN_DIALOG_VISIBLE,
    data: {visible},
  }
}

// dispatched when get new current user information from the server
export const SET_LOGIN_INFORMATION = 'SET_LOGIN_INFORMATION';
export function ActionSetLoginInformation (
  id: string,
  name: string,
  groups: string[],
) {
  return {
    type: SET_LOGIN_INFORMATION,
    data: {
      id,
      name,
      groups,
    }
  }
}

// dispatched when user logs out
export const CLEAR_LOGIN_INFORMATION = 'CLEAR_LOGIN_INFORMATION';
export function ActionClearLoginInformation() {
  return {
    type: CLEAR_LOGIN_INFORMATION,
  }
}

// dispatched when saga has got the parts count from the server
export const SET_PARTS_COUNT = 'SET_PARTS_COUNT';
export function ActionSetPartsCount(data) {
  return {
    type: SET_PARTS_COUNT,
    data,
  }
}

// dispatched when saga has fetched all user names from the server
export const SET_ALL_USER_NAMES = 'SET_ALL_USER_NAMES';
export function ActionSetAllUserNames(data) {
  return {
    type: SET_ALL_USER_NAMES,
    data,
  }
}

// dispatched when new part dialog needs to pop out
export const SET_NEW_PART_DIALOG_VISIBLE = 'SET_NEW_PART_DIALOG_VISIBLE'
export function ActionSetNewPartDialogVisible(data) {
  return {
    type: SET_NEW_PART_DIALOG_VISIBLE,
    data,
  }
}

// dispatched when edit part dialog needs to pop out
export const SET_EDIT_PART_DIALOG_VISIBLE = 'SET_EDIT_PART_DIALOG_VISIBLE'
export function ActionSetEditPartDialogVisible(visible: boolean, partId?: string) {
  return {
    type: SET_EDIT_PART_DIALOG_VISIBLE,
    data:{visible, partId},
  }
}

// dispatched when "upload parts dialog" needs to pop out
export const SET_UPLOAD_PARTS_DIALOG_VISIBLE = 'SET_UPLOAD_PARTS_DIALOG_VISIBLE'
export function ActionSetUploadPartsDialogVisible(data) {
  return {
    type: SET_UPLOAD_PARTS_DIALOG_VISIBLE,
    data,
  }
}

// dispatched when 'basket name' changes when it is edited
export const SET_A_BASKET_NAME = 'SET_A_BASKET_NAME'
export function ActionSetABasketName(basketId:string, basketName :string) {
  return {
    type: SET_A_BASKET_NAME,
    data:{basketId, basketName},
  }
}
