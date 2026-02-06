import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, CreditCard } from "lucide-react";

export default function SubscriptionCard() {
  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Crown className="h-5 w-5 text-amber-500" />
          Subscription & Billing
        </CardTitle>
        <CardDescription>Manage your subscription and billing information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-lg">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Free Plan</p>
              <p className="text-sm text-gray-600">Basic features with limited usage</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">
            Current Plan
          </Badge>
        </div>
        <div className="mt-4 flex gap-3">
          <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white h-11 px-6">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Pro
          </Button>
          <Button variant="outline" className="h-11 px-6 border-gray-300">
            <CreditCard className="h-4 w-4 mr-2" />
            View Billing
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
