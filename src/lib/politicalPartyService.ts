import { supabase } from './supabase';
import { PoliticalParty, PartyAffiliation, ElectoralPerformance, SocialMedia } from './types';

export class PoliticalPartyService {
  // Get all political parties
  static async getAllParties(): Promise<PoliticalParty[]> {
    try {
      const { data, error } = await supabase
        .from('political_parties')
        .select('*')
        .order('country_name', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data?.map(this.mapToPoliticalParty) || [];
    } catch (error) {
      console.error('Error fetching political parties:', error);
      throw error;
    }
  }

  // Get parties by country
  static async getPartiesByCountry(countryCode: string): Promise<PoliticalParty[]> {
    try {
      const { data, error } = await supabase
        .from('political_parties')
        .select('*')
        .eq('country_code', countryCode)
        .order('name', { ascending: true });

      if (error) throw error;
      return data?.map(this.mapToPoliticalParty) || [];
    } catch (error) {
      console.error('Error fetching parties by country:', error);
      throw error;
    }
  }

  // Get party by ID (optimized with better error handling)
  static async getPartyById(id: string): Promise<PoliticalParty | null> {
    try {
      console.log('Fetching party by ID:', id);
      
      // Validate ID format (should be UUID)
      if (!id || typeof id !== 'string' || id.length < 10) {
        console.error('Invalid party ID format:', id);
        return null;
      }

      const { data, error } = await supabase
        .from('political_parties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error fetching party:', error);
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }

      if (!data) {
        console.log('No party found with ID:', id);
        return null;
      }

      console.log('Successfully fetched party:', data.name);
      return this.mapToPoliticalParty(data);
    } catch (error) {
      console.error('Error fetching party by ID:', error);
      throw error;
    }
  }

  // Search parties
  static async searchParties(query: string, countryCode?: string): Promise<PoliticalParty[]> {
    try {
      let queryBuilder = supabase
        .from('political_parties')
        .select('*')
        .or(`name.ilike.%${query}%,name_local.ilike.%${query}%,ideology.ilike.%${query}%`);

      if (countryCode) {
        queryBuilder = queryBuilder.eq('country_code', countryCode);
      }

      const { data, error } = await queryBuilder
        .order('country_name', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data?.map(this.mapToPoliticalParty) || [];
    } catch (error) {
      console.error('Error searching parties:', error);
      throw error;
    }
  }

  // Get ruling parties
  static async getRulingParties(): Promise<PoliticalParty[]> {
    try {
      const { data, error } = await supabase
        .from('political_parties')
        .select('*')
        .eq('is_ruling_party', true)
        .order('country_name', { ascending: true });

      if (error) throw error;
      return data?.map(this.mapToPoliticalParty) || [];
    } catch (error) {
      console.error('Error fetching ruling parties:', error);
      throw error;
    }
  }

  // Get parliamentary parties
  static async getParliamentaryParties(): Promise<PoliticalParty[]> {
    try {
      const { data, error } = await supabase
        .from('political_parties')
        .select('*')
        .eq('is_parliamentary', true)
        .order('country_name', { ascending: true });

      if (error) throw error;
      return data?.map(this.mapToPoliticalParty) || [];
    } catch (error) {
      console.error('Error fetching parliamentary parties:', error);
      throw error;
    }
  }

  // Create new party
  static async createParty(party: Omit<PoliticalParty, 'id' | 'createdAt' | 'updatedAt'>): Promise<PoliticalParty> {
    try {
      const { data, error } = await supabase
        .from('political_parties')
        .insert([this.mapFromPoliticalParty(party)])
        .select()
        .single();

      if (error) throw error;
      return this.mapToPoliticalParty(data);
    } catch (error) {
      console.error('Error creating party:', error);
      throw error;
    }
  }

  // Update party
  static async updateParty(id: string, updates: Partial<PoliticalParty>): Promise<PoliticalParty> {
    try {
      const { data, error } = await supabase
        .from('political_parties')
        .update(this.mapFromPoliticalParty(updates))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.mapToPoliticalParty(data);
    } catch (error) {
      console.error('Error updating party:', error);
      throw error;
    }
  }

  // Delete party
  static async deleteParty(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('political_parties')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting party:', error);
      throw error;
    }
  }

  // Get party affiliations for a politician
  static async getPartyAffiliations(politicianId: string): Promise<PartyAffiliation[]> {
    try {
      const { data, error } = await supabase
        .from('party_affiliations')
        .select('*')
        .eq('politician_id', politicianId)
        .order('is_current', { ascending: false })
        .order('joined_date', { ascending: false });

      if (error) throw error;
      return data?.map(this.mapToPartyAffiliation) || [];
    } catch (error) {
      console.error('Error fetching party affiliations:', error);
      throw error;
    }
  }

  // Create party affiliation
  static async createPartyAffiliation(affiliation: Omit<PartyAffiliation, 'id' | 'createdAt'>): Promise<PartyAffiliation> {
    try {
      const { data, error } = await supabase
        .from('party_affiliations')
        .insert([this.mapFromPartyAffiliation(affiliation)])
        .select()
        .single();

      if (error) throw error;
      return this.mapToPartyAffiliation(data);
    } catch (error) {
      console.error('Error creating party affiliation:', error);
      throw error;
    }
  }

  // Update party affiliation
  static async updatePartyAffiliation(id: string, updates: Partial<PartyAffiliation>): Promise<PartyAffiliation> {
    try {
      const { data, error } = await supabase
        .from('party_affiliations')
        .update(this.mapFromPartyAffiliation(updates))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.mapToPartyAffiliation(data);
    } catch (error) {
      console.error('Error updating party affiliation:', error);
      throw error;
    }
  }

  // Delete party affiliation
  static async deletePartyAffiliation(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('party_affiliations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting party affiliation:', error);
      throw error;
    }
  }

  // Get parties with politician counts
  static async getPartiesWithCounts(): Promise<(PoliticalParty & { politicianCount: number })[]> {
    try {
      const { data, error } = await supabase
        .from('political_parties')
        .select(`
          *,
          party_affiliations!inner(count)
        `)
        .eq('party_affiliations.is_current', true);

      if (error) throw error;
      return data?.map(party => ({
        ...this.mapToPoliticalParty(party),
        politicianCount: party.party_affiliations?.[0]?.count || 0
      })) || [];
    } catch (error) {
      console.error('Error fetching parties with counts:', error);
      throw error;
    }
  }

  // Bulk import parties (with upsert functionality)
  static async bulkImportParties(parties: Omit<PoliticalParty, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<PoliticalParty[]> {
    try {
      console.log('Starting bulk import of', parties.length, 'parties');
      
      // Validate input
      if (!parties || parties.length === 0) {
        throw new Error('No parties provided for import');
      }

      const results: PoliticalParty[] = [];
      const errors: string[] = [];

      // Process each party individually to handle duplicates gracefully
      for (const party of parties) {
        try {
          const mapped = this.mapFromPoliticalParty(party);
          console.log('Processing party:', party.name, 'in', party.countryCode);

          // Try to insert the party with timeout
          const insertPromise = supabase
            .from('political_parties')
            .insert([mapped])
            .select()
            .single();

          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database operation timed out after 10 seconds')), 10000)
          );

          const { data, error } = await Promise.race([insertPromise, timeoutPromise]) as any;

          if (error) {
            // If it's a duplicate key error, try to update instead
            if (error.code === '23505' && error.message.includes('political_parties_name_country_code_key')) {
              console.log('Party already exists, updating:', party.name, 'in', party.countryCode);
              
              const updatePromise = supabase
                .from('political_parties')
                .update(mapped)
                .eq('name', party.name)
                .eq('country_code', party.countryCode)
                .select()
                .single();

              const updateTimeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Update operation timed out after 10 seconds')), 10000)
              );

              const { data: updateData, error: updateError } = await Promise.race([updatePromise, updateTimeoutPromise]) as any;

              if (updateError) {
                console.error('Error updating party:', party.name, updateError);
                errors.push(`Failed to update ${party.name}: ${updateError.message}`);
              } else {
                results.push(this.mapToPoliticalParty(updateData));
                console.log('Successfully updated party:', party.name);
              }
            } else {
              console.error('Error inserting party:', party.name, error);
              errors.push(`Failed to insert ${party.name}: ${error.message}`);
            }
          } else {
            results.push(this.mapToPoliticalParty(data));
            console.log('Successfully inserted party:', party.name);
          }
        } catch (partyError) {
          console.error('Error processing party:', party.name, partyError);
          errors.push(`Failed to process ${party.name}: ${partyError instanceof Error ? partyError.message : 'Unknown error'}`);
        }
      }

      console.log('Bulk import completed:', results.length, 'successful,', errors.length, 'errors');
      
      if (errors.length > 0) {
        console.warn('Import errors:', errors);
        // Don't throw error if some parties were successfully imported
        if (results.length === 0) {
          throw new Error(`All parties failed to import. Errors: ${errors.join('; ')}`);
        }
      }

      return results;
    } catch (error) {
      console.error('Error bulk importing parties:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      throw error;
    }
  }

  // Helper methods for data transformation
  private static mapToPoliticalParty(data: any): PoliticalParty {
    return {
      id: data.id,
      name: data.name,
      nameLocal: data.name_local,
      countryCode: data.country_code,
      countryName: data.country_name,
      ideology: data.ideology,
      politicalPosition: data.political_position,
      foundedYear: data.founded_year,
      currentLeader: data.current_leader,
      headquarters: data.headquarters,
      website: data.website,
      logoUrl: data.logo_url,
      description: data.description,
      membershipCount: data.membership_count,
      isRulingParty: data.is_ruling_party,
      isParliamentary: data.is_parliamentary,
      isRegional: data.is_regional,
      regionState: data.region_state,
      electoralPerformance: data.electoral_performance,
      socialMedia: data.social_media,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private static mapFromPoliticalParty(party: Partial<PoliticalParty>): any {
    return {
      name: party.name,
      name_local: party.nameLocal,
      country_code: party.countryCode,
      country_name: party.countryName,
      ideology: party.ideology,
      political_position: party.politicalPosition,
      founded_year: party.foundedYear,
      current_leader: party.currentLeader,
      headquarters: party.headquarters,
      website: party.website,
      logo_url: party.logoUrl,
      description: party.description,
      membership_count: party.membershipCount,
      is_ruling_party: party.isRulingParty,
      is_parliamentary: party.isParliamentary,
      is_regional: party.isRegional,
      region_state: party.regionState,
      electoral_performance: party.electoralPerformance,
      social_media: party.socialMedia,
    };
  }

  private static mapToPartyAffiliation(data: any): PartyAffiliation {
    return {
      id: data.id,
      politicianId: data.politician_id,
      partyId: data.party_id,
      positionInParty: data.position_in_party,
      joinedDate: data.joined_date,
      leftDate: data.left_date,
      isCurrent: data.is_current,
      createdAt: data.created_at,
    };
  }

  private static mapFromPartyAffiliation(affiliation: Partial<PartyAffiliation>): any {
    return {
      politician_id: affiliation.politicianId,
      party_id: affiliation.partyId,
      position_in_party: affiliation.positionInParty,
      joined_date: affiliation.joinedDate,
      left_date: affiliation.leftDate,
      is_current: affiliation.isCurrent,
    };
  }
}
