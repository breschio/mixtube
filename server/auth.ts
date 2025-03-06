import { createClient } from '@supabase/supabase-js';
import { Request, Response } from 'express';

// Create a single Supabase client instance
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

export const authRoutes = {
  login: async (_req: Request, res: Response) => {
    try {
      const { data } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.VITE_APP_URL}/auth/callback`
        }
      });

      if (data.url) {
        res.redirect(data.url);
      } else {
        res.redirect('/auth/error');
      }
    } catch (error) {
      console.error('Login error:', error);
      res.redirect('/auth/error');
    }
  },

  callback: async (req: Request, res: Response) => {
    try {
      const code = req.query.code as string;

      if (!code) {
        throw new Error('No code provided');
      }

      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error || !session) {
        throw error || new Error('Failed to get session');
      }

      if (req.session) {
        req.session.user = session.user;
        req.session.access_token = session.access_token;
      }

      res.redirect('/');
    } catch (error) {
      console.error('Auth callback error:', error);
      res.redirect('/auth/error');
    }
  },

  logout: async (req: Request, res: Response) => {
    try {
      await supabase.auth.signOut();

      if (req.session) {
        req.session.destroy(() => {
          res.redirect('/');
        });
      } else {
        res.redirect('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
      res.redirect('/');
    }
  }
};