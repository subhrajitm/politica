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
    photoUrl: 'https://picsum.photos/seed/picsum/400/400',
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
    photoUrl: 'https://picsum.photos/seed/rahul/400/400',
    constituency: 'Raebareli, Uttar Pradesh',
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
    photoUrl: 'https://picsum.photos/seed/kejriwal/400/400',
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
    photoUrl: 'https://picsum.photos/seed/mamata/400/400',
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
    photoUrl: 'https://picsum.photos/seed/yogi/400/400',
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
    photoUrl: 'https://picsum.photos/seed/smriti/400/400',
    constituency: 'Amethi, Uttar Pradesh',
    party: 'Bharatiya Janata Party',
    currentPosition: 'Minister of Women and Child Development, Minister of Minority Affairs',
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
  {
    id: 'amit-shah',
    name: 'Amit Shah',
    photoUrl: 'https://picsum.photos/seed/amit/400/400',
    constituency: 'Gandhinagar, Gujarat',
    party: 'Bharatiya Janata Party',
    currentPosition: 'Minister of Home Affairs and Minister of Co-operation',
    contact: {
      email: 'a.shah@sansad.nic.in',
      phone: '+91-11-23092462',
    },
    educationalBackground: 'B.Sc. in Biochemistry',
    workHistory: [
      {
        position: 'President of the Bharatiya Janata Party',
        tenure: '2014 - 2020',
        contributions: 'Led the party to major victories in national and state elections. Oversaw significant expansion of the party\'s membership base.',
      },
      {
        position: 'Minister of Home Affairs',
        tenure: '2019 - Present',
        contributions: 'Key figure in the abrogation of Article 370 of the Constitution of India and the enactment of the Citizenship Amendment Act (CAA).',
      },
    ],
  },
  {
    id: 'nitin-gadkari',
    name: 'Nitin Gadkari',
    photoUrl: 'https://picsum.photos/seed/gadkari/400/400',
    constituency: 'Nagpur, Maharashtra',
    party: 'Bharatiya Janata Party',
    currentPosition: 'Minister for Road Transport & Highways',
    contact: {
      email: 'nitin.gadkari@nic.in',
      phone: '+91-11-23719023',
    },
    educationalBackground: 'M.Com., L.L.B.',
    workHistory: [
      {
        position: 'President of the Bharatiya Janata Party',
        tenure: '2009 - 2013',
        contributions: 'Focused on organizational restructuring and grassroots outreach.',
      },
      {
        position: 'Minister for Road Transport & Highways',
        tenure: '2014 - Present',
        contributions: 'Spearheaded a massive expansion of India\'s national highway network, including the construction of numerous expressways and the Bharatmala project.',
      },
    ],
  },
  {
    id: 'rajnath-singh',
    name: 'Rajnath Singh',
    photoUrl: 'https://picsum.photos/seed/rajnath/400/400',
    constituency: 'Lucknow, Uttar Pradesh',
    party: 'Bharatiya Janata Party',
    currentPosition: 'Minister of Defence',
    contact: {
      email: 'rajnath.singh@sansad.nic.in',
      phone: '+91-11-23012286',
    },
    educationalBackground: 'M.Sc. in Physics',
    workHistory: [
      {
        position: 'Chief Minister of Uttar Pradesh',
        tenure: '2000 - 2002',
        contributions: 'Focused on improving the state\'s law and order situation.',
      },
      {
        position: 'Minister of Home Affairs',
        tenure: '2014 - 2019',
        contributions: 'Handled national security challenges and implemented various police modernization schemes.',
      },
      {
        position: 'Minister of Defence',
        tenure: '2019 - Present',
        contributions: 'Overseeing the modernization of the Indian Armed Forces and promoting indigenous defence manufacturing under the Atmanirbhar Bharat initiative.',
      },
    ],
  },
  {
    id: 'shashi-tharoor',
    name: 'Shashi Tharoor',
    photoUrl: 'https://picsum.photos/seed/tharoor/400/400',
    constituency: 'Thiruvananthapuram, Kerala',
    party: 'Indian National Congress',
    currentPosition: 'Member of Parliament, Lok Sabha',
    contact: {
      email: 'shashi.tharoor@sansad.nic.in',
      phone: '+91-471-2578899',
    },
    educationalBackground: 'Ph.D. in International Relations and Affairs, Tufts University',
    workHistory: [
      {
        position: 'Under-Secretary-General, United Nations',
        tenure: '2002 - 2007',
        contributions: 'Served in various high-level roles at the UN for nearly three decades, focusing on communications and public information.',
      },
      {
        position: 'Member of Parliament, Lok Sabha',
        tenure: '2009 - Present',
        contributions: 'Known for his eloquent speeches and active participation in parliamentary debates. Has been a vocal advocate for various social and economic issues.',
      },
    ],
  },
  {
    id: 'akhilesh-yadav',
    name: 'Akhilesh Yadav',
    photoUrl: 'https://picsum.photos/seed/akhilesh/400/400',
    constituency: 'Kannauj, Uttar Pradesh',
    party: 'Samajwadi Party',
    currentPosition: 'Member of Parliament, Lok Sabha; Leader of the Opposition',
    contact: {
      email: 'akhilesh.yadav@sansad.nic.in',
      phone: '+91-522-2235454',
    },
    educationalBackground: 'M.E. in Civil Environmental Engineering',
    workHistory: [
      {
        position: 'Chief Minister of Uttar Pradesh',
        tenure: '2012 - 2017',
        contributions: 'Initiated major infrastructure projects like the Agra-Lucknow Expressway and Lucknow Metro. Launched welfare schemes such as the Samajwadi Pension Yojana.',
      },
      {
        position: 'President of the Samajwadi Party',
        tenure: '2017 - Present',
        contributions: 'Leading the party in state and national politics, focusing on issues of social justice and development.',
      },
    ],
  },
  {
    id: 'nirmala-sitharaman',
    name: 'Nirmala Sitharaman',
    photoUrl: 'https://picsum.photos/seed/nirmala/400/400',
    constituency: 'Karnataka (Rajya Sabha)',
    party: 'Bharatiya Janata Party',
    currentPosition: 'Minister of Finance and Corporate Affairs',
    contact: {
      email: 'nsitharaman@nic.in',
      phone: '+91-11-23092510',
    },
    educationalBackground: 'M.A. in Economics, M.Phil.',
    workHistory: [
      {
        position: 'Minister of Defence',
        tenure: '2017 - 2019',
        contributions: 'Second woman to hold the office of Defence Minister in India. Focused on military modernization and procurement.',
      },
      {
        position: 'Minister of Finance and Corporate Affairs',
        tenure: '2019 - Present',
        contributions: 'First full-time female Finance Minister of India. Presented several annual budgets, navigated the economic challenges of the COVID-19 pandemic, and implemented various economic reforms.',
      },
    ],
  },
  {
    id: 'sharad-pawar',
    name: 'Sharad Pawar',
    photoUrl: 'https://picsum.photos/seed/pawar/400/400',
    constituency: 'Maharashtra (Rajya Sabha)',
    party: 'Nationalist Congress Party (Sharadchandra Pawar)',
    currentPosition: 'Member of Parliament, Rajya Sabha',
    contact: {
      email: 'sharad.pawar@sansad.nic.in',
      phone: '+91-11-23794499',
    },
    educationalBackground: 'Commerce Graduate',
    workHistory: [
      {
        position: 'Chief Minister of Maharashtra',
        tenure: '1978–1980, 1988–1991, 1993–1995',
        contributions:
          'Served multiple terms, focusing on agricultural reforms and industrial development in the state.',
      },
      {
        position: 'Minister of Defence',
        tenure: '1991–1993',
        contributions:
          'Handled national security and defence policy during a critical period.',
      },
      {
        position: 'Minister of Agriculture',
        tenure: '2004–2014',
        contributions:
          'Oversaw national agricultural policies, including farm loan waivers and schemes to boost crop production.',
      },
    ],
  },
  {
    id: 'uddhav-thackeray',
    name: 'Uddhav Thackeray',
    photoUrl: 'https://picsum.photos/seed/uddhav/400/400',
    constituency: 'Member of Maharashtra Legislative Council',
    party: 'Shiv Sena (Uddhav Balasaheb Thackeray)',
    currentPosition: 'Party President',
    contact: {
      email: 'uddhav.thackeray@nic.in',
      phone: '+91-22-22025151',
    },
    educationalBackground: 'Graduate from JJ School of Art',
    workHistory: [
      {
        position: 'Chief Minister of Maharashtra',
        tenure: '2019 - 2022',
        contributions:
          'Led the Maha Vikas Aghadi coalition government. Managed the state\'s response to the COVID-19 pandemic.',
      },
      {
        position: 'President of Shiv Sena',
        tenure: '2013 - Present',
        contributions:
          'Took over the leadership of the party from his father, Bal Thackeray. Has since led the party through various state and national elections.',
      },
    ],
  },
  {
    id: 'mk-stalin',
    name: 'M. K. Stalin',
    photoUrl: 'https://picsum.photos/seed/stalin/400/400',
    constituency: 'Kolathur, Tamil Nadu',
    party: 'Dravida Munnetra Kazhagam',
    currentPosition: 'Chief Minister of Tamil Nadu',
    contact: {
      email: 'cm.tn@nic.in',
      phone: '+91-44-25672345',
    },
    educationalBackground: 'B.A. in History',
    workHistory: [
      {
        position: 'Mayor of Chennai',
        tenure: '1996 - 2002',
        contributions:
          'Initiated several infrastructure projects in the city.',
      },
      {
        position: 'Deputy Chief Minister of Tamil Nadu',
        tenure: '2009 - 2011',
        contributions:
          'Handled key portfolios and assisted in state administration.',
      },
      {
        position: 'Chief Minister of Tamil Nadu',
        tenure: '2021 - Present',
        contributions:
          'Launched various welfare schemes, focusing on women\'s empowerment and social justice.',
      },
    ],
  },
];
