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
  socialMedia: {
    twitter?: string;
    facebook?: string;
  };
};

export const politicians: Politician[] = [
  {
    id: 'narendra-modi',
    name: {
      fullName: 'Narendra Damodardas Modi',
    },
    personalDetails: {
      dateOfBirth: '1950-09-17',
      placeOfBirth: 'Vadnagar, Bombay State, India',
      gender: 'Male',
      nationality: 'Indian',
      languages: ['Gujarati', 'Hindi', 'English'],
    },
    contact: {
      address: '7, Lok Kalyan Marg, New Delhi',
      email: 'n.modi@sansad.nic.in',
      phone: '+91-11-23012312',
    },
    photoUrl: 'https://picsum.photos/seed/nmodi/400/400',
    family: {
      spouse: 'Jashodaben Modi',
    },
    education: [
      {
        institution: 'Gujarat University',
        degree: 'M.A. in Political Science',
        year: '1983',
      },
      {
        institution: 'University of Delhi',
        degree: 'B.A. in Political Science',
        year: '1978',
      },
    ],
    party: 'Bharatiya Janata Party',
    constituency: 'Varanasi, Uttar Pradesh',
    positions: {
      current: {
        position: 'Prime Minister of India',
        assumedOffice: '2014-05-26',
      },
      history: [
        {
          position: 'Chief Minister of Gujarat',
          tenure: '2001 - 2014',
          contributions:
            'Oversaw significant economic growth and infrastructure development. Initiated the Vibrant Gujarat summit.',
        },
        {
          position: 'Member of Parliament, Lok Sabha',
          tenure: '2014 - Present',
          contributions:
            'Led initiatives like Swachh Bharat Abhiyan, Make in India, and the Goods and Services Tax (GST) reform.',
        },
      ],
    },
    electoralHistory: [
        { election: '2019 General Election', result: 'Won from Varanasi'},
        { election: '2014 General Election', result: 'Won from Varanasi and Vadodara'},
    ],
    policyStances: [
        { issue: 'Economy', stance: 'Focus on liberalization, foreign investment, and privatization.' },
        { issue: 'Foreign Policy', stance: 'Proactive "Neighborhood First" policy and strengthened ties with major world powers.' },
    ],
    socialMedia: {
      twitter: 'https://twitter.com/narendramodi',
      facebook: 'https://www.facebook.com/narendramodi'
    }
  },
  {
    id: 'rahul-gandhi',
    name: {
      fullName: 'Rahul Gandhi',
    },
    personalDetails: {
      dateOfBirth: '1970-06-19',
      placeOfBirth: 'New Delhi, India',
      gender: 'Male',
      nationality: 'Indian',
      languages: ['Hindi', 'English'],
    },
    contact: {
      address: '12, Tughlak Lane, New Delhi',
      email: 'r.gandhi@sansad.nic.in',
      phone: '+91-11-23012313',
    },
    photoUrl: 'https://picsum.photos/seed/rgandhi/400/400',
    family: {},
    education: [
      {
        institution: 'Trinity College, Cambridge',
        degree: 'M.Phil. in Development Studies',
        year: '1995',
      },
      {
        institution: 'Rollins College, Florida',
        degree: 'B.A.',
        year: '1994',
      },
    ],
    party: 'Indian National Congress',
    constituency: 'Raebareli, Uttar Pradesh',
    positions: {
      current: {
        position: 'Member of Parliament, Lok Sabha',
        assumedOffice: '2024-06-04',
      },
      history: [
        {
          position: 'President of the Indian National Congress',
          tenure: '2017 - 2019',
          contributions:
            'Led the party during the 2019 general elections. Focused on social welfare schemes and farmers\' rights.',
        },
        {
          position: 'Member of Parliament, Lok Sabha',
          tenure: '2004 - 2024',
          contributions:
            'Represented Amethi and Wayanad constituencies. Actively participated in debates on national security and economic policies.',
        },
      ],
    },
    electoralHistory: [
        { election: '2024 General Election', result: 'Won from Raebareli and Wayanad'},
        { election: '2019 General Election', result: 'Won from Wayanad, Lost from Amethi'},
        { election: '2014 General Election', result: 'Won from Amethi'},
    ],
    policyStances: [
        { issue: 'Social Justice', stance: 'Advocates for wealth redistribution and caste-based census.' },
        { issue: 'Economy', stance: 'Critical of GST implementation, supports welfare programs like NYAY.' },
    ],
     socialMedia: {
      twitter: 'https://twitter.com/RahulGandhi',
      facebook: 'https://www.facebook.com/RahulGandhi'
    }
  },
  {
    id: 'amit-shah',
    name: {
      fullName: 'Amit Anilchandra Shah',
    },
    personalDetails: {
      dateOfBirth: '1964-10-22',
      placeOfBirth: 'Mumbai, Maharashtra, India',
      gender: 'Male',
      nationality: 'Indian',
      languages: ['Gujarati', 'Hindi', 'English'],
    },
    contact: {
      address: '11, Akbar Road, New Delhi',
      email: 'a.shah@sansad.nic.in',
      phone: '+91-11-23092462',
    },
    photoUrl: 'https://picsum.photos/seed/ashah/400/400',
    family: {
        spouse: 'Sonal Shah',
        children: ['Jay Shah']
    },
    education: [
      {
        institution: 'Gujarat University',
        degree: 'B.Sc. in Biochemistry',
      },
    ],
    party: 'Bharatiya Janata Party',
    constituency: 'Gandhinagar, Gujarat',
    positions: {
      current: {
        position: 'Minister of Home Affairs and Minister of Co-operation',
        assumedOffice: '2019-05-31',
      },
      history: [
        {
          position: 'President of the Bharatiya Janata Party',
          tenure: '2014 - 2020',
          contributions:
            'Led the party to major victories in national and state elections. Oversaw significant expansion of the party\'s membership base.',
        },
        {
          position: 'Member of Parliament, Rajya Sabha',
          tenure: '2017 - 2019',
          contributions: 'Represented Gujarat in the upper house of Parliament.',
        },
      ],
    },
    electoralHistory: [
        { election: '2024 General Election', result: 'Won from Gandhinagar'},
        { election: '2019 General Election', result: 'Won from Gandhinagar'},
    ],
    policyStances: [
        { issue: 'National Security', stance: 'Strong stance on internal security, led the abrogation of Article 370.' },
        { issue: 'Citizenship', stance: 'Spearheaded the Citizenship Amendment Act (CAA).'},
    ],
    socialMedia: {
      twitter: 'https://twitter.com/AmitShah',
      facebook: 'https://www.facebook.com/AmitShah.Official'
    }
  },
  {
    id: 'arvind-kejriwal',
    name: {
      fullName: 'Arvind Kejriwal',
    },
    personalDetails: {
      dateOfBirth: '1968-08-16',
      placeOfBirth: 'Siwani, Haryana, India',
      gender: 'Male',
      nationality: 'Indian',
      languages: ['Hindi', 'English'],
    },
    contact: {
      address: 'Chief Minister\'s Office, Delhi Secretariat, New Delhi',
      email: 'cmdelhi@nic.in',
      phone: '+91-11-23392020',
    },
    photoUrl: 'https://picsum.photos/seed/akejriwal/400/400',
    family: {
        spouse: 'Sunita Kejriwal',
        children: ['Harshita Kejriwal', 'Pulkit Kejriwal']
    },
    education: [
      {
        institution: 'IIT Kharagpur',
        degree: 'B.Tech in Mechanical Engineering',
        year: '1989',
      },
    ],
    party: 'Aam Aadmi Party',
    constituency: 'New Delhi',
    positions: {
      current: {
        position: 'Chief Minister of Delhi',
        assumedOffice: '2015-02-14',
      },
      history: [
        {
          position: 'Indian Revenue Service (IRS) Officer',
          tenure: '1995 - 2006',
          contributions:
            'Worked as a Joint Commissioner of Income Tax in New Delhi.',
        },
        {
          position: 'Chief Minister of Delhi (1st term)',
          tenure: '2013-12-28 to 2014-02-14',
          contributions: 'First term as Chief Minister for 49 days.',
        },
      ],
    },
    electoralHistory: [
        { election: '2020 Delhi Assembly', result: 'Won from New Delhi'},
        { election: '2015 Delhi Assembly', result: 'Won from New Delhi'},
    ],
    policyStances: [
        { issue: 'Governance', stance: 'Focus on anti-corruption (Jan Lokpal Bill) and citizen-centric services.' },
        { issue: 'Welfare', stance: 'Implemented free electricity and water schemes, improved public schools and healthcare (Mohalla Clinics).'},
    ],
    socialMedia: {
      twitter: 'https://twitter.com/ArvindKejriwal',
      facebook: 'https://www.facebook.com/AAPkaArvind'
    }
  },
];
