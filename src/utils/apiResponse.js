class ApiResponse {
  static success(res, message = 'Thành công', data = {}) {
    return res.status(200).json({
      status: 200,
      message,
      data,
    });
  }

  static error(res, message = 'Đã xảy ra lỗi', code = 400, error = null) {
    return res.status(code).json({
      status: code,
      message,
      error,
    });
  }
}

module.exports = ApiResponse;