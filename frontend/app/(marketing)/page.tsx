"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Check,
  Users,
  Layers,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Home() {
  // Replace with your actual auth logic
  const isLoggedIn = false;


  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* Hero Section */}
      <section className="py-18 sm:py-24 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
            <span>Your personal workspace</span>
            <div className="mt-2 sm:mt-3">
              for <span className="text-blue-600">better productivity</span>
            </div>
          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            Organize your projects, tasks, and goals in one place. Stay focused
            and achieve more with your personal command center.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isLoggedIn ? (
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                <Link href="/dashboard">Go to Workspace</Link>
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  <Link href="/register">Start for Free</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-300"
                >
                  <Link href="/demo">Watch Demo</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-15 bg-gradient-to-b from-white via-gray-50 to-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Essential features for personal success
            </h2>
            <p className="mt-4 text-gray-600">
              Everything you need to simplify your projects and boost
              productivity
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-12 lg:grid-cols-3">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-5">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Seamless Collaboration
              </h3>
              <p className="text-gray-600">
                Empower your projects with real-time updates and efficient
                project tracking when working with others.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="bg-pink-100 w-12 h-12 rounded-lg flex items-center justify-center mb-5">
                <Layers className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                All-in-One Solution
              </h3>
              <p className="text-gray-600">
                Manage everything from tasks to goals in one integrated
                workspace designed to boost productivity.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="bg-amber-100 w-12 h-12 rounded-lg flex items-center justify-center mb-5">
                <BarChart3 className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Customizable Workflow
              </h3>
              <p className="text-gray-600">
                Personalize your workspace with flexible tools designed to
                match your unique work style.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Available Plans</h2>
            <p className="mt-4 text-gray-600">
              Choose the perfect plan for your needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Pro Plan */}
            <Card className="relative border-2 border-blue-200 shadow-md">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
              <CardHeader className="pt-8">
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$5.99</span>
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
                <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white">
                  Upgrade
                </Button>
              </CardFooter>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$20</span>
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
                <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white">
                  Upgrade
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
      <section id="faq" className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="text-left">
            <AccordionItem value="item-1">
              <AccordionTrigger>Is TaskHub free to use?</AccordionTrigger>
              <AccordionContent>
                Yes! TaskHub offers a free plan with limited features. You can
                upgrade anytime for advanced tools and team collaboration.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Can I use TaskHub with my team?</AccordionTrigger>
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
              <AccordionTrigger>How can I cancel or upgrade my plan?</AccordionTrigger>
              <AccordionContent>
                You can manage, upgrade, or cancel your subscription anytime from
                your account dashboard.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  );
}
