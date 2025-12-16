const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

class GoogleConfig {
  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID;
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    this.callbackURL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback";
    
    if (!this.clientId || !this.clientSecret) {
      console.warn("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not defined");
    }
  }

  setupStrategy() {
    passport.use(
      new GoogleStrategy(
        {
          clientID: this.clientId,
          clientSecret: this.clientSecret,
          callbackURL: this.callbackURL,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const userData = {
              googleId: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
              avatar_url: profile.photos[0]?.value,
              emailVerified: profile.emails[0].verified,
            };
            
            return done(null, userData);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );

    passport.serializeUser((user, done) => {
      done(null, user);
    });

    passport.deserializeUser((user, done) => {
      done(null, user);
    });
  }

  getPassport() {
    return passport;
  }
}

module.exports = new GoogleConfig();
