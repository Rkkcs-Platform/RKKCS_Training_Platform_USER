export const TOAST_MESSAGES = {
  auth: {
    loginSuccess: 'Đăng nhập thành công',
    loginFailed: 'Đăng nhập thất bại. Email hoặc mật khẩu không đúng',
    missingCredentials: 'Vui lòng nhập email và mật khẩu',
    logoutSuccess: 'Đăng xuất thành công',
    sessionExpired: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại',
  },
  challenge: {
    loadFailed: 'Không tải được challenge hôm nay',
    submitFailed: 'Gửi mã thất bại. Vui lòng thử lại',
    correct: 'Đúng mã',
    wrong: 'Sai mã',
    completed: 'Đã nhập xong',
  },
  history: {
    loadFailed: 'Không tải được lịch sử',
    detailFailed: 'Không tải được chi tiết ngày này',
  },
  common: {
    success: 'Thành công',
    failed: 'Thất bại',
    requestFailed: 'Có lỗi xảy ra. Vui lòng thử lại',
  },
} as const
