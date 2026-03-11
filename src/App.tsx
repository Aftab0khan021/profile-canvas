import { lazy, Suspense, Component, ErrorInfo, ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RequireAuth } from "@/components/RequireAuth";
import { RecaptchaProvider } from "@/components/RecaptchaProvider";

// Eager load critical routes (auth, landing)
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import NotFound from "./pages/NotFound";

// Lazy load dashboard pages (loaded on demand)
const DashboardLayout = lazy(() => import("./components/DashboardLayout"));
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome"));
const ProfilePage = lazy(() => import("./pages/dashboard/ProfilePage"));
const ProjectsPage = lazy(() => import("./pages/dashboard/ProjectsPage"));
const ExperiencePage = lazy(() => import("./pages/dashboard/ExperiencePage"));
const SkillsPage = lazy(() => import("./pages/dashboard/SkillsPage"));
const MessagesPage = lazy(() => import("./pages/dashboard/MessagesPage"));
const SettingsPage = lazy(() => import("./pages/dashboard/SettingsPage"));
const BlogPage = lazy(() => import("./pages/dashboard/BlogPage"));
const TestimonialsPage = lazy(() => import("./pages/dashboard/TestimonialsPage"));
const EducationPage = lazy(() => import("./pages/dashboard/EducationPage"));
const CertificationsPage = lazy(() => import("./pages/dashboard/CertificationsPage"));
const ResumePage = lazy(() => import("./pages/dashboard/ResumePage"));
const BrandPage = lazy(() => import("./pages/dashboard/BrandPage"));
const SiteContentPage = lazy(() => import("./pages/dashboard/SiteContentPage"));
const TrashPage = lazy(() => import("./pages/dashboard/TrashPage"));

// Lazy load public pages (loaded on demand)
const PublicLayout = lazy(() => import("./layouts/PublicLayout"));
const PublicHome = lazy(() => import("./pages/public/PublicHome"));
const PublicAbout = lazy(() => import("./pages/public/PublicAbout"));
const PublicProjects = lazy(() => import("./pages/public/PublicProjects"));
const ProjectDetail = lazy(() => import("./pages/public/ProjectDetail"));
const PublicExperience = lazy(() => import("./pages/public/PublicExperience"));
const PublicSkills = lazy(() => import("./pages/public/PublicSkills"));
const PublicBlog = lazy(() => import("./pages/public/PublicBlog"));
const PublicContact = lazy(() => import("./pages/public/PublicContact"));
const BlogPost = lazy(() => import("./pages/BlogPost"));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Error boundary to catch runtime crashes and show a helpful message
class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[App Error Boundary]', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center gap-4">
          <div className="text-4xl">⚠️</div>
          <h1 className="text-xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground text-sm max-w-md">{this.state.error.message}</p>
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,  // 60s before data is considered stale
      retry: 1,           // Only retry once on failure (not 3x default)
    },
  },
});


const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AppErrorBoundary>
              <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />

                {/* Public Portfolio — reCAPTCHA only loaded here (contact form) */}
                <Route path="/p/:username" element={
                  <RecaptchaProvider>
                    <PublicLayout />
                  </RecaptchaProvider>
                }>
                  <Route index element={<PublicHome />} />
                  <Route path="about" element={<PublicAbout />} />
                  <Route path="projects" element={<PublicProjects />} />
                  <Route path="projects/:projectId" element={<ProjectDetail />} />
                  <Route path="experience" element={<PublicExperience />} />
                  <Route path="skills" element={<PublicSkills />} />
                  <Route path="blog" element={<PublicBlog />} />
                  <Route path="contact" element={<PublicContact />} />
                  <Route path="blog/:slug" element={<BlogPost />} />
                </Route>

                {/* Dashboard */}
                <Route path="/dashboard" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
                  <Route index element={<DashboardHome />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="projects" element={<ProjectsPage />} />
                  <Route path="experience" element={<ExperiencePage />} />
                  <Route path="skills" element={<SkillsPage />} />
                  <Route path="education" element={<EducationPage />} />
                  <Route path="certifications" element={<CertificationsPage />} />
                  <Route path="testimonials" element={<TestimonialsPage />} />
                  <Route path="blog" element={<BlogPage />} />
                  <Route path="messages" element={<MessagesPage />} />
                  <Route path="resume" element={<ResumePage />} />
                  <Route path="brand" element={<BrandPage />} />
                  <Route path="content" element={<SiteContentPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="trash" element={<TrashPage />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
            </AppErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
