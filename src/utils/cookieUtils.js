class CookieUtils {
  setAuthCookies(res, accessToken, refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
  }

  clearAuthCookies(res) {
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
  }
}

module.exports = new CookieUtils();
