// authPassport.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const pool = require("./db");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email =
          profile.emails && profile.emails[0] && profile.emails[0].value;
        const name = profile.displayName || null;

        // Buscar usuario por google_id
        const q = "SELECT * FROM users WHERE google_id = $1";
        const r = await pool.query(q, [googleId]);

        if (r.rows.length) {
          return done(null, r.rows[0]);
        } else {
          // Insertar nuevo usuario
          const ins =
            "INSERT INTO users (google_id, email, name) VALUES ($1,$2,$3) RETURNING *";
          const res = await pool.query(ins, [googleId, email, name]);
          return done(null, res.rows[0]);
        }
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// No usamos sesiones; pero Passport requiere serialize/deserialize si las usas.
// Para esta configuración no son necesarios, pero los dejamos por si acaso:
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

module.exports = passport;
