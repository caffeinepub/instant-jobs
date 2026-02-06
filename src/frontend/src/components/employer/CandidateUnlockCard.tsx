import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, Linkedin, Github, Mail, Phone, Building2, MapPin, Briefcase, IndianRupee } from 'lucide-react';
import type { UserProfile } from '../../backend';
import { formatInr } from '../../utils/formatInr';
import UnlockConfirmDialog from './UnlockConfirmDialog';

interface CandidateUnlockCardProps {
  candidate: UserProfile;
  isUnlocked: boolean;
  onUnlock: () => void;
}

export default function CandidateUnlockCard({ candidate, isUnlocked, onUnlock }: CandidateUnlockCardProps) {
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const candidateProfile = candidate.candidate!;

  return (
    <>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-xl">
                {isUnlocked ? candidateProfile.fullName : '••••••••'}
                {isUnlocked ? (
                  <Unlock className="h-4 w-4 text-green-600" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {candidateProfile.jobRole || 'Professional'}
              </p>
            </div>
            {!isUnlocked && (
              <Button onClick={() => setShowUnlockDialog(true)} size="sm">
                <Lock className="mr-2 h-4 w-4" />
                Unlock Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bio */}
          {candidate.bio && (
            <p className="text-sm text-muted-foreground">{candidate.bio}</p>
          )}

          {/* Basic Info - Always visible */}
          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Experience:</span>
              <span>{candidateProfile.totalExperience} years</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Location:</span>
              <span>{candidateProfile.preferredLocation}</span>
            </div>
          </div>

          {/* Locked/Unlocked Content */}
          {isUnlocked ? (
            <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-green-700 dark:text-green-400" />
                <span className="font-medium">Email:</span>
                <a href={`mailto:${candidateProfile.email}`} className="text-green-700 hover:underline dark:text-green-400">
                  {candidateProfile.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-green-700 dark:text-green-400" />
                <span className="font-medium">Mobile:</span>
                <span className="text-green-700 dark:text-green-400">{candidateProfile.mobileNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-green-700 dark:text-green-400" />
                <span className="font-medium">Company:</span>
                <span className="text-green-700 dark:text-green-400">{candidateProfile.currentOrLastCompany}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <IndianRupee className="h-4 w-4 text-green-700 dark:text-green-400" />
                <span className="font-medium">Last Salary:</span>
                <span className="text-green-700 dark:text-green-400">{formatInr(candidateProfile.lastDrawnSalary)}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4 text-center">
              <Lock className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Contact details, company name, and salary information are hidden
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Unlock this profile to view full details
              </p>
            </div>
          )}

          {/* Skills */}
          {candidateProfile.skills.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">Skills:</p>
              <div className="flex flex-wrap gap-2">
                {candidateProfile.skills.map((skill, idx) => (
                  <Badge key={idx} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          <div className="flex flex-wrap gap-4">
            {candidate.linkedin && (
              <a
                href={candidate.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
            )}
            {candidate.github && (
              <a
                href={candidate.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            )}
          </div>

          {/* Resume */}
          {candidateProfile.resume && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs font-medium text-muted-foreground">Resume/Summary:</p>
              <p className="mt-1 text-sm">{candidateProfile.resume}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <UnlockConfirmDialog
        open={showUnlockDialog}
        onOpenChange={setShowUnlockDialog}
        onConfirm={onUnlock}
        candidateName={candidateProfile.jobRole || 'this candidate'}
      />
    </>
  );
}
