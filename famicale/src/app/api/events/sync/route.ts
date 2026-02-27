import { NextRequest, NextResponse } from 'next/server';
import { googleCalendarService } from '@/lib/googleCalendar';
import { Event } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { event, action, googleEventId } = await request.json();
    
    // クライアントからトークンを取得
    const accessToken = request.headers.get('x-google-access-token');
    const refreshToken = request.headers.get('x-google-refresh-token');
    const expiryDate = request.headers.get('x-google-expiry-date');
    
    if (!accessToken || !refreshToken || !expiryDate) {
      return NextResponse.json(
        { error: 'Google Calendar認証が必要です' },
        { status: 401 }
      );
    }

    let result = null;

    switch (action) {
      case 'create':
        result = await googleCalendarService.createEvent(
          event as Event,
          accessToken,
          refreshToken,
          parseInt(expiryDate)
        );
        break;
      
      case 'update':
        if (!googleEventId) {
          return NextResponse.json(
            { error: 'Google Event IDが必要です' },
            { status: 400 }
          );
        }
        result = await googleCalendarService.updateEvent(
          event as Event,
          googleEventId,
          accessToken,
          refreshToken,
          parseInt(expiryDate)
        );
        break;
      
      case 'delete':
        if (!googleEventId) {
          return NextResponse.json(
            { error: 'Google Event IDが必要です' },
            { status: 400 }
          );
        }
        result = await googleCalendarService.deleteEvent(
          googleEventId,
          accessToken,
          refreshToken,
          parseInt(expiryDate)
        );
        break;
      
      default:
        return NextResponse.json(
          { error: '無効なアクションです' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Google Calendar同期エラー:', error);
    return NextResponse.json(
      { error: '同期に失敗しました' },
      { status: 500 }
    );
  }
}

