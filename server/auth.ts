
import { google } from 'googleapis';
import { Request, Response } from 'express';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://your-repl-url.replit.dev/auth/callback' // Update this with your Repl URL
);

export const authRoutes = {
  login: (_req: Request, res: Response) => {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    });
    res.redirect(url);
  },

  callback: async (req: Request, res: Response) => {
    try {
      const { code } = req.query;
      const { tokens } = await oauth2Client.getToken(code as string);
      oauth2Client.setCredentials(tokens);

      // Get user info
      const oauth2 = google.oauth2('v2');
      const userInfo = await oauth2.userinfo.get({ auth: oauth2Client });

      if (req.session) {
        req.session.tokens = tokens;
        req.session.user = userInfo.data;
      }

      res.redirect('/');
    } catch (error) {
      console.error('Auth callback error:', error);
      res.redirect('/auth/error');
    }
  },

  logout: (req: Request, res: Response) => {
    if (req.session) {
      req.session.destroy(() => {
        res.redirect('/');
      });
    } else {
      res.redirect('/');
    }
  }
};
