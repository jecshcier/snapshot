export default class ResponseMessage {

  successMessage(obj: any) {
    return {
      errCode: 0,
      msg: 'success',
      ...obj
    }
  }

  errorMessage(obj: any) {
    return {
      errCode: 1,
      msg: 'fail',
      ...obj
    }
  }
}