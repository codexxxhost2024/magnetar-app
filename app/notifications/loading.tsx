import { Skeleton } from "@/components/ui/skeleton"
import Header from "@/components/header"

export default function NotificationsLoading() {
  return (
    <div className="pb-20 pt-16">
      <Header title="Notifications" showBack={true} showNotifications={false} />

      <div className="p-4">
        <div className="flex justify-between mb-4 overflow-x-auto">
          <Skeleton className="h-10 w-[calc(100%/5-8px)]" />
          <Skeleton className="h-10 w-[calc(100%/5-8px)]" />
          <Skeleton className="h-10 w-[calc(100%/5-8px)]" />
          <Skeleton className="h-10 w-[calc(100%/5-8px)]" />
          <Skeleton className="h-10 w-[calc(100%/5-8px)]" />
        </div>

        <div className="space-y-3">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex gap-3">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

