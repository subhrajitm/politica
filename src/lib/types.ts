export type WorkHistoryItem = {
  position: string;
  tenure: string;
  contributions: string;
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
