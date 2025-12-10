"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      

      {/* Header */}
      <header className="bg-gradient-to-b from-blue-50 to-white py-16 text-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 animate-fade-in-up">Transparent Pricing for Every Need</h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
          Choose the plan that fits your workflow and scale as you grow.
        </p>
      </header>

      {/* Pricing Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="border-gray-200 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Free</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-500 ml-2">/month</span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-3">
                {[
                  "1 Workspace",
                  "Up to 5 Projects",
                  "Up to 20 Tasks",
                  "Basic Task Management",
                  "2 Team Members",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Get Started
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-2 border-blue-200 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 animate-fade-in-up animation-delay-200">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                Most Popular
              </span>
            </div>

            <CardHeader className="pt-2">
              <CardTitle className="text-2xl font-semibold">Pro</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">$5.99</span>
                <span className="text-gray-500 ml-2">/month</span>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              <ul className="space-y-3">
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
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all">
                Upgrade
              </Button>
            </CardFooter>
          </Card>

          {/* Enterprise Plan */}
          <Card className="border-gray-200 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 md:col-span-2 max-w-md mx-auto animate-fade-in-up animation-delay-400">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Enterprise</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">$20</span>
                <span className="text-gray-500 ml-2">/month</span>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              <ul className="space-y-3">
                {[
                  "Everything in Pro Plan",
                  "Unlimited Workspaces",
                  "Unlimited Team Collaboration",
                  "Unlimited File Storage (Fair-use Policy Applies)",
                  "Priority Support",
                  "Advanced Security Features",
                  "Custom Integrations",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all">
                Upgrade
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 animate-fade-in-up">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="text-left">
            <AccordionItem value="item-1">
              <AccordionTrigger>Can I cancel my subscription anytime?</AccordionTrigger>
              <AccordionContent>
                Yes, you can cancel your subscription at any time. Once canceled, you will continue to have access until the end of your billing cycle.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>How do team members work?</AccordionTrigger>
              <AccordionContent>
                You can invite team members to collaborate on your workspaces and projects. Each member counts toward your plan’s limit.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>Do you offer discounts for nonprofits or educational institutions?</AccordionTrigger>
              <AccordionContent>
                Yes, we offer special pricing for nonprofits, educational institutions, and open-source projects. Contact our support team for details.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
              <AccordionContent>
                We accept all major credit cards, PayPal, and bank transfers for annual plans.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  );
}
