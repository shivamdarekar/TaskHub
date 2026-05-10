"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Loader2 } from "lucide-react"; // add
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Users, Layers, BarChart3, ArrowRight, Shield, Bell, FileText, MessageSquare, Zap, Lock, TrendingUp, Clock, Target } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { fetchUserWorkspaces } from "@/redux/slices/workspaceSlice";
import { PLAN_PRICES } from "@/lib/constants";


export default function Home() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector(
    (state) => state.auth
  );
  const {workspaces,loading} = useAppSelector((state) => state.workspace);

  useEffect(() => {
    if(isAuthenticated && workspaces.length === 0){
      dispatch(fetchUserWorkspaces());
    }
  },[isAuthenticated, dispatch, workspaces.length]);

  const handleGoToWorkspace = () => {
    if (loading) return; // Prevent action while loading
    
    if (workspaces.length > 0) {
      router.push(`/workspace/${workspaces[0].id}`);
    } else {
      // If no workspaces after loading, go to create
      router.push('/workspace/create');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 sm:py-28 text-center bg-gradient-to-b from-white via-blue-50/30 to-white relative overflow-hidden kanban-animation">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Kanban Animation */}
        <div className="kanban-columns">
          <div className="kanban-column"></div>
          <div className="kanban-column"></div>
          <div className="kanban-column"></div>
          <div className="kanban-column"></div>
          <div className="kanban-sweep"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
              <span>Your personal workspace</span>
              <div className="mt-2 sm:mt-3">
                for <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">better productivity</span>
              </div>
            </h1>

            <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              Organize your projects, tasks, and goals in one place. Stay focused
              and achieve more with your personal command center.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-400">
              {isAuthenticated ? (
                <Button 
                  size="lg" 
                  onClick={handleGoToWorkspace}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Go to Workspace"
                  )}
                </Button>
              ) : (
                <>
                  <Link href="/register">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                      Start for Free
                    </Button>
                  </Link>
                  <a
                    href="https://www.linkedin.com/posts/shivam-darekar-b61636240_fullstackdevelopment-softwareengineering-activity-7438635408906690560-DqEt"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="lg" variant="outline" className="border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-all">
                      Watch Demo
                    </Button>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Powerful Features for Modern Teams
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to manage projects efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all transform hover:-translate-y-1 animate-fade-in-up">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-5 shadow-lg">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Kanban Boards
              </h3>
              <p className="text-gray-600">
                Visualize your workflow with drag-and-drop Kanban boards. Organize tasks across customizable columns.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-xl hover:border-purple-200 transition-all transform hover:-translate-y-1 animate-fade-in-up animation-delay-100">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-5 shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Team Collaboration
              </h3>
              <p className="text-gray-600">
                Invite team members, assign tasks, and collaborate in real-time with role-based permissions.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-xl hover:border-indigo-200 transition-all transform hover:-translate-y-1 animate-fade-in-up animation-delay-200">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-5 shadow-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Comments & Discussions
              </h3>
              <p className="text-gray-600">
                Keep conversations organized with task-level comments and threaded discussions.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-xl hover:border-green-200 transition-all transform hover:-translate-y-1 animate-fade-in-up animation-delay-300">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-5 shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Documentation System
              </h3>
              <p className="text-gray-600">
                Create and manage project documentation with a built-in rich text editor.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-xl hover:border-orange-200 transition-all transform hover:-translate-y-1 animate-fade-in-up animation-delay-400">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-12 h-12 rounded-lg flex items-center justify-center mb-5 shadow-lg">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Smart Notifications
              </h3>
              <p className="text-gray-600">
                Stay updated with email notifications for task assignments, comments, and project updates.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-xl hover:border-red-200 transition-all transform hover:-translate-y-1 animate-fade-in-up animation-delay-500">
              <div className="bg-gradient-to-br from-red-500 to-red-600 w-12 h-12 rounded-lg flex items-center justify-center mb-5 shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Advanced Security
              </h3>
              <p className="text-gray-600">
                Two-factor authentication, role-based access control, and secure data encryption.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-xl hover:border-teal-200 transition-all transform hover:-translate-y-1 animate-fade-in-up animation-delay-600">
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 w-12 h-12 rounded-lg flex items-center justify-center mb-5 shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Activity Tracking
              </h3>
              <p className="text-gray-600">
                Monitor all project activities with detailed logs and track who did what and when.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-xl hover:border-pink-200 transition-all transform hover:-translate-y-1 animate-fade-in-up animation-delay-700">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 w-12 h-12 rounded-lg flex items-center justify-center mb-5 shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Progress Analytics
              </h3>
              <p className="text-gray-600">
                Visualize project progress with charts, timelines, and comprehensive dashboard insights.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-xl hover:border-cyan-200 transition-all transform hover:-translate-y-1 animate-fade-in-up animation-delay-800">
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 w-12 h-12 rounded-lg flex items-center justify-center mb-5 shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Multiple Workspaces
              </h3>
              <p className="text-gray-600">
                Organize different projects into separate workspaces with independent teams and settings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Get started in minutes with our simple workflow
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Create Workspace</h3>
              <p className="text-gray-600">Sign up and create your first workspace in seconds</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Add Projects & Tasks</h3>
              <p className="text-gray-600">Organize your work with projects and break them into tasks</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Invite Your Team</h3>
              <p className="text-gray-600">Collaborate by inviting team members to your workspace</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Track Progress</h3>
              <p className="text-gray-600">Monitor tasks, analyze performance, and achieve goals</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose TaskHub Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Why Choose TaskHub?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Built for teams who value simplicity and productivity
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Lightning Fast</h3>
                  <p className="text-gray-600">Built with modern technology for instant updates and seamless performance</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Lock className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Secure & Private</h3>
                  <p className="text-gray-600">Enterprise-grade security with 2FA, encryption, and role-based access control</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Scalable Solution</h3>
                  <p className="text-gray-600">Start free and scale as you grow - from solo projects to enterprise teams</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Focus on What Matters</h3>
                  <p className="text-gray-600">No bloat, no complexity - just the essential tools you need to get work done</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl">
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">Setup Time</span>
                    <span className="text-blue-600 font-bold">2 minutes</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '95%'}}></div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">User Satisfaction</span>
                    <span className="text-green-700 font-bold">98%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '98%'}}></div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">Productivity Boost</span>
                    <span className="text-purple-600 font-bold">3x</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: '100%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Available Plans
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Choose the perfect plan for your needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Pro Plan */}
            <Card className="relative border-2 border-blue-200 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 animate-fade-in-up animation-delay-200">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
              <CardHeader className="pt-8">
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">₹{PLAN_PRICES.PRO.monthly}</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <ul className="space-y-4">
                  {[
                    "Up to 10 Workspaces",
                    "Unlimited Projects",
                    "Unlimited Tasks",
                    "Team Collaboration (Up to 20 Members)",
                    "Calendar View",
                    "Project Timeline (Gantt Chart)",
                    "File Storage (10 Files Per Task)",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                  onClick={async () => {
                    if (!isAuthenticated) {
                      router.push("/register?plan=pro");
                      return;
                    }
                    if (!user?.isEmailVerified) {
                      router.push("/verify-email");
                      return;
                    }
                    try {
                      const ws = await dispatch(fetchUserWorkspaces()).unwrap();
                      if (ws.length === 0) {
                        router.push("/workspace/create?from=/account/upgrade");
                      } else {
                        router.push("/account/upgrade");
                      }
                    } catch {
                      router.push("/account/upgrade");
                    }
                  }}
                >
                  {isAuthenticated ? "Upgrade to Pro" : "Start Free Trial"}
                </Button>
              </CardFooter>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-gray-200 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 animate-fade-in-up animation-delay-400">
              <CardHeader>
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">₹{PLAN_PRICES.ENTERPRISE.monthly.toLocaleString()}</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <ul className="space-y-4">
                  {[
                    "Everything in Pro Plan",
                    "Unlimited Workspaces",
                    "Unlimited Team Collaboration",
                    "Unlimited File Storage (Fair-use Policy Applies)",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                  onClick={async () => {
                    if (!isAuthenticated) {
                      router.push("/register?plan=enterprise");
                      return;
                    }
                    if (!user?.isEmailVerified) {
                      router.push("/verify-email");
                      return;
                    }
                    try {
                      const ws = await dispatch(fetchUserWorkspaces()).unwrap();
                      if (ws.length === 0) {
                        router.push("/workspace/create?from=/account/upgrade");
                      } else {
                        router.push("/account/upgrade");
                      }
                    } catch {
                      router.push("/account/upgrade");
                    }
                  }}
                >
                  {isAuthenticated ? "Upgrade to Enterprise" : "Contact Sales"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/pricing"
              className="text-blue-600 hover:text-blue-800 inline-flex items-center font-medium"
            >
              View detailed pricing <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-gradient-to-b from-white to-gray-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 animate-fade-in-up">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="text-left">
            <AccordionItem value="item-1">
              <AccordionTrigger>Is TaskHub free to use?</AccordionTrigger>
              <AccordionContent>
                Yes! TaskHub offers a free plan with limited features. You can
                upgrade anytime for advanced tools and team collaboration.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>
                Can I use TaskHub with my team?
              </AccordionTrigger>
              <AccordionContent>
                Absolutely! Invite teammates to collaborate on projects and
                share progress in real time.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>
                Do you offer mobile or tablet support?
              </AccordionTrigger>
              <AccordionContent>
                Yes, TaskHub is fully responsive and works perfectly across
                desktop, tablet, and mobile browsers.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>
                How can I cancel or upgrade my plan?
              </AccordionTrigger>
              <AccordionContent>
                You can manage, upgrade, or cancel your subscription anytime
                from your account dashboard.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of teams already using TaskHub to achieve more
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Button 
                size="lg" 
                onClick={handleGoToWorkspace}
                disabled={loading}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Go to Workspace"
                )}
              </Button>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-blue-600 transition-all">
                    Contact Sales
                  </Button>
                </Link>
              </>
            )}
          </div>
          <p className="mt-6 text-blue-100 text-sm">
            No credit card required • Free plan available • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}
