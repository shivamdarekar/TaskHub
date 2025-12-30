"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getProjectComments } from "@/redux/slices/commentSlice";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectCommentsPage() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const projectId = params.projectId as string;
  
  const { comments, pagination, commentsLoading } = useAppSelector((state) => state.comment);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageChanging, setIsPageChanging] = useState(false);

  useEffect(() => {
    if (projectId) {
      dispatch(getProjectComments({ projectId, page: currentPage, limit: 20 }));
    }
  }, [dispatch, projectId, currentPage]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const filteredComments = comments.filter(comment =>
    comment.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.task?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (page: number) => {
    if (page === currentPage) return;
    setIsPageChanging(true);
    setCurrentPage(page);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    if (!commentsLoading) {
      setIsPageChanging(false);
    }
  }, [commentsLoading]);

  const isInitialLoad = commentsLoading && comments.length === 0;

  if (isInitialLoad) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {commentsLoading && !isInitialLoad ? (
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            ) : (
              <MessageSquare className="h-5 w-5 text-blue-600" />
            )}
            <h1 className="text-xl font-semibold text-gray-900">Project Comments</h1>
            <Badge variant="secondary" className="ml-2">
              {pagination?.total || 0} comments
            </Badge>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search comments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="relative">
          {isPageChanging && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm text-gray-600">Loading...</span>
              </div>
            </div>
          )}
        {filteredComments.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No comments found</h3>
            <p className="text-gray-500">
              {searchTerm 
                ? "Try adjusting your search criteria" 
                : "Comments from project tasks will appear here"}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredComments.map((comment) => (
              <Card key={comment.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-blue-500 text-white">
                      {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {comment.user?.name || 'Unknown User'}
                        </span>
                        {comment.task && (
                          <Badge variant="outline" className="text-xs">
                            {comment.task.title}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 shrink-0">
                        {formatTimestamp(comment.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white border-t px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} comments
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={isPageChanging || !pagination.hasPrev}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === pagination.page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={isPageChanging}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={isPageChanging || !pagination.hasNext}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}