"use client";

import React from "react";
import { Card, CardBody, CardHeader, Skeleton } from "@heroui/react";

export const PageSkeleton = React.memo(() => {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header skeleton */}
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-64 mx-auto rounded-lg" />
          <Skeleton className="h-6 w-96 mx-auto rounded-lg" />
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <Skeleton className="h-6 w-32 rounded-lg" />
              </CardHeader>
              <CardBody className="space-y-3">
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4 rounded-lg" />
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
});

PageSkeleton.displayName = "PageSkeleton";
