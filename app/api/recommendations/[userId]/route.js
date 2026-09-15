import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { userId } = params;
    const { searchParams } = new URL(request.url);
    const currentProductId = searchParams.get('current_product_id');
    const useV2 = searchParams.get('use_v2') === 'true';

    let apiUrl = process.env.RECOMMENDATION_API_URL; // usually ends with /api/recommend
    
    if (!apiUrl) {
      return NextResponse.json({ error: 'Recommendation API URL not configured' }, { status: 500 });
    }

    if (useV2) {
      // Replace /api/recommend with /api/recommend/v2
      apiUrl = apiUrl.replace(/\/api\/recommend\/?$/, '/api/recommend/v2');
    }

    let url = `${apiUrl}/${userId}`;
    if (currentProductId) {
      url += `?current_product_id=${currentProductId}`;
    }

    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch recommendations from backend' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching recommendations via proxy:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
