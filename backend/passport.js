import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import GitHubStrategy from "passport-github2";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "./models/User.js";
import crypto from "crypto";


dotenv.config();
const generateSecretKey = () => {
  return crypto.randomBytes(32).toString("hex");
}
const secretKey = generateSecretKey();
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {

        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            avatar: profile.photos[0].value,
          });
        }
        const token = jwt.sign({ id: user._id }, "Rahul");
        user.token = token;
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);
passport.use(new GitHubStrategy({
  clientID: process.env.GIT_CLIENT_ID,
  clientSecret: process.env.GIT_CLIENT_SECRET,
  callbackURL: 'http://localhost:8000/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ githubId: profile.id });
    if (!user) {
      user = await User.create({
        githubId: profile.id,
        username: profile.username,
        email: profile.emails ? profile.emails[0].value : "",
        avatar: profile.photos ? profile.photos[0].value : ""
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));
