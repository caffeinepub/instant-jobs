import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, Shield, Key, Smartphone } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface InternetIdentityHelpDialogProps {
  trigger?: React.ReactNode;
}

export default function InternetIdentityHelpDialog({ trigger }: InternetIdentityHelpDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            What is Internet Identity?
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">About Internet Identity</DialogTitle>
          <DialogDescription>
            Learn how to sign in and create your account using Internet Identity
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* What is Internet Identity */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">What is Internet Identity?</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Internet Identity is a secure, privacy-focused authentication system that lets you
                sign in without passwords. It uses cryptographic keys stored on your device to keep
                your account safe. Unlike traditional login systems, Internet Identity doesn't track
                your activity across different apps.
              </p>
            </div>

            <Separator />

            {/* Why not Google? */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Why not Google sign-in?</h3>
              <p className="text-sm text-muted-foreground">
                This application uses Internet Identity instead of Google OAuth or other
                third-party authentication providers. Internet Identity offers enhanced privacy and
                security by keeping your authentication data on your device rather than with a
                third-party service.
              </p>
            </div>

            <Separator />

            {/* How to create an account */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Creating Your Internet Identity</h3>
              </div>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    1
                  </span>
                  <span>
                    Click the "Sign in with Internet Identity" button in the header or on the
                    landing page
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    2
                  </span>
                  <span>
                    If you're new, click "Create New" on the Internet Identity page that opens
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    3
                  </span>
                  <span>
                    Choose your authentication method (Face ID, fingerprint, security key, or
                    passkey)
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    4
                  </span>
                  <span>
                    You'll receive a unique Identity Anchor number - save this number! You'll need
                    it to sign in from other devices
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    5
                  </span>
                  <span>Complete the setup and you'll be signed in automatically</span>
                </li>
              </ol>
            </div>

            <Separator />

            {/* How to sign in */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Signing In</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Once you've created your Internet Identity, signing in is easy:
              </p>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    1
                  </span>
                  <span>Click "Sign in with Internet Identity"</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    2
                  </span>
                  <span>Enter your Identity Anchor number (if on a new device)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    3
                  </span>
                  <span>Authenticate using your chosen method (Face ID, fingerprint, etc.)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    4
                  </span>
                  <span>You'll be signed in and can start using Instant Jobs</span>
                </li>
              </ol>
            </div>

            <Separator />

            {/* Security note */}
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Security tip:</strong> Your Internet Identity
                is tied to your device's authentication method. Make sure to add recovery methods
                in your Internet Identity settings so you can access your account if you lose your
                device.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
