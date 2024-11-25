'use server'

import { LoginFormSchema, SignupFormSchema, type FormState, type SessionPayload } from './definitions';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from './prisma';
import bcrypt from 'bcryptjs';

const secretKey = process.env.JWT_SECRET;
const key = new TextEncoder().encode(secretKey);

export async function signup(
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  //1. Validate from fields
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // 2. Prepare data for insertion into database
  const { name, email, password } = validatedFields.data;

  //3. Check if the user's email already exists
  const existingUser = await prisma.user.findUnique({ where: { email }})

  if (existingUser) {
    return {
      message: 'Email already exists, please use a different email or login.',
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the user in the database
  const data = await prisma.user.create({
    data: { email, password_hash: hashedPassword, name },
  })

  const userId = data.id;
  await createSession(userId);

}

export async function login(
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  // 1. Validate form fields
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  const errorMessage = { message: 'Invalid login credentials.' };

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  // 2. Query the database for the user with the given email
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  // If user is not found, return early
  if (!user) {
    return errorMessage;
  }

  // 3. Compare the user's password with the hashed password in the database
  const passwordMatch = await bcrypt.compare(password, user.password_hash);

  // If the password does not match, return early
  if (!passwordMatch) {
    return errorMessage;
  }

  // 4. If login successful, create a session for the user and return success
  const userId = user.id.toString();
  await createSession(userId);

  return {
    message: 'Login successful!',
  };
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1hr')
    .sign(key);
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  const session = await encrypt({ userId, expiresAt });

  (await cookies()).set('session', session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });

  redirect('/u/dashboard');
}

export async function verifySession() {
  const cookie = (await cookies()).get('session')?.value;

  if (!cookie) {
    return { isAuth: false, userId: null };
  }

  const session = await decrypt(cookie);

  if (!session || !session.userId) {
    return { isAuth: false, userId: null };
  }

  const userId = typeof session.userId === 'string' ? session.userId : null;

  return { isAuth: true, userId };
}

export async function updateSession() {
  const session = (await cookies()).get('session')?.value;
  const payload = await decrypt(session);

  if (!session || !payload) {
    return null;
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  (await cookies()).set('session', session, {
    httpOnly: true,
    secure: true,
    expires: expires,
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteSession() {
  (await cookies()).delete('session');
  redirect('/auth/login');
}





