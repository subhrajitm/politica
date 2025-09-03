import { supabase } from './supabase'
import type { Database } from './supabase'
import type { Politician } from './types'

type PoliticianRow = Database['public']['Tables']['politicians']['Row']
type WorkHistoryRow = Database['public']['Tables']['work_history']['Row']
type EducationRow = Database['public']['Tables']['education']['Row']
type ElectoralHistoryRow = Database['public']['Tables']['electoral_history']['Row']
type PolicyStanceRow = Database['public']['Tables']['policy_stances']['Row']
type VotingRecordRow = Database['public']['Tables']['voting_records']['Row']
type LegislativeAchievementRow = Database['public']['Tables']['legislative_achievements']['Row']
type RatingRow = Database['public']['Tables']['ratings']['Row']
type CampaignFinanceRow = Database['public']['Tables']['campaign_finance']['Row']
type RelationshipRow = Database['public']['Tables']['relationships']['Row']
type NewsMentionRow = Database['public']['Tables']['news_mentions']['Row']
type SpeechRow = Database['public']['Tables']['speeches']['Row']
type SocialMediaRow = Database['public']['Tables']['social_media']['Row']

export class PoliticianService {
  // Get all politicians
  static async getAllPoliticians(): Promise<Politician[]> {
    try {
      const { data: politicians, error } = await supabase
        .from('politicians')
        .select('*')
        .order('full_name')

      if (error) throw error

      const politiciansWithDetails = await Promise.all(
        politicians.map(async (politician) => {
          return await this.getPoliticianWithDetails(politician.id)
        })
      )

      return politiciansWithDetails
    } catch (error) {
      console.error('Error fetching politicians:', error)
      throw error
    }
  }

  // Get a single politician by ID with all related data
  static async getPoliticianById(id: string): Promise<Politician | null> {
    try {
      const { data: politician, error } = await supabase
        .from('politicians')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      if (!politician) return null

      return await this.getPoliticianWithDetails(id)
    } catch (error) {
      console.error('Error fetching politician:', error)
      throw error
    }
  }

  // Get politician with all related data
  private static async getPoliticianWithDetails(id: string): Promise<Politician> {
    const [
      { data: politician },
      { data: workHistory },
      { data: education },
      { data: electoralHistory },
      { data: policyStances },
      { data: votingRecords },
      { data: legislativeAchievements },
      { data: ratings },
      { data: campaignFinance },
      { data: relationships },
      { data: newsMentions },
      { data: speeches },
      { data: socialMedia }
    ] = await Promise.all([
      supabase.from('politicians').select('*').eq('id', id).single(),
      supabase.from('work_history').select('*').eq('politician_id', id),
      supabase.from('education').select('*').eq('politician_id', id),
      supabase.from('electoral_history').select('*').eq('politician_id', id),
      supabase.from('policy_stances').select('*').eq('politician_id', id),
      supabase.from('voting_records').select('*').eq('politician_id', id),
      supabase.from('legislative_achievements').select('*').eq('politician_id', id),
      supabase.from('ratings').select('*').eq('politician_id', id),
      supabase.from('campaign_finance').select('*').eq('politician_id', id),
      supabase.from('relationships').select('*').eq('politician_id', id),
      supabase.from('news_mentions').select('*').eq('politician_id', id),
      supabase.from('speeches').select('*').eq('politician_id', id),
      supabase.from('social_media').select('*').eq('politician_id', id)
    ])

    if (!politician) throw new Error('Politician not found')

    return {
      id: politician.id,
      name: {
        fullName: politician.full_name,
        aliases: politician.aliases || undefined
      },
      personalDetails: {
        dateOfBirth: politician.date_of_birth,
        placeOfBirth: politician.place_of_birth,
        gender: politician.gender,
        nationality: politician.nationality,
        languages: politician.languages
      },
      contact: {
        address: politician.address,
        email: politician.email,
        phone: politician.phone,
        website: politician.website || undefined
      },
      photoUrl: politician.photo_url,
      family: {
        spouse: politician.spouse || undefined,
        children: politician.children || undefined
      },
      education: education?.map(edu => ({
        institution: edu.institution,
        degree: edu.degree,
        year: edu.year || undefined
      })) || [],
      party: politician.party,
      constituency: politician.constituency,
      positions: {
        current: {
          position: politician.current_position,
          assumedOffice: politician.assumed_office,
          committees: politician.committees || undefined
        },
        history: workHistory?.map(work => ({
          position: work.position,
          tenure: work.tenure,
          contributions: work.contributions
        })) || []
      },
      electoralHistory: electoralHistory?.map(electoral => ({
        election: electoral.election,
        result: electoral.result
      })) || [],
      policyStances: policyStances?.map(policy => ({
        issue: policy.issue,
        stance: policy.stance
      })) || [],
      votingRecords: votingRecords?.map(vote => ({
        bill: vote.bill,
        vote: vote.vote,
        date: vote.date
      })) || [],
      legislativeAchievements: legislativeAchievements?.map(achievement => ({
        achievement: achievement.achievement,
        year: achievement.year
      })) || [],
      ratings: ratings?.map(rating => ({
        group: rating.group,
        rating: rating.rating
      })) || [],
      campaignFinance: {
        totalReceipts: campaignFinance?.[0]?.total_receipts || 'N/A',
        totalDisbursements: campaignFinance?.[0]?.total_disbursements || 'N/A',
        cashOnHand: campaignFinance?.[0]?.cash_on_hand || 'N/A',
        debt: campaignFinance?.[0]?.debt || 'N/A',
        topContributors: [] // This would need a separate table
      },
      relationships: relationships?.map(rel => ({
        name: rel.name,
        type: rel.type,
        relationship: rel.relationship
      })) || [],
      newsMentions: newsMentions?.map(news => ({
        source: news.source,
        title: news.title,
        url: news.url,
        date: news.date
      })) || [],
      speeches: speeches?.map(speech => ({
        title: speech.title,
        url: speech.url,
        date: speech.date
      })) || [],
      socialMedia: {
        twitter: socialMedia?.[0]?.twitter || undefined,
        facebook: socialMedia?.[0]?.facebook || undefined
      }
    }
  }

  // Create a new politician
  static async createPolitician(politicianData: Omit<Politician, 'id'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('politicians')
        .insert({
          full_name: politicianData.name.fullName,
          aliases: politicianData.name.aliases,
          date_of_birth: politicianData.personalDetails.dateOfBirth,
          place_of_birth: politicianData.personalDetails.placeOfBirth,
          gender: politicianData.personalDetails.gender,
          nationality: politicianData.personalDetails.nationality,
          languages: politicianData.personalDetails.languages,
          address: politicianData.contact.address,
          email: politicianData.contact.email,
          phone: politicianData.contact.phone,
          website: politicianData.contact.website,
          photo_url: politicianData.photoUrl,
          spouse: politicianData.family.spouse,
          children: politicianData.family.children,
          party: politicianData.party,
          constituency: politicianData.constituency,
          current_position: politicianData.positions.current.position,
          assumed_office: politicianData.positions.current.assumedOffice,
          committees: politicianData.positions.current.committees
        })
        .select('id')
        .single()

      if (error) throw error

      // Insert related data
      await this.insertRelatedData(data.id, politicianData)

      return data.id
    } catch (error) {
      console.error('Error creating politician:', error)
      throw error
    }
  }

  // Update a politician
  static async updatePolitician(id: string, updates: Partial<Politician>): Promise<void> {
    try {
      const updateData: any = {}
      
      if (updates.name?.fullName) updateData.full_name = updates.name.fullName
      if (updates.name?.aliases) updateData.aliases = updates.name.aliases
      if (updates.personalDetails) {
        if (updates.personalDetails.dateOfBirth) updateData.date_of_birth = updates.personalDetails.dateOfBirth
        if (updates.personalDetails.placeOfBirth) updateData.place_of_birth = updates.personalDetails.placeOfBirth
        if (updates.personalDetails.gender) updateData.gender = updates.personalDetails.gender
        if (updates.personalDetails.nationality) updateData.nationality = updates.personalDetails.nationality
        if (updates.personalDetails.languages) updateData.languages = updates.personalDetails.languages
      }
      if (updates.contact) {
        if (updates.contact.address) updateData.address = updates.contact.address
        if (updates.contact.email) updateData.email = updates.contact.email
        if (updates.contact.phone) updateData.phone = updates.contact.phone
        if (updates.contact.website !== undefined) updateData.website = updates.contact.website
      }
      if (updates.photoUrl) updateData.photo_url = updates.photoUrl
      if (updates.family) {
        if (updates.family.spouse !== undefined) updateData.spouse = updates.family.spouse
        if (updates.family.children !== undefined) updateData.children = updates.family.children
      }
      if (updates.party) updateData.party = updates.party
      if (updates.constituency) updateData.constituency = updates.constituency
      if (updates.positions?.current) {
        if (updates.positions.current.position) updateData.current_position = updates.positions.current.position
        if (updates.positions.current.assumedOffice) updateData.assumed_office = updates.positions.current.assumedOffice
        if (updates.positions.current.committees !== undefined) updateData.committees = updates.positions.current.committees
      }

      updateData.updated_at = new Date().toISOString()

      const { error } = await supabase
        .from('politicians')
        .update(updateData)
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error updating politician:', error)
      throw error
    }
  }

  // Delete a politician
  static async deletePolitician(id: string): Promise<void> {
    try {
      // Delete related data first
      await Promise.all([
        supabase.from('work_history').delete().eq('politician_id', id),
        supabase.from('education').delete().eq('politician_id', id),
        supabase.from('electoral_history').delete().eq('politician_id', id),
        supabase.from('policy_stances').delete().eq('politician_id', id),
        supabase.from('voting_records').delete().eq('politician_id', id),
        supabase.from('legislative_achievements').delete().eq('politician_id', id),
        supabase.from('ratings').delete().eq('politician_id', id),
        supabase.from('campaign_finance').delete().eq('politician_id', id),
        supabase.from('relationships').delete().eq('politician_id', id),
        supabase.from('news_mentions').delete().eq('politician_id', id),
        supabase.from('speeches').delete().eq('politician_id', id),
        supabase.from('social_media').delete().eq('politician_id', id)
      ])

      // Delete the politician
      const { error } = await supabase
        .from('politicians')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting politician:', error)
      throw error
    }
  }

  // Insert related data for a politician
  private static async insertRelatedData(politicianId: string, politicianData: Omit<Politician, 'id'>): Promise<void> {
    try {
      // Insert work history
      if (politicianData.positions.history.length > 0) {
        const workHistoryData = politicianData.positions.history.map(work => ({
          politician_id: politicianId,
          position: work.position,
          tenure: work.tenure,
          contributions: work.contributions
        }))
        await supabase.from('work_history').insert(workHistoryData)
      }

      // Insert education
      if (politicianData.education.length > 0) {
        const educationData = politicianData.education.map(edu => ({
          politician_id: politicianId,
          institution: edu.institution,
          degree: edu.degree,
          year: edu.year
        }))
        await supabase.from('education').insert(educationData)
      }

      // Insert electoral history
      if (politicianData.electoralHistory.length > 0) {
        const electoralData = politicianData.electoralHistory.map(electoral => ({
          politician_id: politicianId,
          election: electoral.election,
          result: electoral.result
        }))
        await supabase.from('electoral_history').insert(electoralData)
      }

      // Insert policy stances
      if (politicianData.policyStances.length > 0) {
        const policyData = politicianData.policyStances.map(policy => ({
          politician_id: politicianId,
          issue: policy.issue,
          stance: policy.stance
        }))
        await supabase.from('policy_stances').insert(policyData)
      }

      // Insert voting records
      if (politicianData.votingRecords.length > 0) {
        const votingData = politicianData.votingRecords.map(vote => ({
          politician_id: politicianId,
          bill: vote.bill,
          vote: vote.vote,
          date: vote.date
        }))
        await supabase.from('voting_records').insert(votingData)
      }

      // Insert legislative achievements
      if (politicianData.legislativeAchievements.length > 0) {
        const achievementData = politicianData.legislativeAchievements.map(achievement => ({
          politician_id: politicianId,
          achievement: achievement.achievement,
          year: achievement.year
        }))
        await supabase.from('legislative_achievements').insert(achievementData)
      }

      // Insert ratings
      if (politicianData.ratings.length > 0) {
        const ratingData = politicianData.ratings.map(rating => ({
          politician_id: politicianId,
          group: rating.group,
          rating: rating.rating
        }))
        await supabase.from('ratings').insert(ratingData)
      }

      // Insert campaign finance
      if (politicianData.campaignFinance) {
        await supabase.from('campaign_finance').insert({
          politician_id: politicianId,
          total_receipts: politicianData.campaignFinance.totalReceipts,
          total_disbursements: politicianData.campaignFinance.totalDisbursements,
          cash_on_hand: politicianData.campaignFinance.cashOnHand,
          debt: politicianData.campaignFinance.debt
        })
      }

      // Insert relationships
      if (politicianData.relationships.length > 0) {
        const relationshipData = politicianData.relationships.map(rel => ({
          politician_id: politicianId,
          name: rel.name,
          type: rel.type,
          relationship: rel.relationship
        }))
        await supabase.from('relationships').insert(relationshipData)
      }

      // Insert news mentions
      if (politicianData.newsMentions.length > 0) {
        const newsData = politicianData.newsMentions.map(news => ({
          politician_id: politicianId,
          source: news.source,
          title: news.title,
          url: news.url,
          date: news.date
        }))
        await supabase.from('news_mentions').insert(newsData)
      }

      // Insert speeches
      if (politicianData.speeches.length > 0) {
        const speechData = politicianData.speeches.map(speech => ({
          politician_id: politicianId,
          title: speech.title,
          url: speech.url,
          date: speech.date
        }))
        await supabase.from('speeches').insert(speechData)
      }

      // Insert social media
      if (politicianData.socialMedia.twitter || politicianData.socialMedia.facebook) {
        await supabase.from('social_media').insert({
          politician_id: politicianId,
          twitter: politicianData.socialMedia.twitter,
          facebook: politicianData.socialMedia.facebook
        })
      }
    } catch (error) {
      console.error('Error inserting related data:', error)
      throw error
    }
  }

  // Search politicians
  static async searchPoliticians(query: string): Promise<Politician[]> {
    try {
      const { data, error } = await supabase
        .from('politicians')
        .select('*')
        .or(`full_name.ilike.%${query}%,party.ilike.%${query}%,constituency.ilike.%${query}%`)
        .order('full_name')

      if (error) throw error

      const politiciansWithDetails = await Promise.all(
        data.map(async (politician) => {
          return await this.getPoliticianWithDetails(politician.id)
        })
      )

      return politiciansWithDetails
    } catch (error) {
      console.error('Error searching politicians:', error)
      throw error
    }
  }

  // Get politicians by party
  static async getPoliticiansByParty(party: string): Promise<Politician[]> {
    try {
      const { data, error } = await supabase
        .from('politicians')
        .select('*')
        .eq('party', party)
        .order('full_name')

      if (error) throw error

      const politiciansWithDetails = await Promise.all(
        data.map(async (politician) => {
          return await this.getPoliticianWithDetails(politician.id)
        })
      )

      return politiciansWithDetails
    } catch (error) {
      console.error('Error fetching politicians by party:', error)
      throw error
    }
  }
}
