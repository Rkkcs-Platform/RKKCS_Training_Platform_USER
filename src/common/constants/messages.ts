export const TOAST_MESSAGES = {
  auth: {
    loginSuccess: 'Đăng nhập thành công',
    loginFailed: 'Đăng nhập thất bại. Email hoặc mật khẩu không đúng',
    missingCredentials: 'Vui lòng nhập email và mật khẩu',
    logoutSuccess: 'Đăng xuất thành công',
    sessionExpired: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại',
  },
  challenge: {
    loadFailed: 'Không tải được danh sách mã',
    submitFailed: 'Gửi mã thất bại. Vui lòng thử lại',
    correct: 'Mã hợp lệ',
    wrong: 'Không tìm thấy mã trên hệ thống',
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

export const APP_LABELS = {
  appName: 'RKKCS Operations Platform',
  brandShort: 'RKKCS',
} as const

export const PAGE_LABELS = {
  challenge: {
    submitted: 'Đã nhập',
    correct: 'Mã hợp lệ',
    wrong: 'Không hợp lệ',
    loadFailedTitle: 'Không tải được dữ liệu hôm nay',
    loadFailedHint: 'Kiểm tra kết nối mạng rồi thử lại.',
    retry: 'Thử lại',
    completedBanner: 'Bạn đã hoàn thành nhập mã hôm nay.',
    todayResultTitle: 'Kết quả hôm nay',
  },
  statistics: {
    title: 'Thống kê',
    description: 'Tổng quan quá trình nhập mã của bạn',
    totalDays: 'Số ngày tham gia',
    completedDays: 'Ngày hoàn thành',
    totalCorrect: 'Tổng mã hợp lệ',
    totalWrong: 'Tổng mã không hợp lệ',
    accuracy: 'Tỷ lệ đúng',
    loadFailed: 'Không tải được thống kê',
  },
} as const
