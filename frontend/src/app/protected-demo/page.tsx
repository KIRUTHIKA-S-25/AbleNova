'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { useAuthStore } from '@/store/useAuthStore';
import { ShieldCheck, LogOut, UserCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ProtectedDemoPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <PageContainer
          title="Protected Route Foundation Demo"
          subtitle="Temporary Frontend Architecture Verification for Authenticated Sessions"
          action={
            <Button variant="danger" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>Log Out</span>
            </Button>
          }
        >
          <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
            <Alert variant="info" title="Frontend Architecture Test">
              This page is a <strong>temporary frontend test route</strong> verifying that the <code>ProtectedRoute</code> component properly guards access and manages mock authentication state before real backend integration in later phases.
            </Alert>

            <Card className="glow-mint border-2 border-teal-400 dark:border-yellow-400 p-6">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-600 dark:bg-yellow-400 text-white dark:text-black flex items-center justify-center font-bold text-xl shadow-md glow-mint">
                    <UserCheck className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Authenticated User Session
                      <Badge variant="success" className="text-xs">Active Mock Auth</Badge>
                    </CardTitle>
                    <CardDescription>Mock session loaded from local storage abstraction</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">User Name</span>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{user?.name || 'Alex River'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</span>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{user?.email || 'alex.student@ablenova.local'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Role</span>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100 capitalize">{user?.role || 'student'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">User ID</span>
                    <p className="text-sm font-mono text-slate-700 dark:text-slate-300">{user?.id || 'usr_demo_001'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button variant="accent" onClick={() => router.push('/onboarding')} className="gap-2">
                    <Sparkles className="w-4 h-4" aria-hidden="true" />
                    <span>Run Onboarding Flow</span>
                  </Button>

                  <Button variant="outline" onClick={() => router.push('/accessibility')} className="gap-2">
                    <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                    <span>Accessibility Preferences</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                <span>Phase 4 Protected Route Capabilities Verified</span>
              </div>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 pl-7 list-disc">
                <li>Unauthenticated users navigating to protected routes are automatically redirected to <code>/login</code>.</li>
                <li>Authenticating via Login or Demo Account stores the session token and enables full access.</li>
                <li>Logging out clears local storage tokens and returns the user to the Login page.</li>
              </ul>
            </Card>
          </div>
        </PageContainer>
      </AppShell>
    </ProtectedRoute>
  );
}
