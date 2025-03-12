// Function to request a specific permission
export async function requestPermission(permissionName: PermissionName): Promise<PermissionStatus | null> {
  try {
    if (navigator.permissions) {
      return await navigator.permissions.query({ name: permissionName as any })
    }
    return null
  } catch (error) {
    console.error(`Error requesting ${permissionName} permission:`, error)
    return null
  }
}

// Function to request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications")
    return "denied"
  }

  if (Notification.permission === "granted") {
    return "granted"
  }

  if (Notification.permission !== "denied") {
    return await Notification.requestPermission()
  }

  return Notification.permission
}

// Function to check if all required permissions are granted
export async function checkAllPermissions(): Promise<Record<string, boolean | string>> {
  const results: Record<string, boolean | string> = {}

  // Check notification permission
  results.notification = Notification.permission

  // Check camera permission
  try {
    const cameraStatus = await requestPermission("camera")
    results.camera = cameraStatus?.state === "granted"
  } catch {
    results.camera = false
  }

  // Check microphone permission
  try {
    const microphoneStatus = await requestPermission("microphone")
    results.microphone = microphoneStatus?.state === "granted"
  } catch {
    results.microphone = false
  }

  // Check geolocation permission
  try {
    const geolocationStatus = await requestPermission("geolocation")
    results.geolocation = geolocationStatus?.state === "granted"
  } catch {
    results.geolocation = false
  }

  return results
}

