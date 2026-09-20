import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('bentely_auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    await dbConnect();
    const user = await User.findById(decoded.userId);
    
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Return a masked version of the key if it exists
    let maskedKey = null;
    if (user.groqApiKey) {
      maskedKey = user.groqApiKey.substring(0, 4) + '*'.repeat(user.groqApiKey.length - 8) + user.groqApiKey.substring(user.groqApiKey.length - 4);
      if (user.groqApiKey.length < 10) maskedKey = '********'; // Fallback for very short strings
    }

    return NextResponse.json({ hasKey: !!user.groqApiKey, maskedKey });
  } catch (error) {
    console.error('Error fetching API key:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('bentely_auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { apiKey, action } = await request.json();

    await dbConnect();
    
    if (action === 'delete') {
      await User.findByIdAndUpdate(decoded.userId, { $unset: { groqApiKey: 1 } });
      return NextResponse.json({ message: 'API Key removed' });
    }

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
      return NextResponse.json({ error: 'Invalid API Key' }, { status: 400 });
    }

    await User.findByIdAndUpdate(decoded.userId, { groqApiKey: apiKey.trim() });
    
    return NextResponse.json({ message: 'API Key saved successfully' });
  } catch (error) {
    console.error('Error saving API key:', error);
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}
