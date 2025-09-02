export type WorkHistoryItem = {
  position: string;
  tenure: string;
  contributions: string;
};

export type Politician = {
  id: string;
  name: string;
  photoUrl: string;
  constituency: string;
  party: string;
  currentPosition: string;
  contact: {
    email: string;
    phone: string;
  };
  educationalBackground: string;
  workHistory: WorkHistoryItem[];
};

export const politicians: Politician[] = [
  {
    id: 'narendra-modi',
    name: 'Narendra Modi',
    photoUrl: 'https://picsum.photos/400/400',
    constituency: 'Varanasi, Uttar Pradesh',
    party: 'Bharatiya Janata Party',
    currentPosition: 'Prime Minister of India',
    contact: {
      email: 'n.modi@sansad.nic.in',
      phone: '+91-11-23012312',
    },
    educationalBackground: 'M.A. in Political Science',
    workHistory: [
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
  {
    id: 'rahul-gandhi',
    name: 'Rahul Gandhi',
    photoUrl: 'https://picsum.photos/400/400',
    constituency: 'Wayanad, Kerala',
    party: 'Indian National Congress',
    currentPosition: 'Member of Parliament, Lok Sabha',
    contact: {
      email: 'r.gandhi@sansad.nic.in',
      phone: '+91-11-23012313',
    },
    educationalBackground: 'M.Phil. in Development Studies, Cambridge',
    workHistory: [
      {
        position: 'President of the Indian National Congress',
        tenure: '2017 - 2019',
        contributions:
          'Led the party during the 2019 general elections. Focused on social welfare schemes and farmers\' rights.',
      },
      {
        position: 'Member of Parliament, Lok Sabha',
        tenure: '2004 - Present',
        contributions:
          'Represented Amethi and Wayanad constituencies. Actively participated in debates on national security and economic policies.',
      },
    ],
  },
  {
    id: 'arvind-kejriwal',
    name: 'Arvind Kejriwal',
    photoUrl: 'https://picsum.photos/400/400',
    constituency: 'New Delhi',
    party: 'Aam Aadmi Party',
    currentPosition: 'Chief Minister of Delhi',
    contact: {
      email: 'cmdelhi@nic.in',
      phone: '+91-11-23392020',
    },
    educationalBackground: 'B.Tech in Mechanical Engineering, IIT Kharagpur',
    workHistory: [
      {
        position: 'Indian Revenue Service (IRS) Officer',
        tenure: '1995 - 2006',
        contributions:
          'Worked as a Joint Commissioner of Income Tax in New Delhi.',
      },
      {
        position: 'Chief Minister of Delhi',
        tenure: '2015 - Present',
        contributions:
          'Implemented reforms in education and healthcare, including Mohalla Clinics and improvements in government schools. Provided electricity and water subsidies.',
      },
    ],
  },
  {
    id: 'mamata-banerjee',
    name: 'Mamata Banerjee',
    photoUrl: 'https://picsum.photos/400/400',
    constituency: 'Bhabanipur, West Bengal',
    party: 'All India Trinamool Congress',
    currentPosition: 'Chief Minister of West Bengal',
    contact: {
      email: 'cm.wb@nic.in',
      phone: '+91-33-22145555',
    },
    educationalBackground: 'M.A. in Islamic History, PhD',
    workHistory: [
      {
        position: 'Minister of Railways',
        tenure: '1999 - 2001, 2009 - 2011',
        contributions:
          'Introduced several new trains and focused on passenger amenities.',
      },
      {
        position: 'Chief Minister of West Bengal',
        tenure: '2011 - Present',
        contributions:
          'Launched welfare schemes like Kanyashree and Swasthya Sathi. Focused on rural development.',
      },
    ],
  },
  {
    id: 'yogi-adityanath',
    name: 'Yogi Adityanath',
    photoUrl: 'https://picsum.photos/400/400',
    constituency: 'Gorakhpur Urban, Uttar Pradesh',
    party: 'Bharatiya Janata Party',
    currentPosition: 'Chief Minister of Uttar Pradesh',
    contact: {
      email: 'cmup@nic.in',
      phone: '+91-522-2236181',
    },
    educationalBackground: 'B.Sc. in Mathematics',
    workHistory: [
      {
        position: 'Member of Parliament, Lok Sabha',
        tenure: '1998 - 2017',
        contributions:
          'Represented Gorakhpur constituency for five consecutive terms.',
      },
      {
        position: 'Chief Minister of Uttar Pradesh',
        tenure: '2017 - Present',
        contributions:
          'Focused on law and order, infrastructure projects like expressways, and industrial investment.',
      },
    ],
  },
  {
    id: 'smriti-irani',
    name: 'Smriti Irani',
    photoUrl: 'https://picsum.photos/400/400',
    constituency: 'Amethi, Uttar Pradesh',
    party: 'Bharatiya Janata Party',
    currentPosition: 'Minister of Women and Child Development',
    contact: {
      email: 'smriti.irani@sansad.nic.in',
      phone: '+91-11-23012314',
    },
    educationalBackground: 'Part-time student of B.Com',
    workHistory: [
      {
        position: 'Minister of Human Resource Development',
        tenure: '2014 - 2016',
        contributions:
          'Launched several initiatives focused on digital education and skill development.',
      },
      {
        position: 'Minister of Textiles',
        tenure: '2016 - 2021',
        contributions: 'Worked on promoting Indian handlooms and textiles.',
      },
    ],
  },
];
