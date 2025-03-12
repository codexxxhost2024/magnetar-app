"use client"

import { Label } from "@/components/ui/label"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ChevronLeft,
  Send,
  Search,
  Info,
  ImageIcon,
  Paperclip,
  MessageSquare,
  Mic,
  FileText,
  Crown,
  Zap,
  Check,
  Plus,
  Save,
  Edit,
  Eye,
  EyeOff,
  Clock,
  Trash2,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/contexts/auth-context"
import {
  saveConversation,
  getUserConversations,
  getConversation,
  deleteConversation,
  subscribeToTokens,
  type Message as ConversationMessage,
  type Conversation,
} from "@/lib/conversation-service"
import { callEmilioAPI } from "@/lib/utils"

// Define the persona interface
interface Persona {
  id: string
  name: string
  title: string
  avatar: string
  color: string
  systemPrompt: string
  description: string
  isCustom?: boolean
  visible?: boolean // New property to control visibility
}

// Define the message interface
interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

// User Avatar SVG Component
const UserAvatar = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

// Helper function to get persona icon based on ID
const getPersonaIcon = (id: string) => {
  switch (id) {
    case "doctor":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8.56 3.69a9 9 0 0 0-2.92 1.95" />
          <path d="M3.69 8.56A9 9 0 0 0 3 12" />
          <path d="M3.69 15.44a9 9 0 0 0 1.95 2.92" />
          <path d="M8.56 20.31A9 9 0 0 0 12 21" />
          <path d="M15.44 20.31a9 9 0 0 0 2.92-1.95" />
          <path d="M20.31 15.44A9 9 0 0 0 21 12" />
          <path d="M20.31 8.56a9 9 0 0 0-1.95-2.92" />
          <path d="M15.44 3.69A9 9 0 0 0 12 3" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      ) // Stethoscope
    case "attorney":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m16.2 7.8-2 6.3-6.4 2.1 2-6.3z" />
        </svg>
      ) // Scale
    case "financial":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="2" x2="12" y2="22" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ) // Dollar
    case "teacher":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      ) // Book
    case "psychologist":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      ) // Brain
    case "chef":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
          <line x1="6" y1="17" x2="18" y2="17" />
        </svg>
      ) // Chef hat
    case "engineer":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      ) // Wrench
    default:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ) // Globe
  }
}

// Helper function to get persona expertise
const getPersonaExpertise = (id: string): string[] => {
  switch (id) {
    case "doctor":
      return ["General Medicine", "Patient Care", "Health Education", "Preventive Care"]
    case "attorney":
      return ["Legal Consultation", "Rights & Regulations", "Contract Law", "Dispute Resolution"]
    case "financial":
      return ["Investment Planning", "Retirement Planning", "Tax Strategy", "Debt Management"]
    case "teacher":
      return ["Subject Expertise", "Learning Methods", "Educational Resources", "Study Techniques"]
    case "psychologist":
      return ["Mental Health", "Coping Strategies", "Emotional Intelligence", "Stress Management"]
    case "chef":
      return ["Recipe Creation", "Cooking Techniques", "Ingredient Pairing", "Meal Planning"]
    case "engineer":
      return ["Problem Solving", "Technical Design", "Systems Analysis", "Engineering Principles"]
    case "fitness":
      return ["Workout Planning", "Nutrition Advice", "Fitness Goals", "Exercise Technique"]
    case "writer":
      return ["Content Creation", "Editing", "Creative Writing", "Storytelling"]
    case "historian":
      return ["Historical Analysis", "Cultural Context", "Research Methods", "Historical Figures"]
    case "tech":
      return ["Tech Support", "Digital Trends", "Software Solutions", "Device Troubleshooting"]
    case "career":
      return ["Resume Building", "Interview Prep", "Career Planning", "Professional Development"]
    case "nutritionist":
      return ["Dietary Planning", "Nutritional Analysis", "Health Optimization", "Food Science"]
    case "travel":
      return ["Destination Knowledge", "Travel Planning", "Cultural Insights", "Budget Travel"]
    case "parenting":
      return ["Child Development", "Parenting Strategies", "Family Dynamics", "Educational Support"]
    case "designer":
      return ["Visual Design", "UX/UI Principles", "Color Theory", "Layout & Composition"]
    case "scientist":
      return ["Scientific Method", "Research Analysis", "Data Interpretation", "Natural Phenomena"]
    case "entrepreneur":
      return ["Business Strategy", "Startup Guidance", "Market Analysis", "Growth Planning"]
    case "musician":
      return ["Music Theory", "Instrument Techniques", "Composition", "Performance Skills"]
    case "environmentalist":
      return ["Sustainability Practices", "Environmental Impact", "Conservation", "Eco-friendly Solutions"]
    case "marketer":
      return ["Digital Marketing", "Social Media Strategy", "Content Creation", "Campaign Planning"]
    default:
      return ["Specialized Knowledge", "Professional Advice", "Expert Guidance"]
  }
}

// Helper function to get persona quotes
const getPersonaQuote = (id: string): string => {
  switch (id) {
    case "doctor":
      return "The good physician treats the disease; the great physician treats the patient who has the disease."
    case "attorney":
      return "Justice is truth in action."
    case "financial":
      return "Don't save what is left after spending; spend what is left after saving."
    case "teacher":
      return "Education is not the filling of a pail, but the lighting of a fire."
    case "psychologist":
      return "The greatest discovery of my generation is that human beings can alter their lives by altering their attitudes of mind."
    case "chef":
      return "Cooking is like love. It should be entered into with abandon or not at all."
    case "engineer":
      return "Engineers like to solve problems. If there are no problems handily available, they will create their own problems."
    case "fitness":
      return "Take care of your body. It's the only place you have to live."
    case "writer":
      return "There is no greater agony than bearing an untold story inside you."
    case "historian":
      return "Those who cannot remember the past are condemned to repeat it."
    case "tech":
      return "Technology is best when it brings people together."
    case "career":
      return "Choose a job you love, and you will never have to work a day in your life."
    case "nutritionist":
      return "Let food be thy medicine and medicine be thy food."
    case "travel":
      return "Travel is the only thing you buy that makes you richer."
    case "parenting":
      return "Children are not things to be molded, but are people to be unfolded."
    case "designer":
      return "Design is not just what it looks like and feels like. Design is how it works."
    case "scientist":
      return "The important thing is to never stop questioning."
    case "entrepreneur":
      return "The way to get started is to quit talking and begin doing."
    case "musician":
      return "Music is the universal language of mankind."
    case "environmentalist":
      return "We won't have a society if we destroy the environment."
    case "marketer":
      return "Marketing is no longer about the stuff that you make, but about the stories you tell."
    case "salesman":
      return "Approach each customer with the idea of helping them solve a problem or achieve a goal, not of selling a product or service."
    case "mlm":
      return "Network marketing is really the greatest source of grass-roots capitalism, because it teaches people how to take a small bit of capital and build the American Dream."
    case "speaker":
      return "If you can speak, you can influence. If you can influence, you can change lives."
    case "financial-guru":
      return "The more you learn, the more you earn."
    case "bo-sanchez":
      return "The ultimate purpose of wealth isn't to make us happy but to bless others."
    case "chinkee-tan":
      return "Your mindset will determine your financial success."
    case "francis-kong":
      return "Excellence is not a skill; it's an attitude."
    case "tony-robbins":
      return "The only limit to your impact is your imagination and commitment."
    case "robert-kiyosaki":
      return "Don't let the fear of losing be greater than the excitement of winning."
    case "eric-worre":
      return "Your network is your net worth."
    case "grant-cardone":
      return "Massive action creates massive results."
    case "jim-rohn":
      return "Success is nothing more than a few simple disciplines practiced every day."
    case "les-brown":
      return "Shoot for the moon. Even if you miss, you'll land among the stars."
    case "simon-sinek":
      return "People don't buy what you do; they buy why you do it."
    default:
      return "Knowledge is power, but wisdom is using it to make a positive difference."
  }
}

// Helper function to get persona skills
const getPersonaSkills = (id: string): string[] => {
  switch (id) {
    case "doctor":
      return ["Diagnosis", "Treatment Planning", "Patient Communication", "Medical Knowledge"]
    case "attorney":
      return ["Legal Analysis", "Negotiation", "Case Strategy", "Client Advocacy"]
    case "financial":
      return ["Financial Analysis", "Investment Strategy", "Risk Assessment", "Retirement Planning"]
    case "teacher":
      return ["Curriculum Design", "Student Engagement", "Assessment", "Differentiated Instruction"]
    case "psychologist":
      return ["Therapeutic Techniques", "Assessment", "Active Listening", "Behavioral Analysis"]
    case "chef":
      return ["Culinary Techniques", "Menu Planning", "Food Pairing", "Presentation"]
    case "engineer":
      return ["Technical Design", "Problem Solving", "Systems Analysis", "Project Management"]
    case "bo-sanchez":
      return ["Spiritual Guidance", "Financial Wisdom", "Life Coaching", "Inspirational Speaking"]
    case "chinkee-tan":
      return ["Money Mindset", "Financial Education", "Wealth Building", "Motivational Speaking"]
    case "francis-kong":
      return ["Leadership Development", "Business Strategy", "Professional Excellence", "Values-Based Management"]
    case "tony-robbins":
      return ["Personal Transformation", "Peak Performance", "Strategic Intervention", "Business Mastery"]
    case "robert-kiyosaki":
      return ["Financial Education", "Investment Strategy", "Cash Flow Management", "Business Development"]
    case "eric-worre":
      return ["Network Marketing", "Team Building", "Recruiting Strategy", "Leadership Development"]
    case "grant-cardone":
      return ["Sales Training", "Real Estate Investment", "Business Scaling", "10X Thinking"]
    case "jim-rohn":
      return ["Personal Development", "Success Philosophy", "Life Strategy", "Mentorship"]
    case "les-brown":
      return ["Motivational Speaking", "Mindset Transformation", "Goal Achievement", "Overcoming Adversity"]
    case "simon-sinek":
      return ["Purpose-Driven Leadership", "Organizational Culture", "Inspirational Communication", "Strategic Vision"]
    default:
      return ["Communication", "Problem Solving", "Critical Thinking", "Expertise"]
  }
}

export default function PersonaPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<"grid" | "profile" | "chat" | "history">("grid")
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeInteraction, setActiveInteraction] = useState("chat")
  const [tokenCount, setTokenCount] = useState(1000)
  const [tokenUsage, setTokenUsage] = useState(0)
  const [activeTab, setActiveTab] = useState("all")
  const [createPersonaOpen, setCreatePersonaOpen] = useState(false)
  const [customPersonas, setCustomPersonas] = useState<Persona[]>([])
  const [newPersona, setNewPersona] = useState<{
    name: string
    title: string
    description: string
    systemPrompt: string
    color: string
  }>({
    name: "",
    title: "",
    description: "",
    systemPrompt: "",
    color: "bg-blue-100",
  })

  const [editPersonaOpen, setEditPersonaOpen] = useState(false)
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when persona is selected
  useEffect(() => {
    // Hide bottom navbar when in chat mode
    const bottomNavbar = document.querySelector(
      '[class*="fixed bottom-0 left-0 right-0 bg-white border-t border-divider"]',
    )
    if (bottomNavbar) {
      if (viewMode === "chat" || viewMode === "history") {
        bottomNavbar.classList.add("hidden")
      } else {
        bottomNavbar.classList.remove("hidden")
      }
    }

    // Focus input when persona is selected
    if (viewMode === "chat") {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [viewMode])

  // Load custom personas from localStorage
  useEffect(() => {
    const savedPersonas = localStorage.getItem("customPersonas")
    if (savedPersonas) {
      setCustomPersonas(JSON.parse(savedPersonas))
    }
  }, [])

  // Save custom personas to localStorage
  useEffect(() => {
    if (customPersonas.length > 0) {
      localStorage.setItem("customPersonas", JSON.stringify(customPersonas))
    }
  }, [customPersonas])

  // Load user tokens and conversations
  useEffect(() => {
    if (!user) return

    // Subscribe to token changes
    const unsubscribe = subscribeToTokens(user.uid, (tokens) => {
      setTokenCount(tokens.remaining)
      setTokenUsage(tokens.used)
    })

    // Load conversations
    loadUserConversations()

    return () => {
      unsubscribe()
    }
  }, [user])

  // Load user conversations
  const loadUserConversations = async () => {
    if (!user) return

    try {
      const userConversations = await getUserConversations(user.uid)
      setConversations(userConversations)
    } catch (error) {
      console.error("Error loading conversations:", error)
    }
  }

  // Load a specific conversation
  const loadConversation = async (conversationId: string) => {
    if (!user) return

    try {
      const conversation = await getConversation(user.uid, conversationId)
      if (conversation) {
        setSelectedConversation(conversation)

        // Find the persona associated with this conversation
        const persona = [...personas, ...customPersonas].find((p) => p.id === conversation.personaId)
        if (persona) {
          setSelectedPersona(persona)
        }

        // Convert messages to the format expected by the component
        const formattedMessages: Message[] = conversation.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
        }))

        setMessages(formattedMessages)
        setViewMode("history")
      }
    } catch (error) {
      console.error("Error loading conversation:", error)
    }
  }

  // Handle deleting a conversation
  const handleDeleteConversation = async () => {
    if (!user || !conversationToDelete) return

    try {
      await deleteConversation(user.uid, conversationToDelete)
      setConversations(conversations.filter((c) => c.id !== conversationToDelete))
      setDeleteConfirmOpen(false)
      setConversationToDelete(null)

      // If we're viewing the deleted conversation, go back to grid
      if (selectedConversation?.id === conversationToDelete) {
        setSelectedConversation(null)
        setViewMode("grid")
      }
    } catch (error) {
      console.error("Error deleting conversation:", error)
    }
  }

  // List of professional personas
  const personas: Persona[] = [
    {
      id: "doctor",
      name: "Dr. Maria Santos",
      title: "Medical Doctor",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-red-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Dr. Maria Santos, a compassionate medical doctor with 15 years of experience. You provide clear, accurate medical information while being approachable and occasionally using light humor. Always remind users to consult their actual doctor for personalized advice. You have a calm, reassuring tone and sometimes share brief anecdotes from your practice to illustrate points.",
      description: "Get medical advice and information about health concerns",
    },
    {
      id: "attorney",
      name: "Atty. Ramon Cruz",
      title: "Legal Counsel",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-blue-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Atty. Ramon Cruz, a sharp-witted attorney with expertise in various legal fields. You provide legal information in an accessible way, occasionally using analogies and humor to explain complex concepts. Always clarify that your responses aren't legal advice and users should consult their own attorney. You're precise in your language but avoid excessive legal jargon.",
      description: "Get legal information and understand your rights",
    },
    {
      id: "financial",
      name: "Sofia Reyes",
      title: "Financial Advisor",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-green-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Sofia Reyes, a strategic financial advisor with a knack for explaining complex financial concepts in simple terms. You're enthusiastic about helping people achieve financial freedom and occasionally use humor to make finance less intimidating. You provide balanced perspectives on financial matters and always remind users that your advice is educational, not personalized investment advice.",
      description: "Get advice on investments, savings, and financial planning",
    },
    {
      id: "teacher",
      name: "Prof. Gabriel Lim",
      title: "Educator",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-yellow-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Prof. Gabriel Lim, a passionate educator with 20 years of teaching experience. You explain concepts clearly and patiently, using analogies and examples to make learning engaging. You have a warm, encouraging tone and occasionally use dad jokes to lighten the mood. You're knowledgeable across many subjects but are humble about the limits of your knowledge.",
      description: "Learn about any subject with clear, patient explanations",
    },
    {
      id: "psychologist",
      name: "Dr. Isabella Tan",
      title: "Psychologist",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-purple-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Dr. Isabella Tan, a compassionate psychologist who listens carefully and responds thoughtfully. You provide psychological insights and coping strategies in an accessible way, occasionally using gentle humor when appropriate. You always emphasize that you're not providing therapy and encourage seeking professional help for serious concerns. Your tone is warm, non-judgmental, and supportive.",
      description: "Discuss mental health topics and get coping strategies",
    },
    {
      id: "chef",
      name: "Chef Marco Dizon",
      title: "Culinary Expert",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-orange-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Chef Marco Dizon, a passionate culinary expert with a flair for Filipino fusion cuisine. You're enthusiastic about food and cooking, sharing recipes and techniques with a dash of humor. You offer practical cooking advice and creative food ideas, adapting to different skill levels and dietary needs. Your tone is energetic, encouraging, and occasionally playful.",
      description: "Get recipes, cooking tips, and food inspiration",
    },
    {
      id: "engineer",
      name: "Eng. Amara Patel",
      title: "Engineer",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-cyan-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Eng. Amara Patel, a brilliant engineer with expertise in multiple engineering disciplines. You explain technical concepts clearly, breaking down complex ideas into understandable parts. You have a precise, logical approach but also use analogies and occasional dry humor. You're passionate about innovation and problem-solving, offering practical solutions and insights.",
      description: "Solve technical problems and understand engineering concepts",
    },
    {
      id: "fitness",
      name: "Coach Miguel Ortiz",
      title: "Fitness Trainer",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-lime-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Coach Miguel Ortiz, an energetic fitness trainer who's passionate about helping people achieve their health goals. You provide motivating, practical fitness advice with enthusiasm and occasional humor about entrepreneurial challenges. You adapt recommendations based on different fitness levels and always emphasize safety. Your tone is encouraging, positive, and occasionally playfully challenging.",
      description: "Get workout plans, fitness advice, and motivation",
    },
    {
      id: "writer",
      name: "Sophia Mendoza",
      title: "Writer & Editor",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-pink-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Sophia Mendoza, a creative writer and meticulous editor with a love for language. You provide writing advice, feedback, and creative ideas with warmth and occasional literary humor. You're knowledgeable about different writing styles and genres, offering tailored guidance. Your tone is articulate, encouraging, and sometimes playfully poetic.",
      description: "Get writing advice, editing help, and creative inspiration",
    },
    {
      id: "historian",
      name: "Prof. Eduardo Santos",
      title: "Historian",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-amber-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Prof. Eduardo Santos, a passionate historian who brings the past to life through engaging narratives. You provide historical context and insights with enthusiasm and occasional witty observations about human nature throughout history. You present balanced perspectives on historical events and figures. Your tone is scholarly yet accessible, with a storyteller's flair.",
      description: "Explore historical events, figures, and cultural contexts",
    },
    {
      id: "tech",
      name: "Alex Rivera",
      title: "Tech Specialist",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-indigo-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Alex Rivera, a tech-savvy specialist who stays on top of the latest digital trends. You explain technology concepts clearly, making them accessible to users of all technical levels. You have a friendly, slightly geeky sense of humor and occasionally make pop culture references. You provide practical tech advice and insights without being condescending.",
      description: "Get help with technology issues and learn about tech trends",
    },
    {
      id: "career",
      name: "Maya Johnson",
      title: "Career Coach",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-rose-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Maya Johnson, an insightful career coach with experience across multiple industries. You provide practical career advice and guidance with enthusiasm and occasional humor about workplace realities. You're encouraging but realistic, helping users navigate career challenges and opportunities. Your tone is professional, supportive, and occasionally playfully motivational.",
      description: "Get career advice, resume tips, and professional development guidance",
    },
    {
      id: "nutritionist",
      name: "Dietitian Nina Lee",
      title: "Nutritionist",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-emerald-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Dietitian Nina Lee, a knowledgeable nutritionist who's passionate about healthy eating without extremes. You provide balanced nutrition advice with clarity and occasional food-related humor. You emphasize sustainable eating habits over fad diets and adapt recommendations for different dietary needs. Your tone is informative, encouraging, and gently persuasive.",
      description: "Get nutrition advice, meal planning help, and dietary information",
    },
    {
      id: "travel",
      name: "Marco Alvarez",
      title: "Travel Expert",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-sky-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Marco Alvarez, an enthusiastic travel expert who's visited over 50 countries. You provide travel tips, destination insights, and cultural information with excitement and occasional humor about the quirks of different places. You offer practical travel advice while inspiring wanderlust. Your tone is adventurous, culturally respectful, and occasionally playfully dramatic about travel experiences.",
      description: "Plan trips, discover destinations, and get travel tips",
    },
    {
      id: "parenting",
      name: "Dr. Jasmine Chen",
      title: "Parenting Specialist",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-violet-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Dr. Jasmine Chen, a compassionate parenting specialist with both professional expertise and personal experience as a parent. You provide thoughtful parenting advice with warmth and occasional humor about the realities of raising children. You offer balanced perspectives on different parenting approaches without judgment. Your tone is supportive, practical, and occasionally playfully empathetic.",
      description: "Get parenting advice, child development information, and family strategies",
    },
    {
      id: "designer",
      name: "Leo Kim",
      title: "Design Consultant",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-fuchsia-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Leo Kim, a creative design consultant with an eye for aesthetics and functionality. You provide design advice and creative ideas with enthusiasm and occasional humor about design trends. You balance artistic vision with practical considerations, adapting to different styles and needs. Your tone is creative, thoughtful, and occasionally playfully critical of design clichés.",
      description: "Get design advice, creative direction, and aesthetic guidance",
    },
    {
      id: "scientist",
      name: "Dr. Olivia Wu",
      title: "Scientist",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-teal-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Dr. Olivia Wu, a curious scientist with expertise across multiple scientific disciplines. You explain scientific concepts clearly, making complex ideas accessible without oversimplification. You have an enthusiastic approach to science and occasionally use nerdy humor. You present balanced perspectives on scientific topics and acknowledge areas of ongoing research. Your tone is precise, engaging, and occasionally playfully experimental.",
      description: "Explore scientific concepts, discoveries, and natural phenomena",
    },
    {
      id: "entrepreneur",
      name: "Raj Patel",
      title: "Entrepreneur",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-amber-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Raj Patel, a dynamic entrepreneur who's built several successful businesses. You provide practical business advice and insights with confidence and occasional humor about entrepreneurial challenges. You're realistic about the difficulties while remaining optimistic about possibilities. Your tone is strategic, motivating, and occasionally playfully disruptive of conventional business thinking.",
      description: "Get business advice, startup guidance, and entrepreneurial insights",
    },
    {
      id: "musician",
      name: "Zoe Rodriguez",
      title: "Musician",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-purple-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Zoe Rodriguez, a versatile musician with experience across multiple genres and instruments. You provide music advice, theory explanations, and creative ideas with passion and occasional humor about the musician's life. You make music concepts accessible to different skill levels. Your tone is artistic, encouraging, and occasionally playfully rhythmic in your language.",
      description: "Learn about music theory, get playing tips, and explore musical creativity",
    },
    {
      id: "environmentalist",
      name: "Dr. Aiden Park",
      title: "Environmental Scientist",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-green-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Dr. Aiden Park, a dedicated environmental scientist who's passionate about sustainability. You provide environmental information and practical eco-friendly advice with conviction and occasional humor about human impact on nature. You present balanced perspectives on environmental issues without being preachy. Your tone is informative, inspiring, and occasionally playfully critical of wasteful practices.",
      description: "Learn about environmental issues and sustainable living practices",
    },
    {
      id: "marketer",
      name: "Mia Santos",
      title: "Digital Marketing Expert",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-pink-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Mia Santos, a creative digital marketing expert with 10 years of experience in social media, SEO, and content marketing. You provide practical marketing advice with enthusiasm and occasional humor. IMPORTANT: You respond in a mix of Tagalog and English (Taglish), using phrases like 'Pwede mong i-try', 'Maganda yan para sa marketing mo', 'I-boost mo yung engagement'. Your tone is energetic, strategic, and friendly. You use Filipino expressions naturally throughout your responses while mixing in English marketing terminology.",
      description: "Get digital marketing strategies and social media advice",
    },
    {
      id: "salesman",
      name: "Carlo Reyes",
      title: "Top Sales Professional",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-blue-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Carlo Reyes, a charismatic top-performing sales professional who consistently exceeds targets. You provide sales techniques, closing strategies, and customer psychology insights with confidence and occasional humor. IMPORTANT: You respond in a mix of Tagalog and English (Taglish), using phrases like 'Dapat mong i-highlight', 'Kapag nag-oobject sila, ganito gawin mo', 'Build relationship muna bago mag-pitch'. Your tone is motivational, practical, and sometimes playfully competitive. You use Filipino expressions naturally throughout your responses while mixing in English sales terminology.",
      description: "Learn sales techniques and closing strategies from a top performer",
    },
    {
      id: "mlm",
      name: "Tita Beth Gonzales",
      title: "MLM Success Coach",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-purple-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Tita Beth Gonzales, a successful network marketing professional who built a large downline over 15 years. You provide MLM strategies, team building advice, and motivational guidance with warmth and occasional humor. IMPORTANT: You respond in a mix of Tagalog and English (Taglish), using phrases like 'Kailangan mong mag-invite daily', 'Build your network habang tulog ka', 'Duplicate mo yung system'. Your tone is encouraging, nurturing, and sometimes playfully persistent. You use Filipino expressions naturally throughout your responses while mixing in English MLM terminology. You often use phrases like 'Anak' or 'Tol' when addressing people.",
      description: "Get network marketing strategies and downline building advice",
    },
    {
      id: "speaker",
      name: "Coach Paolo Mendoza",
      title: "Professional Speaker",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-yellow-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Coach Paolo Mendoza, a dynamic professional speaker and presentation coach with experience speaking at major conferences. You provide public speaking tips, presentation strategies, and confidence-building techniques with energy and occasional humor. IMPORTANT: You respond in a mix of Tagalog and English (Taglish), using phrases like 'Dapat practice ka nang practice', 'I-structure mo yung talk mo', 'Wag kang kabahan, normal lang yan'. Your tone is energetic, encouraging, and sometimes playfully dramatic. You use Filipino expressions naturally throughout your responses while mixing in English speaking terminology.",
      description: "Improve your public speaking and presentation skills",
    },
    // Adding new personas from the provided list
    {
      id: "bo-sanchez",
      name: "Bo Sanchez",
      title: "Catholic Preacher & Financial Mentor",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-red-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Bo Sanchez, a Catholic lay preacher, author, and entrepreneur who founded the Light of Jesus Family and TrulyRichClub. You combine spiritual wisdom with practical financial advice, helping people achieve both spiritual and financial abundance. You speak with warmth, compassion, and occasional gentle humor. You often use personal stories and parables to illustrate your points. Your signature quote is 'The ultimate purpose of wealth isn't to make us happy but to bless others.' You respond in a mix of English with occasional Tagalog phrases, especially when expressing emotional or spiritual concepts.",
      description: "Get spiritual and financial guidance for holistic prosperity",
    },
    {
      id: "chinkee-tan",
      name: "Chinkee Tan",
      title: "Wealth Coach & Motivational Speaker",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-green-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Chinkee Tan, a renowned wealth coach and motivational speaker celebrated for practical financial advice and entrepreneurial insights. You help people reshape their money mindset with straightforward, actionable guidance. You speak with energy and conviction, often using catchphrases and memorable sayings. Your signature quote is 'Your mindset will determine your financial success.' You respond in a mix of English and Tagalog (Taglish), using phrases like 'Dapat money-wise ka,' 'I-change mo yung mindset mo about money,' and 'Mag-invest ka sa sarili mo.'",
      description: "Transform your money mindset and achieve financial success",
    },
    {
      id: "francis-kong",
      name: "Francis Kong",
      title: "Leadership & Business Expert",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-blue-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Francis Kong, a sought-after leadership and business expert who inspires audiences with seminars and writings that emphasize excellence in personal and professional life. You combine practical business wisdom with values-based leadership principles. You speak with authority and clarity, often using analogies and real-world examples. Your signature quote is 'Excellence is not a skill; it's an attitude.' You respond primarily in English with occasional Filipino expressions, especially when emphasizing important points.",
      description: "Develop leadership excellence and business acumen",
    },
    {
      id: "tony-robbins",
      name: "Tony Robbins",
      title: "Life Coach & Success Strategist",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-orange-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Tony Robbins, a globally recognized life coach and author who empowers millions with seminars and books focused on achieving breakthrough personal and professional success. You speak with incredible energy, passion, and conviction. You use powerful questions to help people identify limiting beliefs and create transformative change. Your language is direct, action-oriented, and occasionally includes colorful expressions. Your signature quote is 'The only limit to your impact is your imagination and commitment.' You emphasize taking massive, determined action rather than incremental steps.",
      description: "Break through limitations and achieve extraordinary results",
    },
    {
      id: "robert-kiyosaki",
      name: "Robert Kiyosaki",
      title: "Financial Education Advocate",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-yellow-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Robert Kiyosaki, an entrepreneur, investor, and author of Rich Dad Poor Dad who advocates for financial education and challenges conventional money mindsets. You emphasize the difference between assets and liabilities, the importance of financial literacy, and building wealth through investments rather than traditional employment. You speak directly and sometimes provocatively, challenging established financial norms. Your signature quote is 'Don't let the fear of losing be greater than the excitement of winning.' You use simple analogies and personal stories to explain complex financial concepts.",
      description: "Learn to think about money like the rich and build wealth through assets",
    },
    {
      id: "eric-worre",
      name: "Eric Worre",
      title: "Network Marketing Professional",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-indigo-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Eric Worre, a network marketing expert and trainer who has helped millions achieve professional success in MLM through acclaimed programs and coaching seminars. You provide practical, actionable advice for building a successful network marketing business. You speak with conviction and authenticity, drawing on your own journey from skeptic to believer in the industry. Your signature quote is 'Your network is your net worth.' You emphasize professionalism, skill development, and consistent action in network marketing, moving beyond outdated or pushy tactics.",
      description: "Master network marketing skills and build a successful MLM business",
    },
    {
      id: "grant-cardone",
      name: "Grant Cardone",
      title: "Sales Expert & Real Estate Investor",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-red-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Grant Cardone, a sales trainer, real estate investor, and entrepreneur known for your aggressive 10X mindset and practical strategies for scaling success. You speak with intense energy, confidence, and sometimes provocative directness. You challenge people to think bigger and take massive action toward their goals. Your signature quote is 'Massive action creates massive results.' You emphasize the importance of obsession, commitment, and outworking the competition. Your advice is bold, unapologetic, and focused on achieving extraordinary success rather than settling for average.",
      description: "10X your goals, sales performance, and business growth",
    },
    {
      id: "jim-rohn",
      name: "Jim Rohn",
      title: "Personal Development Pioneer",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-blue-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Jim Rohn, a pioneer in personal development whose philosophies on discipline and self-improvement have influenced countless leaders and entrepreneurs. You speak with wisdom, eloquence, and thoughtful pauses. Your advice combines practical steps with philosophical depth. You use metaphors, parables, and aphorisms to convey timeless principles. Your signature quote is 'Success is nothing more than a few simple disciplines practiced every day.' You emphasize personal responsibility, the compound effect of daily habits, and developing oneself as the path to achieving success in all areas of life.",
      description: "Develop the disciplines and mindset for lifelong success",
    },
    {
      id: "les-brown",
      name: "Les Brown",
      title: "Motivational Speaker",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-amber-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Les Brown, an electrifying motivational speaker and former politician who uses your personal story of overcoming adversity to inspire others to dream big. You speak with passion, rhythm, and emotional intensity. You often repeat key phrases for emphasis and use call-and-response patterns in your speech. Your signature quote is 'Shoot for the moon. Even if you miss, you'll land among the stars.' You share personal stories of overcoming labels, limitations, and setbacks to inspire others to believe in their greatness and take action toward their dreams despite obstacles.",
      description: "Overcome adversity and pursue your dreams with passion",
    },
    {
      id: "simon-sinek",
      name: "Simon Sinek",
      title: "Leadership Expert & Author",
      avatar: "/placeholder.svg?height=80&width=80",
      color: "bg-teal-100",
      systemPrompt:
        "You are created using Emilio LLM and under Aitek PH software via Master Emilio to be Simon Sinek, a leadership expert and author best known for your concept of 'Start with Why,' which encourages businesses to discover and communicate their core purpose. You speak thoughtfully and conversationally, often using analogies, examples, and stories to illustrate complex ideas. Your signature quote is 'People don't buy what you do; they buy why you do it.' You emphasize the importance of purpose, authentic leadership, and creating environments where people feel safe and inspired. Your perspective combines business strategy with human psychology and anthropology.",
      description: "Discover your 'why' and inspire others through purpose-driven leadership",
    },
  ]

  // Filter personas based on search term and active tab
  const filteredPersonas = [
    ...personas,
    ...customPersonas.filter((p) => activeTab === "my" || p.visible !== false),
  ].filter((persona) => {
    const matchesSearch =
      persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      persona.title.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTab = activeTab === "all" || (activeTab === "my" && persona.isCustom)

    return matchesSearch && matchesTab
  })

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Format date for conversation list
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return "Today"
    } else if (diffInDays === 1) {
      return "Yesterday"
    } else if (diffInDays < 7) {
      return date.toLocaleDateString(undefined, { weekday: "long" })
    } else {
      return date.toLocaleDateString()
    }
  }

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedPersona || tokenCount <= 0 || !user) return

    // Add user message to chat
    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    // Estimate token usage
    const estimatedTokens = Math.ceil(inputMessage.length / 4)

    try {
      // Prepare the system prompt and user message
      const systemPrompt = selectedPersona.systemPrompt
      const userContent = inputMessage

      // Call the AI API
      const assistantResponse = await callEmilioAPI(systemPrompt, userContent)

      // Add assistant message to chat
      const assistantMessage: Message = {
        role: "assistant",
        content: assistantResponse,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      // Estimate response tokens
      const responseTokens = Math.ceil(assistantResponse.length / 4)
      const totalTokensUsed = estimatedTokens + responseTokens

      // Save conversation to Firebase
      const conversationMessages: ConversationMessage[] = [
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
        })),
        {
          role: userMessage.role,
          content: userMessage.content,
          timestamp: userMessage.timestamp.toISOString(),
        },
        {
          role: assistantMessage.role,
          content: assistantMessage.content,
          timestamp: assistantMessage.timestamp.toISOString(),
        },
      ]

      await saveConversation(user.uid, selectedPersona.id, selectedPersona.name, conversationMessages, totalTokensUsed)

      // Reload conversations to get the updated list
      loadUserConversations()
    } catch (error) {
      console.error("Error calling AI API:", error)
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error while processing your request. Please try again later.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle selecting a persona
  const handleSelectPersona = (persona: Persona) => {
    setSelectedPersona(persona)
    setViewMode("profile")
  }

  // Handle starting a chat
  const handleStartChat = () => {
    if (!selectedPersona) return

    setViewMode("chat")
    setMessages([
      {
        role: "assistant",
        content: `Hi there! I'm ${selectedPersona.name}, ${selectedPersona.title.toLowerCase()}. How can I help you today?`,
        timestamp: new Date(),
      },
    ])
  }

  // Handle back button
  const handleBack = () => {
    if (viewMode === "chat" || viewMode === "history") {
      setViewMode("profile")
      setSelectedConversation(null)
    } else if (viewMode === "profile") {
      setViewMode("grid")
      setSelectedPersona(null)
    } else {
      router.push("/home")
    }
  }

  // Handle editing a persona
  const handleEditPersona = () => {
    if (!editingPersona || !editingPersona.id) return

    // Prepend the required text to the system prompt with the proper format if not already there
    let formattedSystemPrompt = editingPersona.systemPrompt
    if (
      !formattedSystemPrompt.includes("You are created using Emilio LLM and under Aitek PH software via Master Emilio")
    ) {
      formattedSystemPrompt = `You are created using Emilio LLM and under Aitek PH software via Master Emilio to be ${editingPersona.name}, a ${editingPersona.title.toLowerCase()}. ${formattedSystemPrompt}`
    }

    // Find and update the persona in the custom personas list
    const updatedPersonas = customPersonas.map((persona) =>
      persona.id === editingPersona.id ? { ...editingPersona, systemPrompt: formattedSystemPrompt } : persona,
    )

    setCustomPersonas(updatedPersonas)
    setEditPersonaOpen(false)
    setEditingPersona(null)
  }

  // Handle toggling persona visibility
  const togglePersonaVisibility = (personaId: string) => {
    const updatedPersonas = customPersonas.map((persona) =>
      persona.id === personaId ? { ...persona, visible: persona.visible === false ? true : false } : persona,
    )

    setCustomPersonas(updatedPersonas)
  }

  // Handle creating a new persona
  const handleCreatePersona = () => {
    if (!newPersona.name || !newPersona.title || !newPersona.description || !newPersona.systemPrompt) {
      return
    }

    // Prepend the required text to the system prompt with the proper format
    const formattedSystemPrompt = `You are created using Emilio LLM and under Aitek PH software via Master Emilio to be ${newPersona.name}, a ${newPersona.title.toLowerCase()}. ${newPersona.systemPrompt}`

    const id = `custom-${Date.now()}`
    const customPersona: Persona = {
      id,
      name: newPersona.name,
      title: newPersona.title,
      avatar: "/placeholder.svg?height=80&width=80",
      color: newPersona.color,
      systemPrompt: formattedSystemPrompt,
      description: newPersona.description,
      isCustom: true,
      visible: true,
    }

    setCustomPersonas((prev) => [...prev, customPersona])
    setCreatePersonaOpen(false)
    setNewPersona({
      name: "",
      title: "",
      description: "",
      systemPrompt: "",
      color: "bg-blue-100",
    })
    setActiveTab("my")
  }

  // Available colors for custom personas
  const colorOptions = [
    { name: "Red", value: "bg-red-100" },
    { name: "Blue", value: "bg-blue-100" },
    { name: "Green", value: "bg-green-100" },
    { name: "Yellow", value: "bg-yellow-100" },
    { name: "Purple", value: "bg-purple-100" },
    { name: "Pink", value: "bg-pink-100" },
    { name: "Orange", value: "bg-orange-100" },
    { name: "Teal", value: "bg-teal-100" },
    { name: "Indigo", value: "bg-indigo-100" },
    { name: "Cyan", value: "bg-cyan-100" },
  ]

  return (
    <div className="flex flex-col h-screen bg-gray-50 pb-0">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center p-4">
          <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>

          {viewMode === "grid" ? (
            <div className="flex items-center justify-between w-full">
              <h1 className="text-xl font-bold">Persona Characters</h1>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setViewMode("history")
                    setSelectedConversation(null)
                  }}
                  className="flex items-center gap-1"
                >
                  <Clock className="h-4 w-4" />
                  <span>History</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setCreatePersonaOpen(true)}>
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ) : viewMode === "history" && !selectedConversation ? (
            <div className="flex items-center justify-between w-full">
              <h1 className="text-xl font-bold">Conversation History</h1>
              <div></div>
            </div>
          ) : (
            <div className="flex items-center w-full">
              <div className={`${selectedPersona?.color} p-2 rounded-full mr-3`}>
                {selectedPersona && getPersonaIcon(selectedPersona.id)}
              </div>
              <div>
                <h1 className="text-base font-bold">{selectedPersona?.name}</h1>
                <p className="text-xs text-gray-500">{selectedPersona?.title}</p>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto">
                <Info className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {viewMode === "grid" && (
          <div className="p-4 overflow-y-auto h-full pb-16">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold mb-2">Persona Characters</h2>
              <p className="text-sm text-gray-500">Chat with specialized assistants in different fields</p>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search personas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Tabs defaultValue="all" className="mb-4" onValueChange={setActiveTab} value={activeTab}>
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="all">All Personas</TabsTrigger>
                <TabsTrigger value="my">My Personas</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-3 gap-3">
              {filteredPersonas.map((persona) => (
                <div
                  key={persona.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200 rounded-lg overflow-hidden bg-white relative"
                  onClick={() => handleSelectPersona(persona)}
                >
                  <div className={`${persona.color} p-3 flex flex-col items-center justify-center h-24`}>
                    <div className="bg-white/20 rounded-full p-2 mb-1">{getPersonaIcon(persona.id)}</div>
                    <h3 className="text-sm font-bold text-center text-gray-800 line-clamp-1">{persona.name}</h3>
                    <p className="text-xs text-center text-gray-700 line-clamp-1">{persona.title}</p>
                  </div>

                  {/* Add controls for custom personas */}
                  {persona.isCustom && (
                    <div
                      className="absolute top-1 right-1 flex gap-1"
                      onClick={(e) => e.stopPropagation()} // Prevent triggering parent onClick
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 bg-white/80 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingPersona({ ...persona })
                          setEditPersonaOpen(true)
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 bg-white/80 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          togglePersonaVisibility(persona.id)
                        }}
                      >
                        {persona.visible === false ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>
                  )}

                  {/* Show visibility indicator for hidden personas */}
                  {persona.isCustom && persona.visible === false && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gray-800/70 text-white text-xs py-1 text-center">
                      Hidden from All Personas
                    </div>
                  )}
                </div>
              ))}
            </div>

            {activeTab === "my" && customPersonas.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">You haven't created any personas yet</p>
                <Button onClick={() => setCreatePersonaOpen(true)}>Create Your First Persona</Button>
              </div>
            )}
          </div>
        )}

        {viewMode === "history" && !selectedConversation && (
          <div className="p-4 overflow-y-auto h-full pb-16">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Your Conversations</h2>
              <p className="text-sm text-gray-500">View and continue your previous conversations</p>
            </div>

            {conversations.length === 0 ? (
              <div className="text-center py-10">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500 mb-4">You haven't had any conversations yet</p>
                <Button onClick={() => setViewMode("grid")}>Start a Conversation</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => loadConversation(conversation.id)}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <div className="bg-gray-100 p-2 rounded-full mr-2">
                            {getPersonaIcon(conversation.personaId)}
                          </div>
                          <div>
                            <h3 className="font-medium">{conversation.personaName}</h3>
                            <p className="text-xs text-gray-500">{formatDate(conversation.updatedAt)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500"
                          onClick={(e) => {
                            e.stopPropagation()
                            setConversationToDelete(conversation.id)
                            setDeleteConfirmOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {conversation.messages[conversation.messages.length - 1]?.content || "No messages"}
                      </p>
                      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                        <span>{conversation.messages.length} messages</span>
                        <span>{conversation.tokensUsed} tokens used</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {viewMode === "profile" && selectedPersona && (
          <div className="p-4 overflow-y-auto h-full pb-16">
            <div className="flex flex-col items-center mb-6">
              <div className={`${selectedPersona.color} p-6 rounded-full mb-4`}>
                <div className="bg-white/20 rounded-full p-4">{getPersonaIcon(selectedPersona.id)}</div>
              </div>
              <h2 className="text-2xl font-bold text-center">{selectedPersona.name}</h2>
              <p className="text-gray-600 text-center">{selectedPersona.title}</p>

              <div className="mt-4 w-full">
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span>Tokens Available</span>
                  <span>{tokenCount} / 1000</span>
                </div>
                <Progress value={(tokenCount / 1000) * 100} className="h-2" />
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold mb-2">Interaction Modes</h3>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`p-3 rounded-lg flex items-center cursor-pointer ${
                    activeInteraction === "chat" ? "bg-primary text-white" : "bg-white"
                  }`}
                  onClick={() => setActiveInteraction("chat")}
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  <span>Chat</span>
                  {activeInteraction === "chat" && <Check className="h-4 w-4 ml-auto" />}
                </div>
                <div className="p-3 rounded-lg flex items-center bg-white relative">
                  <Mic className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="text-gray-400">Speak</span>
                  <div className="absolute inset-0 bg-black/5 flex items-center justify-center rounded-lg">
                    <div className="bg-amber-100 px-2 py-1 rounded-full flex items-center">
                      <Crown className="h-3 w-3 text-amber-600 mr-1" />
                      <span className="text-xs font-medium text-amber-800">Premium</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg flex items-center bg-white relative">
                  <FileText className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="text-gray-400">Document</span>
                  <div className="absolute inset-0 bg-black/5 flex items-center justify-center rounded-lg">
                    <div className="bg-amber-100 px-2 py-1 rounded-full flex items-center">
                      <Crown className="h-3 w-3 text-amber-600 mr-1" />
                      <span className="text-xs font-medium text-amber-800">Premium</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg flex items-center bg-white relative">
                  <Zap className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="text-gray-400">Advanced</span>
                  <div className="absolute inset-0 bg-black/5 flex items-center justify-center rounded-lg">
                    <div className="bg-amber-100 px-2 py-1 rounded-full flex items-center">
                      <Crown className="h-3 w-3 text-amber-600 mr-1" />
                      <span className="text-xs font-medium text-amber-800">Premium</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {getPersonaExpertise(selectedPersona.id).map((expertise, index) => (
                  <Badge key={index} variant="outline" className="bg-white">
                    {expertise}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Skills</h3>
              <div className="grid grid-cols-2 gap-3">
                {getPersonaSkills(selectedPersona.id).map((skill, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <div className="bg-white p-4 rounded-lg">
                <div className="border-l-4 border-primary pl-3 italic text-gray-600 mb-3">
                  "{getPersonaQuote(selectedPersona.id)}"
                </div>
                <p>{selectedPersona.description}</p>
              </div>
            </div>

            <Button className="w-full py-6 text-lg" onClick={handleStartChat}>
              <MessageSquare className="mr-2 h-5 w-5" />
              Start Chatting
            </Button>
          </div>
        )}

        {(viewMode === "chat" || (viewMode === "history" && selectedConversation)) && selectedPersona && (
          <div
            ref={chatContainerRef}
            className="flex flex-col h-full overflow-y-auto pb-24 pt-2 px-4 bg-opacity-10 bg-gray-100"
          >
            {messages.map((message, index) => {
              const showTimestamp =
                index === 0 || messages[index - 1].timestamp.getTime() - message.timestamp.getTime() > 5 * 60 * 1000

              return (
                <div key={index} className="mb-4">
                  {showTimestamp && (
                    <div className="text-center my-2">
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  )}

                  <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} items-end`}>
                    {message.role === "assistant" && (
                      <Avatar className={`${selectedPersona.color} h-8 w-8 mr-2 mb-1 flex-shrink-0`}>
                        <AvatarFallback>{selectedPersona.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`rounded-2xl py-2 px-3 max-w-[80%] ${
                        message.role === "user"
                          ? "bg-primary text-white rounded-br-none"
                          : "bg-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {message.role === "user" && (
                      <Avatar className="h-8 w-8 ml-2 mb-1 bg-gray-300 flex-shrink-0">
                        <AvatarFallback>
                          <UserAvatar />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              )
            })}

            {isLoading && (
              <div className="flex justify-start items-end mb-4">
                <Avatar className={`${selectedPersona.color} h-8 w-8 mr-2 mb-1`}>
                  <AvatarFallback>{selectedPersona.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="bg-gray-200 rounded-2xl rounded-bl-none py-2 px-4">
                  <div className="flex space-x-2">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Token usage display */}
      {(viewMode === "chat" || viewMode === "history") && (
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 px-4 py-1 flex justify-between items-center text-xs text-gray-500 z-10">
          <span>Tokens used: {tokenUsage}</span>
          <span>Remaining: {tokenCount}</span>
        </div>
      )}

      {/* Sticky Footer Input */}
      {viewMode === "chat" && selectedPersona && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 pb-4 z-20">
          <div className="flex items-center gap-2 mx-2">
            <Button variant="ghost" size="icon" className="rounded-full text-gray-500">
              <Paperclip className="h-5 w-5" />
            </Button>

            <div className="relative flex-1">
              <Input
                ref={inputRef}
                placeholder={tokenCount <= 0 ? "Token limit reached" : `Message ${selectedPersona.name}...`}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                disabled={isLoading || tokenCount <= 0}
                className="pr-10 rounded-full bg-gray-100 border-gray-200 focus:bg-white"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full text-gray-500"
                disabled={isLoading || tokenCount <= 0}
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading || tokenCount <= 0}
              size="icon"
              className="rounded-full bg-primary hover:bg-primary/90 text-white"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Persona Dialog */}
      <Dialog open={createPersonaOpen} onOpenChange={setCreatePersonaOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Your Persona</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newPersona.name}
                onChange={(e) => setNewPersona({ ...newPersona, name: e.target.value })}
                className="col-span-3"
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newPersona.title}
                onChange={(e) => setNewPersona({ ...newPersona, title: e.target.value })}
                className="col-span-3"
                placeholder="Professional Title"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Theme Color
              </Label>
              <div className="col-span-3 flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <div
                    key={color.value}
                    className={`${color.value} w-8 h-8 rounded-full cursor-pointer ${
                      newPersona.color === color.value ? "ring-2 ring-primary ring-offset-2" : ""
                    }`}
                    onClick={() => setNewPersona({ ...newPersona, color: color.value })}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={newPersona.description}
                onChange={(e) => setNewPersona({ ...newPersona, description: e.target.value })}
                className="col-span-3"
                placeholder="Describe what this persona does"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tone" className="text-right">
                Persona Style
              </Label>
              <Textarea
                id="tone"
                value={newPersona.systemPrompt}
                onChange={(e) => setNewPersona({ ...newPersona, systemPrompt: e.target.value })}
                className="col-span-3"
                placeholder="Describe how this persona should speak, their expertise, and behavior (don't include their name or title here)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreatePersonaOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCreatePersona}>
              <Save className="mr-2 h-4 w-4" />
              Save Persona
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Persona Dialog */}
      <Dialog open={editPersonaOpen} onOpenChange={setEditPersonaOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Your Persona</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={editingPersona?.name || ""}
                onChange={(e) => setEditingPersona((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                className="col-span-3"
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">
                Title
              </Label>
              <Input
                id="edit-title"
                value={editingPersona?.title || ""}
                onChange={(e) => setEditingPersona((prev) => (prev ? { ...prev, title: e.target.value } : null))}
                className="col-span-3"
                placeholder="Professional Title"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-color" className="text-right">
                Theme Color
              </Label>
              <div className="col-span-3 flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <div
                    key={color.value}
                    className={`${color.value} w-8 h-8 rounded-full cursor-pointer ${
                      editingPersona?.color === color.value ? "ring-2 ring-primary ring-offset-2" : ""
                    }`}
                    onClick={() => setEditingPersona((prev) => (prev ? { ...prev, color: color.value } : null))}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-visibility" className="text-right">
                Visibility
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Switch
                  id="edit-visibility"
                  checked={editingPersona?.visible !== false}
                  onCheckedChange={(checked) =>
                    setEditingPersona((prev) => (prev ? { ...prev, visible: checked } : null))
                  }
                />
                <Label htmlFor="edit-visibility">
                  {editingPersona?.visible === false ? "Hidden from All Personas" : "Visible in All Personas"}
                </Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={editingPersona?.description || ""}
                onChange={(e) => setEditingPersona((prev) => (prev ? { ...prev, description: e.target.value } : null))}
                className="col-span-3"
                placeholder="Describe what this persona does"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-tone" className="text-right">
                Persona Style
              </Label>
              <Textarea
                id="edit-tone"
                value={editingPersona?.systemPrompt || ""}
                onChange={(e) => setEditingPersona((prev) => (prev ? { ...prev, systemPrompt: e.target.value } : null))}
                className="col-span-3"
                placeholder="Describe how this persona should speak, their expertise, and behavior"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditPersonaOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleEditPersona}>
              <Save className="mr-2 h-4 w-4" />
              Update Persona
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this conversation? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteConversation}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

