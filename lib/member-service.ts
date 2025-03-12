import { ref, push, set, get, update, remove } from "firebase/database"
import { database } from "./firebase"

interface MemberData {
  name: string
  initials: string
  rank: string
  phone: string
  joinDate: string
  email?: string
  teamSize?: number
  earnings?: string
  location?: string
  avatar?: string
  uplineId?: string // ID of the sponsor who recruited this member
}

// Add a new member
export async function addMember(userId: string, memberData: MemberData): Promise<string> {
  try {
    // Generate initials if not provided
    if (!memberData.initials && memberData.name) {
      const nameParts = memberData.name.split(" ")
      if (nameParts.length > 1) {
        memberData.initials = (nameParts[0][0] + nameParts[1][0]).toUpperCase()
      } else {
        memberData.initials = nameParts[0].substring(0, 2).toUpperCase()
      }
    }

    // Add uplineId (the current user)
    memberData.uplineId = userId

    // Add joinDate if not provided
    if (!memberData.joinDate) {
      memberData.joinDate = new Date().toISOString().split("T")[0]
    }

    // Create new member in database
    const membersRef = ref(database, "members")
    const newMemberRef = push(membersRef)

    await set(newMemberRef, memberData)

    // Update user's team size
    const userRef = ref(database, `users/${userId}/team`)
    const userTeamSnapshot = await get(userRef)

    if (userTeamSnapshot.exists()) {
      const teamData = userTeamSnapshot.val()
      await update(userRef, {
        size: (teamData.size || 0) + 1,
        directRecruits: (teamData.directRecruits || 0) + 1,
        activeMembers: (teamData.activeMembers || 0) + 1,
      })
    } else {
      await set(userRef, {
        size: 1,
        directRecruits: 1,
        activeMembers: 1,
      })
    }

    return newMemberRef.key || ""
  } catch (error) {
    console.error("Error adding member:", error)
    throw error
  }
}

// Get members recruited by a specific user
export async function getUserMembers(userId: string): Promise<any[]> {
  try {
    const membersRef = ref(database, "members")
    const snapshot = await get(membersRef)

    if (!snapshot.exists()) {
      return []
    }

    const members: any[] = []
    const data = snapshot.val()

    for (const [id, member] of Object.entries(data)) {
      const memberData = member as any
      if (memberData.uplineId === userId) {
        members.push({
          id,
          ...memberData,
        })
      }
    }

    return members
  } catch (error) {
    console.error("Error getting user members:", error)
    return []
  }
}

// Update a member
export async function updateMember(memberId: string, updates: Partial<MemberData>): Promise<boolean> {
  try {
    const memberRef = ref(database, `members/${memberId}`)
    await update(memberRef, updates)
    return true
  } catch (error) {
    console.error("Error updating member:", error)
    return false
  }
}

// Delete a member
export async function deleteMember(memberId: string, uplineId: string): Promise<boolean> {
  try {
    // Get member data before deletion
    const memberRef = ref(database, `members/${memberId}`)
    const snapshot = await get(memberRef)

    if (!snapshot.exists()) {
      return false
    }

    // Delete the member
    await remove(memberRef)

    // Update upline's team size
    const userRef = ref(database, `users/${uplineId}/team`)
    const userTeamSnapshot = await get(userRef)

    if (userTeamSnapshot.exists()) {
      const teamData = userTeamSnapshot.val()
      await update(userRef, {
        size: Math.max(0, (teamData.size || 1) - 1),
        directRecruits: Math.max(0, (teamData.directRecruits || 1) - 1),
        activeMembers: Math.max(0, (teamData.activeMembers || 1) - 1),
      })
    }

    return true
  } catch (error) {
    console.error("Error deleting member:", error)
    return false
  }
}

