import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building2, DollarSign } from 'lucide-react';
import type { Job } from '../../backend';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <Link to="/jobs/$jobId" params={{ jobId: job.id.toString() }}>
      <Card className="transition-all hover:border-primary/50 hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">{job.title}</CardTitle>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {job.company}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.location}
            </div>
            {job.salary && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {job.salary.toString()}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-2 text-sm text-muted-foreground">{job.description}</p>
          {job.requirements.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {job.requirements.slice(0, 3).map((req, index) => (
                <Badge key={index} variant="secondary">
                  {req}
                </Badge>
              ))}
              {job.requirements.length > 3 && (
                <Badge variant="secondary">+{job.requirements.length - 3} more</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
