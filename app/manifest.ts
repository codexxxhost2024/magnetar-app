import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Magnetar Mobile App",
    short_name: "Magnetar",
    description: "Magnetar Mobile Web App",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#B30000",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    orientation: "portrait",
    categories: ["business", "finance", "social"],
    screenshots: [
      {
        src: "/screenshot1.png",
        sizes: "1080x1920",
        type: "image/png",
        platform: "android",
        label: "Magnetar Home Screen",
      },
      {
        src: "/screenshot2.png",
        sizes: "1080x1920",
        type: "image/png",
        platform: "android",
        label: "Magnetar Social Feed",
      },
    ],
    related_applications: [
      {
        platform: "play",
        url: "https://play.google.com/store/apps/details?id=com.magnetar.app",
        id: "com.magnetar.app",
      },
      {
        platform: "itunes",
        url: "https://apps.apple.com/app/magnetar/id123456789",
      },
    ],
    prefer_related_applications: false,
    shortcuts: [
      {
        name: "Home",
        url: "/home",
        icons: [{ src: "/shortcuts/home.png", sizes: "96x96" }],
      },
      {
        name: "Social",
        url: "/social",
        icons: [{ src: "/shortcuts/social.png", sizes: "96x96" }],
      },
      {
        name: "E-Learn",
        url: "/e-learn",
        icons: [{ src: "/shortcuts/learn.png", sizes: "96x96" }],
      },
      {
        name: "Members",
        url: "/members",
        icons: [{ src: "/shortcuts/members.png", sizes: "96x96" }],
      },
    ],
  }
}

