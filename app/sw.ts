export function register() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      const swUrl = "/service-worker.js"

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log("ServiceWorker registration successful with scope: ", registration.scope)

          // Set up periodic sync if supported
          if ("periodicSync" in registration) {
            // Try to register for periodic sync
            navigator.permissions.query({ name: "periodic-background-sync" as any }).then((status) => {
              if (status.state === "granted") {
                // Use type assertion to tell TypeScript that periodicSync exists
                ;(registration as any).periodicSync
                  .register("content-sync", {
                    minInterval: 24 * 60 * 60 * 1000, // 1 day in ms
                  })
                  .then(() => {
                    console.log("Periodic sync registered")
                  })
                  .catch((error: Error) => {
                    console.error("Periodic sync registration failed:", error)
                  })
              }
            })
          }

          // Set up push notifications if supported
          if ("pushManager" in registration) {
            registration.pushManager.getSubscription().then(async (subscription) => {
              if (!subscription) {
                try {
                  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
                  if (publicKey) {
                    // We'll request notification permission when needed
                    console.log("Push subscription will be created when permission is granted")
                  }
                } catch (error: unknown) {
                  console.log("Push subscription setup deferred:", error)
                }
              }
            })
          }

          registration.onupdatefound = () => {
            const installingWorker = registration.installing
            if (installingWorker == null) {
              return
            }
            installingWorker.onstatechange = () => {
              if (installingWorker.state === "installed") {
                if (navigator.serviceWorker.controller) {
                  // At this point, the updated precached content has been fetched,
                  // but the previous service worker will still serve the older
                  // content until all client tabs are closed.
                  console.log("New content is available and will be used when all " + "tabs for this page are closed.")

                  // Show notification about update
                  if (window.confirm("New version available! Reload to update?")) {
                    window.location.reload()
                  }
                } else {
                  // At this point, everything has been precached.
                  // It's the perfect time to display a
                  // "Content is cached for offline use." message.
                  console.log("Content is cached for offline use.")
                }
              }
            }
          }
        })
        .catch((error: Error) => {
          console.error("Error during service worker registration:", error)
        })
    })
  }
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister()
      })
      .catch((error: Error) => {
        console.error(error.message)
      })
  }
}

// Request permissions for the app - only when user interacts with a feature
export async function requestPermissions() {
  // Only request notification permission on load
  // Other permissions will be requested when needed
  if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
    try {
      await Notification.requestPermission()
    } catch (error: unknown) {
      console.log("Notification permission request failed:", error)
    }
  }
}

// Helper function to convert base64 to Uint8Array for push notifications
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

