import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Introduction from "@/pages/Introduction";
import LessonsList from "@/pages/LessonsList";
import LessonDetail from "@/pages/LessonDetail";
import ChallengesList from "@/pages/ChallengesList";
import ChallengeDetail from "@/pages/ChallengeDetail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/introduction" component={Introduction} />
      <Route path="/lessons" component={LessonsList} />
      <Route path="/lessons/:id" component={LessonDetail} />
      <Route path="/challenges" component={ChallengesList} />
      <Route path="/challenges/:id" component={ChallengeDetail} />
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
