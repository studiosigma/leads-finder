import { NextResponse } from 'next/server';

export async function GET() {
  const defaultJobs = [
    {
      id: 'job-preset-1',
      query: 'Pabrik Plastik & Manufaktur di Bekasi',
      cron_expression: 'Every Day at 08:00 AM',
      next_run: 'Tomorrow at 08:00 AM',
      auto_sync: true,
      status: 'ACTIVE',
    },
    {
      id: 'job-preset-2',
      query: 'Rumah Sakit & Klinik di Tambun',
      cron_expression: 'Every Monday at 09:00 AM',
      next_run: 'Next Monday at 09:00 AM',
      auto_sync: true,
      status: 'ACTIVE',
    },
  ];

  return NextResponse.json({
    status: 'success',
    schedules: defaultJobs,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      status: 'success',
      message: 'Schedule created',
      schedule: body,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
