'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Logo } from '@/components/icons';
import { FirebaseError } from 'firebase/app';
import { doc, setDoc } from 'firebase/firestore';
import type { DoctorProfile } from '@/lib/types';

export default function LoginPage() {
  const [email, setEmail] = useState('e.reed@pulseguard.io');
  const [password, setPassword] = useState('password');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: 'Login Successful',
          description: 'Welcome back, Doctor!',
        });
        router.push('/');
      } catch (error) {
        if (error instanceof FirebaseError && (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential')) {
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const newDoctorName = 'Dr. Evelyn Reed';

            // IMPORTANT: Update the user's Auth profile
            await updateProfile(user, { displayName: newDoctorName });

            // Create a doctor profile document in Firestore
            const doctorDocRef = doc(firestore, 'doctors', user.uid);
            const newDoctorProfile: DoctorProfile = {
                id: user.uid,
                name: newDoctorName,
                dateOfBirth: "1982-03-15",
                age: 42,
                speciality: 'Cardiology',
                idCardNumber: `DOC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
            };
            
            await setDoc(doctorDocRef, newDoctorProfile);

            toast({
              title: 'Account Created & Logged In',
              description: 'Welcome, Doctor! A new account has been created for you.',
            });
            router.push('/');
          } catch (createError) {
             console.error('Sign up failed:', createError);
             toast({
                variant: 'destructive',
                title: 'Sign-up Failed',
                description: 'Could not create a new account. Please try again.',
             });
          }
        } else {
            console.error('Login failed:', error);
            toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'An unexpected error occurred. Please try again.',
            });
        }
      }
    });
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
            <Logo className="w-12 h-12 mx-auto mb-2 text-primary" />
          <CardTitle className="text-2xl">HeartGuard</CardTitle>
          <CardDescription>
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Logging in...' : 'Login / Sign Up'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
