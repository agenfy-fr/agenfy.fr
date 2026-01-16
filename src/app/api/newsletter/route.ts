import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      );
    }

    // Insertion dans Supabase
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([
        {
          email,
          subscribed_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      // Si l'email existe déjà
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Cet email est déjà inscrit' },
          { status: 409 }
        );
      }

      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de l\'inscription' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Inscription réussie', data },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
