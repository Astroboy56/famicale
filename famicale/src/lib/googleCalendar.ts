// サーバーサイド専用のGoogle Calendar API設定
// クライアントサイドでは使用しない

import { google } from 'googleapis';
import { Event } from '@/types';

// Google Calendar API設定
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google';

// OAuth2クライアント
const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

// Google Calendar API
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// トークン管理
class TokenManager {
  private static instance: TokenManager;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiryDate: number | null = null;

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  // トークンを設定
  setTokens(accessToken: string, refreshToken: string, expiryDate: number) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiryDate = expiryDate;
  }

  // トークンを読み込み（サーバーサイド専用）
  loadTokens(accessToken?: string, refreshToken?: string, expiryDate?: number) {
    if (accessToken && refreshToken && expiryDate) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.expiryDate = parseInt(expiryDate.toString());
      return true;
    }
    return false;
  }

  // トークンが有効かチェック
  isTokenValid(): boolean {
    if (!this.accessToken || !this.expiryDate) {
      return false;
    }
    return Date.now() < this.expiryDate;
  }

  // アクセストークンを取得
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // リフレッシュトークンを取得
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  // トークンをクリア
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.expiryDate = null;
  }
}

// Google Calendarサービス
class GoogleCalendarService {
  private tokenManager = TokenManager.getInstance();

  // 認証URLを生成
  generateAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  // 認証コードからトークンを取得
  async getTokensFromCode(code: string): Promise<{ accessToken: string; refreshToken: string; expiryDate: number } | null> {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      
      if (tokens.access_token && tokens.refresh_token && tokens.expiry_date) {
        this.tokenManager.setTokens(
          tokens.access_token,
          tokens.refresh_token,
          tokens.expiry_date
        );
        
        // OAuth2クライアントにトークンを設定
        oauth2Client.setCredentials(tokens);
        
        return {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiryDate: tokens.expiry_date
        };
      }
      return null;
    } catch (error) {
      console.error('トークン取得エラー:', error);
      return null;
    }
  }

  // 認証状態をチェック
  async checkAuth(accessToken?: string, refreshToken?: string, expiryDate?: number): Promise<boolean> {
    // トークンを設定
    if (accessToken && refreshToken && expiryDate) {
      this.tokenManager.loadTokens(accessToken, refreshToken, expiryDate);
    }

    // トークンが有効かチェック
    if (!this.tokenManager.isTokenValid()) {
      // リフレッシュトークンで更新を試行
      return await this.refreshTokens();
    }

    // OAuth2クライアントにトークンを設定
    const currentAccessToken = this.tokenManager.getAccessToken();
    if (currentAccessToken) {
      oauth2Client.setCredentials({ access_token: currentAccessToken });
      return true;
    }

    return false;
  }

  // トークンをリフレッシュ
  async refreshTokens(): Promise<boolean> {
    const refreshToken = this.tokenManager.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      oauth2Client.setCredentials({ refresh_token: refreshToken });
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      if (credentials.access_token && credentials.expiry_date) {
        this.tokenManager.setTokens(
          credentials.access_token,
          refreshToken,
          credentials.expiry_date
        );
        
        oauth2Client.setCredentials(credentials);
        return true;
      }
      return false;
    } catch (error) {
      console.error('トークンリフレッシュエラー:', error);
      this.tokenManager.clearTokens();
      return false;
    }
  }

  // イベントをGoogle Calendarに作成
  async createEvent(event: Event, accessToken?: string, refreshToken?: string, expiryDate?: number): Promise<string | null> {
    try {
      const isAuthenticated = await this.checkAuth(accessToken, refreshToken, expiryDate);
      if (!isAuthenticated) {
        throw new Error('Google Calendar認証が必要です');
      }

      const googleEvent = {
        summary: event.title,
        description: event.description || '',
        start: {
          dateTime: event.isAllDay ? undefined : `${event.date}T${event.time || '00:00'}:00`,
          date: event.isAllDay ? event.date : undefined,
          timeZone: 'Asia/Tokyo',
        },
        end: {
          dateTime: event.isAllDay ? undefined : `${event.date}T${event.time || '23:59'}:00`,
          date: event.isAllDay ? event.date : undefined,
          timeZone: 'Asia/Tokyo',
        },
        colorId: this.getColorId(event.type),
        extendedProperties: {
          private: {
            famicaleEventId: event.id,
            familyMemberId: event.familyMemberId,
            eventType: event.type
          }
        }
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: googleEvent,
      });

      return response.data.id || null;
    } catch (error) {
      console.error('Google Calendarイベント作成エラー:', error);
      return null;
    }
  }

  // イベントをGoogle Calendarで更新
  async updateEvent(event: Event, googleEventId: string, accessToken?: string, refreshToken?: string, expiryDate?: number): Promise<boolean> {
    try {
      const isAuthenticated = await this.checkAuth(accessToken, refreshToken, expiryDate);
      if (!isAuthenticated) {
        throw new Error('Google Calendar認証が必要です');
      }

      const googleEvent = {
        summary: event.title,
        description: event.description || '',
        start: {
          dateTime: event.isAllDay ? undefined : `${event.date}T${event.time || '00:00'}:00`,
          date: event.isAllDay ? event.date : undefined,
          timeZone: 'Asia/Tokyo',
        },
        end: {
          dateTime: event.isAllDay ? undefined : `${event.date}T${event.time || '23:59'}:00`,
          date: event.isAllDay ? event.date : undefined,
          timeZone: 'Asia/Tokyo',
        },
        colorId: this.getColorId(event.type),
        extendedProperties: {
          private: {
            famicaleEventId: event.id,
            familyMemberId: event.familyMemberId,
            eventType: event.type
          }
        }
      };

      await calendar.events.update({
        calendarId: 'primary',
        eventId: googleEventId,
        requestBody: googleEvent,
      });

      return true;
    } catch (error) {
      console.error('Google Calendarイベント更新エラー:', error);
      return false;
    }
  }

  // イベントをGoogle Calendarから削除
  async deleteEvent(googleEventId: string, accessToken?: string, refreshToken?: string, expiryDate?: number): Promise<boolean> {
    try {
      const isAuthenticated = await this.checkAuth(accessToken, refreshToken, expiryDate);
      if (!isAuthenticated) {
        throw new Error('Google Calendar認証が必要です');
      }

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: googleEventId,
      });

      return true;
    } catch (error) {
      console.error('Google Calendarイベント削除エラー:', error);
      return false;
    }
  }

  // イベントタイプからGoogle Calendarの色IDを取得
  private getColorId(eventType: string): string {
    const colorMap: { [key: string]: string } = {
      'work': '1',      // ラベンダー
      'school': '2',    // セージ
      'hospital': '3',  // グレープ
      'travel': '4',    // フラミンゴ
      'other': '5',     // バナナ
    };
    return colorMap[eventType] || '5';
  }

  // ログアウト
  logout(): void {
    this.tokenManager.clearTokens();
  }
}

// シングルトンインスタンス
export const googleCalendarService = new GoogleCalendarService();
