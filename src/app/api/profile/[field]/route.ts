import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { verifySession } from '@/lib/auth'; // Adjust the import path as needed

export async function PUT(req: NextRequest, { params }: { params: { field: string } }) {
  try {
    // Verify session and get authenticated user
    const session = await verifySession();

    // Check if user is authenticated
    if (!session.isAuth || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use the authenticated user's ID
    const userId = session.userId;

    // Log the entire request for debugging
    const contentType = req.headers.get('content-type');
    console.log('Content-Type:', contentType);

    // More comprehensive body parsing
    let body;
    try {
      // Attempt to parse JSON
      body = await req.json();
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);

      // If JSON parsing fails, try to get the body as text
      const rawBody = await req.text();
      console.log('Raw request body:', rawBody);

      // Attempt to parse text as JSON if possible
      try {
        body = JSON.parse(rawBody);
      } catch (textParseError) {
        console.error('Text parsing error:', textParseError);
        return NextResponse.json(
          { error: 'Unable to parse request body. Please send valid JSON.' },
          { status: 400 }
        );
      }
    }

    // Validate body is an object
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be a valid JSON object' },
        { status: 400 }
      );
    }

    // Await the params to resolve the initial error
    const field = params.field;

    let updateData: Record<string, any> = {};

    // Validation and update logic
    switch (field) {
      case 'name':
        if (!body.name || typeof body.name !== 'string') {
          return NextResponse.json({ error: 'Valid name is required' }, { status: 400 });
        }
        updateData.name = body.name.trim();
        break;

      case 'about':
        if (!body.about || typeof body.about !== 'string') {
          return NextResponse.json({ error: 'Valid about text is required' }, { status: 400 });
        }
        updateData.about = body.about.trim();
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!body.email || !emailRegex.test(body.email)) {
          return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }
        updateData.email = body.email.toLowerCase().trim();
        break;

      case 'password':
        if (!body.password || !body.confirmPassword) {
          return NextResponse.json(
            { error: 'Password and Confirm Password are required' },
            { status: 400 }
          );
        }
        if (body.password !== body.confirmPassword) {
          return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
        }
        if (body.password.length < 8) {
          return NextResponse.json(
            { error: 'Password must be at least 8 characters long' },
            { status: 400 }
          );
        }
        const hashedPassword = await bcrypt.hash(body.password, 10);
        updateData.password_hash = hashedPassword;
        break;

      case 'profile-picture':
        if (!body.profilePicture || typeof body.profilePicture !== 'string') {
          return NextResponse.json({ error: 'Valid profile picture is required' }, { status: 400 });
        }
        updateData.avatar_url = body.profilePicture;
        break;

      default:
        return NextResponse.json({ error: 'Invalid update field' }, { status: 400 });
    }

    // Perform database update
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true
      }
    });

    return NextResponse.json({ 
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`, 
      user: updatedUser 
    });

  } catch (error) {
    // More detailed error logging
    console.error('Profile update error:', error);
    
    // Detailed error response
    return NextResponse.json(
      { 
        error: 'Update failed', 
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        fullError: error
      }, 
      { status: 500 }
    );
  }
}