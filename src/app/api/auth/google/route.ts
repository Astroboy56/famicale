import { NextRequest, NextResponse } from 'next/server';
import { googleCalendarService } from '@/lib/googleCalendar';

export async function GET(request: NextRequest) {
  try {
    const authUrl = googleCalendarService.generateAuthUrl();
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Google認証URL生成エラー:', error);
    return NextResponse.json(
      { error: '認証URLの生成に失敗しました' },
      { status: 500 }
    );
  }
}
