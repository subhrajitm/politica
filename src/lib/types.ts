export type WorkHistoryItem = {
  position: string;
  tenure: string;
  contributions: string;
};

export type ElectoralPerformance = {
  election: string;
  year: number;
  votes?: number;
  percentage?: number;
  seats?: number;
  result: 'Won' | 'Lost' | 'Coalition' | 'Opposition';
};

export type SocialMedia = {
  twitter?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  website?: string;
};

export type PoliticalParty = {
  id: string;
  name: string;
  nameLocal?: string;
  countryCode: string;
  countryName: string;
  ideology?: string;
  politicalPosition?: string;
  foundedYear?: number;
  currentLeader?: string;
  headquarters?: string;
  website?: string;
  logoUrl?: string;
  description?: string;
  membershipCount?: number;
  isRulingParty: boolean;
  isParliamentary: boolean;
  isRegional: boolean;
  regionState?: string;
  electoralPerformance?: ElectoralPerformance[];
  socialMedia?: SocialMedia;
  createdAt: string;
  updatedAt: string;
};

export type PartyAffiliation = {
  id: string;
  politicianId: string;
  partyId: string;
  positionInParty?: string;
  joinedDate?: string;
  leftDate?: string;
  isCurrent: boolean;
  createdAt: string;
};

export type Politician = {
  id: string;
  name: {
    fullName: string;
    aliases?: string[];
  };
  personalDetails: {
    dateOfBirth: string;
    placeOfBirth: string;
    gender: string;
    nationality: string;
    languages: string[];
  };
  contact: {
    address: string;
    email: string;
    phone: string;
    website?: string;
  };
  photoUrl: string;
  family: {
    spouse?: string;
    children?: string[];
  };
  education: {
    institution: string;
    degree: string;
    year?: string;
  }[];
  party: string;
  constituency: string;
  positions: {
    current: {
      position: string;
      assumedOffice: string;
      committees?: string[];
    };
    history: WorkHistoryItem[];
  };
  electoralHistory: {
    election: string;
    result: string;
  }[];
  policyStances: {
    issue: string;
    stance: string;
  }[];
  votingRecords: {
    bill: string;
    vote: 'Yea' | 'Nay' | 'Abstain';
    date: string;
  }[];
  legislativeAchievements: {
    achievement: string;
    year: string;
  }[];
  ratings: {
    group: string;
    rating: string;
  }[];
  campaignFinance: {
    totalReceipts: string;
    totalDisbursements: string;
    cashOnHand: string;
    debt: string;
    topContributors: { name: string; amount: string }[];
  };
  relationships: {
    name: string;
    type: 'Political' | 'Corporate' | 'Personal';
    relationship: string;
  }[];
  newsMentions: {
    source: string;
    title: string;
    url: string;
    date: string;
  }[];
  speeches: {
    title: string;
    url: string;
    date: string;
  }[];
  socialMedia: {
    twitter?: string;
    facebook?: string;
  };
};
