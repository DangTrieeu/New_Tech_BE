class CookieUtils {
  setAuthCookies(res, accessToken, refreshToken) {
    // refreshToken: httpOnly để bảo mật, chỉ backend đọc được
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' cho cross-site trong production
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // accessToken: KHÔNG httpOnly để FE có thể đọc và lưu vào localStorage
    res.cookie('accessToken', accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' cho cross-site trong production
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
  }

  clearAuthCookies(res) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    res.clearCookie('accessToken', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
  }
}

module.exports = new CookieUtils();
