import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import AuditLog from '@/models/AuditLog';

export async function GET(req) {
  try {
    await dbConnect();
    
    // Fetch all logs sorted by newest first, limited to 100 for now
    const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100).lean();
    
    return NextResponse.json(logs);
  } catch (error) {
    console.error("Failed to fetch audit logs", error);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
