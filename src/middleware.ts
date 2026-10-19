// Ei file ta ar kono kaj kore na (purono Clerk version replace korar jonno).
// Nirapode delete kore deya jay.
import { NextResponse } from 'next/server';

export function middleware() {
  return NextResponse.next();
}

export const config = { matcher: ['/__unused__'] };
