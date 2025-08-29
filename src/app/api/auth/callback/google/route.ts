import { NextRequest, NextResponse } from 'next/server';
import { googleCalendarService } from '@/lib/googleCalendar';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google認証エラー:', error);
      return NextResponse.redirect(new URL('/settings?error=auth_failed', request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/settings?error=no_code', request.url));
    }

    const success = await googleCalendarService.getTokensFromCode(code);
    
    if (success) {
      return NextResponse.redirect(new URL('/settings?success=google_auth', request.url));
    } else {
      return NextResponse.redirect(new URL('/settings?error=token_failed', request.url));
    }
  } catch (error) {
    console.error('Google認証コールバックエラー:', error);
    return NextResponse.redirect(new URL('/settings?error=callback_failed', request.url));
  }
}
