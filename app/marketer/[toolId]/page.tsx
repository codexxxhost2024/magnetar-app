"use client"

import type React from "react"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChevronLeft,
  Users,
  Database,
  Calendar,
  Mail,
  Layout,
  BarChart,
  FileText,
  UserPlus,
  Star,
  Lock,
  Info,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MarketingTool {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: string
  isPremium: boolean
  features: string[]
}

export default function MarketingToolPage() {
  const router = useRouter()
  const params = useParams()
  const toolId = params.toolId as string
  const [loading, setLoading] = useState(false)

  // Mock data for marketing tools
  const marketingTools: Record<string, MarketingTool> = {
    "1": {
      id: "1",
      name: "Lead Generator",
      description: "Generate high-quality leads based on your target audience criteria",
      icon: <Users className="h-6 w-6 text-blue-600" />,
      category: "Lead Generation",
      isPremium: false,
      features: [
        "Target audience filtering",
        "Contact information extraction",
        "Lead quality scoring",
        "Export to CSV/Excel",
        "Integration with CRM systems",
      ],
    },
    "2": {
      id: "2",
      name: "Web Data Scraper",
      description: "Extract valuable data from websites to build your prospect lists",
      icon: <Database className="h-6 w-6 text-green-600" />,
      category: "Data Collection",
      isPremium: true,
      features: [
        "Website data extraction",
        "Automated scraping schedules",
        "Data cleaning and formatting",
        "Multiple export options",
        "Custom scraping templates",
      ],
    },
    "3": {
      id: "3",
      name: "Social Media Scheduler",
      description: "Schedule and automate your social media posts across platforms",
      icon: <Calendar className="h-6 w-6 text-purple-600" />,
      category: "Social Media",
      isPremium: false,
      features: [
        "Multi-platform scheduling",
        "Content calendar view",
        "Performance analytics",
        "Hashtag suggestions",
        "Best time to post recommendations",
      ],
    },
    "4": {
      id: "4",
      name: "Email Campaign Manager",
      description: "Create, send, and track email campaigns to nurture your leads",
      icon: <Mail className="h-6 w-6 text-red-600" />,
      category: "Email Marketing",
      isPremium: true,
      features: [
        "Email template builder",
        "Automated email sequences",
        "A/B testing",
        "Open and click tracking",
        "Audience segmentation",
      ],
    },
    "5": {
      id: "5",
      name: "Landing Page Builder",
      description: "Create high-converting landing pages with drag-and-drop simplicity",
      icon: <Layout className="h-6 w-6 text-amber-600" />,
      category: "Web Tools",
      isPremium: true,
      features: [
        "Drag-and-drop editor",
        "Mobile-responsive templates",
        "Form integration",
        "A/B testing",
        "Conversion tracking",
      ],
    },
    "6": {
      id: "6",
      name: "Marketing Analytics",
      description: "Track and analyze your marketing performance with detailed insights",
      icon: <BarChart className="h-6 w-6 text-indigo-600" />,
      category: "Analytics",
      isPremium: false,
      features: [
        "Campaign performance tracking",
        "ROI calculation",
        "Custom reporting",
        "Goal tracking",
        "Competitor analysis",
      ],
    },
    "7": {
      id: "7",
      name: "Content Creator",
      description: "Generate marketing content with AI-powered assistance",
      icon: <FileText className="h-6 w-6 text-cyan-600" />,
      category: "Content",
      isPremium: true,
      features: [
        "AI-powered content generation",
        "SEO optimization",
        "Content templates",
        "Grammar and style checking",
        "Multi-format content creation",
      ],
    },
    "8": {
      id: "8",
      name: "Audience Segmentation",
      description: "Segment your audience for targeted marketing campaigns",
      icon: <UserPlus className="h-6 w-6 text-pink-600" />,
      category: "Lead Generation",
      isPremium: false,
      features: [
        "Behavioral segmentation",
        "Demographic filtering",
        "Interest-based grouping",
        "Engagement scoring",
        "Custom segment creation",
      ],
    },
  }

  const tool = marketingTools[toolId]

  if (!tool) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Info className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <h3 className="text-lg font-medium mb-1">Tool not found</h3>
          <Button onClick={() => router.push("/marketer")}>Back to Tools</Button>
        </div>
      </div>
    )
  }

  if (tool.isPremium) {
    return (
      <div className="pb-16">
        <header className="app-header">
          <Button variant="ghost" size="icon" onClick={() => router.push("/marketer")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold truncate">{tool.name}</h1>
          <div className="w-9"></div>
        </header>

        <div className="p-4 content-area">
          <div className="flex flex-col items-center justify-center text-center py-10">
            <div className="bg-amber-100 p-4 rounded-full mb-4">
              <Lock className="h-12 w-12 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Premium Feature</h2>
            <p className="text-gray-600 mb-6 max-w-md">
              This is a premium feature available exclusively to Marketer Pro subscribers.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg mb-6 w-full max-w-md">
              <h3 className="font-bold mb-2">Features included:</h3>
              <ul className="text-left space-y-2">
                {tool.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Star className="h-4 w-4 text-amber-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <Button className="mb-2">Upgrade to Pro</Button>
            <Button variant="outline" onClick={() => router.push("/marketer")}>
              Back to Tools
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Tool-specific UI based on the tool ID
  const renderToolContent = () => {
    switch (toolId) {
      case "1": // Lead Generator
        return (
          <div>
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Generate Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Industry</label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="">Select industry</option>
                      <option value="health">Health & Wellness</option>
                      <option value="finance">Finance</option>
                      <option value="education">Education</option>
                      <option value="technology">Technology</option>
                      <option value="retail">Retail</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Location</label>
                    <Input placeholder="Enter location" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Age Range</label>
                    <div className="flex gap-2">
                      <Input placeholder="Min" type="number" />
                      <Input placeholder="Max" type="number" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Interests (comma separated)</label>
                    <Input placeholder="e.g. fitness, nutrition, wellness" />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setLoading(true)
                      setTimeout(() => setLoading(false), 2000)
                    }}
                    disabled={loading}
                  >
                    {loading ? "Generating Leads..." : "Generate Leads"}
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recent Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 mb-4">No leads generated yet</p>
                  <p className="text-sm text-gray-500">
                    Fill in the form above to generate leads based on your criteria
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "3": // Social Media Scheduler
        return (
          <div>
            <Tabs defaultValue="schedule" className="mb-4">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="schedule">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Create Post</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Platforms</label>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="cursor-pointer">
                            Facebook
                          </Badge>
                          <Badge variant="outline" className="cursor-pointer">
                            Instagram
                          </Badge>
                          <Badge variant="outline" className="cursor-pointer">
                            Twitter
                          </Badge>
                          <Badge variant="outline" className="cursor-pointer">
                            LinkedIn
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Content</label>
                        <Textarea placeholder="Write your post content here..." rows={4} />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Schedule Date & Time</label>
                        <Input type="datetime-local" />
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => {
                          setLoading(true)
                          setTimeout(() => setLoading(false), 2000)
                        }}
                        disabled={loading}
                      >
                        {loading ? "Scheduling..." : "Schedule Post"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="calendar">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center py-6">
                      <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500 mb-4">No scheduled posts yet</p>
                      <p className="text-sm text-gray-500">Schedule posts to see them in your content calendar</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center py-6">
                      <BarChart className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500 mb-4">No analytics data available</p>
                      <p className="text-sm text-gray-500">Post content to start tracking performance</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )

      case "6": // Marketing Analytics
        return (
          <div>
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Total Leads</p>
                    <p className="text-2xl font-bold">124</p>
                    <p className="text-xs text-green-600">↑ 12% from last month</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Conversion Rate</p>
                    <p className="text-2xl font-bold">3.2%</p>
                    <p className="text-xs text-green-600">↑ 0.5% from last month</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Avg. Engagement</p>
                    <p className="text-2xl font-bold">18%</p>
                    <p className="text-xs text-red-600">↓ 2% from last month</p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg text-center">
                    <p className="text-sm text-gray-500">ROI</p>
                    <p className="text-2xl font-bold">215%</p>
                    <p className="text-xs text-green-600">↑ 15% from last month</p>
                  </div>
                </div>
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <BarChart className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">Detailed charts and reports</p>
                  <p className="text-sm text-gray-500 mb-4">
                    View comprehensive analytics for your marketing campaigns
                  </p>
                  <Button>View Detailed Reports</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Summer Promotion</p>
                      <p className="text-xs text-gray-500">Jun 1 - Aug 31, 2025</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-0">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Product Launch</p>
                      <p className="text-xs text-gray-500">May 15 - Jun 15, 2025</p>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800 border-0">Completed</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Holiday Special</p>
                      <p className="text-xs text-gray-500">Dec 1 - Dec 31, 2025</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 border-0">Scheduled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "8": // Audience Segmentation
        return (
          <div>
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Create Audience Segment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Segment Name</label>
                    <Input placeholder="e.g. High-Value Prospects" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Demographics</label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input type="checkbox" id="age" className="mr-2" />
                        <label htmlFor="age">Age Range: 25-45</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="income" className="mr-2" />
                        <label htmlFor="income">Income: $50k+</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="education" className="mr-2" />
                        <label htmlFor="education">Education: College+</label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Behavior</label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input type="checkbox" id="visited" className="mr-2" />
                        <label htmlFor="visited">Visited website in last 30 days</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="engaged" className="mr-2" />
                        <label htmlFor="engaged">Engaged with email campaigns</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="purchased" className="mr-2" />
                        <label htmlFor="purchased">Made a purchase in last 90 days</label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Interests</label>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="cursor-pointer">
                        Health & Wellness
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer">
                        Business
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer">
                        Technology
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer">
                        Finance
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer">
                        Education
                      </Badge>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setLoading(true)
                      setTimeout(() => setLoading(false), 2000)
                    }}
                    disabled={loading}
                  >
                    {loading ? "Creating Segment..." : "Create Segment"}
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Saved Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 mb-4">No segments created yet</p>
                  <p className="text-sm text-gray-500">
                    Create audience segments to target specific groups with your marketing campaigns
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return (
          <div className="text-center py-10">
            <Info className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <h3 className="text-lg font-medium mb-1">Tool Interface Coming Soon</h3>
            <p className="text-gray-500 mb-4">We're working on building this tool interface</p>
            <Button onClick={() => router.push("/marketer")}>Back to Tools</Button>
          </div>
        )
    }
  }

  return (
    <div className="pb-16">
      <header className="app-header">
        <Button variant="ghost" size="icon" onClick={() => router.push("/marketer")}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold truncate">{tool.name}</h1>
        <div className="w-9"></div>
      </header>

      <div className="p-4 content-area">
        <div className="flex items-center mb-4">
          <div className={`bg-gray-100 p-3 rounded-lg mr-3`}>{tool.icon}</div>
          <div>
            <h2 className="font-bold">{tool.name}</h2>
            <p className="text-sm text-gray-600">{tool.description}</p>
          </div>
        </div>

        {renderToolContent()}
      </div>
    </div>
  )
}

