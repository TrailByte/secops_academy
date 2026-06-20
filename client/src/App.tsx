import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Introduction from "@/pages/Introduction";
import LearningPaths from "@/pages/LearningPaths";
import LessonsList from "@/pages/LessonsList";
import LessonDetail from "@/pages/LessonDetail";
import ChallengesList from "@/pages/ChallengesList";
import ChallengeDetail from "@/pages/ChallengeDetail";
import ChallengesIndex from "@/pages/ChallengesIndex";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AdminChallenges from "@/pages/AdminChallenges";
import AdminChallengeForm from "@/pages/AdminChallengeForm";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/introduction" component={Introduction} />
      {/* Learning paths index */}
      <Route path="/learn" component={LearningPaths} />
      {/* Lessons filtered by path */}
      <Route path="/learn/:pathSlug/lessons" component={LessonsList} />
      <Route path="/lessons/:id" component={LessonDetail} />
      {/* Challenges filtered by path */}
      <Route path="/challenges" component={ChallengesIndex} />
      <Route path="/challenges/path/:pathSlug" component={ChallengesList} />
      <Route path="/challenges/:id" component={ChallengeDetail} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/admin/challenges/new" component={AdminChallengeForm} />
      <Route path="/admin/challenges/:id/edit" component={AdminChallengeForm} />
      <Route path="/admin/challenges" component={AdminChallenges} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
