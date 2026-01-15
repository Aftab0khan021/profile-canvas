import { useProfile } from '@/hooks/useProfile';
import { useProjects, useExperience, useMessages } from '@/hooks/usePortfolioData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FolderOpen, Briefcase, MessageSquare, ExternalLink, ArrowRight } from 'lucide-react';

export default function DashboardHome() {
  const { profile } = useProfile();
  const { projects } = useProjects();
  const { experience } = useExperience();
  const { messages, unreadCount } = useMessages();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {profile?.full_name || 'there'}!</h1>
        <p className="text-muted-foreground">Here's an overview of your portfolio.</p>
      </div>

      {profile?.username && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="font-medium">Your public portfolio</p>
              <p className="text-sm text-muted-foreground">foliox.com/p/{profile.username}</p>
            </div>
            <Button asChild>
              <a href={`/p/${profile.username}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <Link to="/dashboard/projects" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              Manage projects <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Experience</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{experience.length}</div>
            <Link to="/dashboard/experience" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              Manage experience <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount} <span className="text-sm font-normal text-muted-foreground">unread</span></div>
            <Link to="/dashboard/messages" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              View messages <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {!profile?.bio && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">Complete your profile</CardTitle>
            <CardDescription>Add your bio, title, and social links to make your portfolio stand out.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link to="/dashboard/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
