/**
 * Upcoming Notes API Route
 * GET: 다가오는 일정 조회 (7일 이내)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { NoteService } from '@/features/notes/services/noteService';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const babyId = searchParams.get('babyId');
    const withinDays = parseInt(searchParams.get('withinDays') || '7');

    if (!babyId) {
      return NextResponse.json(
        { error: 'babyId is required' },
        { status: 400 }
      );
    }

    const noteService = new NoteService();
    const notes = await noteService.getUpcomingNotes(babyId, withinDays);

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('GET /api/notes/upcoming error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
