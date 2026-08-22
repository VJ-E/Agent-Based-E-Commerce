import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db/mongoose';
import User from '@/models/User';

export async function GET(request) {
  try {
    const token = request.cookies.get('bentely_auth_token')?.value;
    if (!token) return NextResponse.json({ user: null }, { status: 200 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ user: null }, { status: 200 });

    await dbConnect();
    const user = await User.findById(payload.userId).select('name email role');
    
    if (!user) return NextResponse.json({ user: null }, { status: 200 });

    return NextResponse.json({ 
      user: { 
        _id: user._id.toString(), 
        name: user.name, 
        email: user.email,
        role: user.role 
      } 
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
