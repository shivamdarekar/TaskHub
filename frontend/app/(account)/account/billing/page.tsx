"use client";

import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import {
  getCurrentSubscription,
  getSubscriptionLimits,
  getTransactionHistory,
  cancelSubscription,
  reactivateSubscription,
} from "@/redux/slices/subscriptionSlice";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CurrentPlanCard,
  UsageLimitsCard,
  BillingHistoryCard,
  CancellationModal,
} from "@/components/subscription";
import { format } from "date-fns";

export default function BillingPage() {
  const dispatch = useAppDispatch();
  const { subscription, limits, transactions, transactionPagination, loading, error, successMessage } = useAppSelector((state) => state.subscription);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(getCurrentSubscription());
    dispatch(getSubscriptionLimits());
    dispatch(getTransactionHistory({ page: currentPage, limit: 10 }));
  }, [dispatch, currentPage]);

  // Display error messages
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Display success messages
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
    }
  }, [successMessage]);

  const handleCancel = async () => {
    try {
      await dispatch(cancelSubscription()).unwrap();
      setShowCancelModal(false);
    } catch {
      // Error already handled by useEffect
    }
  };

  const handleReactivate = async () => {
    try {
      await dispatch(reactivateSubscription()).unwrap();
    } catch {
      // Error already handled by useEffect
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading && !subscription) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
        <p className="text-sm text-gray-500">No subscription found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        <CurrentPlanCard
          subscription={subscription}
          onCancel={() => setShowCancelModal(true)}
          onReactivate={handleReactivate}
          loading={loading}
        />

        {limits && <UsageLimitsCard limits={limits} plan={subscription.plan} />}

        <BillingHistoryCard 
          transactions={transactions} 
          loading={loading}
          pagination={transactionPagination}
          onPageChange={handlePageChange}
        />
      </div>

      <CancellationModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        loading={loading}
        periodEnd={subscription.currentPeriodEnd ? format(new Date(subscription.currentPeriodEnd), "MMM dd, yyyy") : undefined}
      />
    </>
  );
}
