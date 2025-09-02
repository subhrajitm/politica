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
    photoUrl: 'https://picsum.photos/seed/nmodi/400/400',
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
    photoUrl: 'https://picsum.photos/seed/rgandhi/400/400',
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
    photoUrl: 'https://picsum.photos/seed/akejriwal/400/400',
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
    photoUrl: 'https://picsum.photos/seed/mbanerjee/400/400',
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
    photoUrl: 'https://picsum.photos/seed/yadityanath/400/400',
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
    photoUrl: 'https://picsum.photos/seed/sirani/400/400',
    constituency: 'Amethi, Uttar Pradesh',
    party: 'Bharatiya Janata Party',
    currentPosition:
      'Minister of Women and Child Development, Minister of Minority Affairs',
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
    photoUrl: 'https://picsum.photos/seed/ashah/400/400',
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
        contributions:
          'Led the party to major victories in national and state elections. Oversaw significant expansion of the party\'s membership base.',
      },
      {
        position: 'Minister of Home Affairs',
        tenure: '2019 - Present',
        contributions:
          'Key figure in the abrogation of Article 370 of the Constitution of India and the enactment of the Citizenship Amendment Act (CAA).',
      },
    ],
  },
  {
    id: 'nitin-gadkari',
    name: 'Nitin Gadkari',
    photoUrl: 'https://picsum.photos/seed/ngadkari/400/400',
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
        contributions:
          'Focused on organizational restructuring and grassroots outreach.',
      },
      {
        position: 'Minister for Road Transport & Highways',
        tenure: '2014 - Present',
        contributions:
          'Spearheaded a massive expansion of India\'s national highway network, including the construction of numerous expressways and the Bharatmala project.',
      },
    ],
  },
  {
    id: 'rajnath-singh',
    name: 'Rajnath Singh',
    photoUrl: 'https://picsum.photos/seed/rsingh/400/400',
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
        contributions:
          'Focused on improving the state\'s law and order situation.',
      },
      {
        position: 'Minister of Home Affairs',
        tenure: '2014 - 2019',
        contributions:
          'Handled national security challenges and implemented various police modernization schemes.',
      },
      {
        position: 'Minister of Defence',
        tenure: '2019 - Present',
        contributions:
          'Overseeing the modernization of the Indian Armed Forces and promoting indigenous defence manufacturing under the Atmanirbhar Bharat initiative.',
      },
    ],
  },
  {
    id: 'shashi-tharoor',
    name: 'Shashi Tharoor',
    photoUrl: 'https://picsum.photos/seed/stharoor/400/400',
    constituency: 'Thiruvananthapuram, Kerala',
    party: 'Indian National Congress',
    currentPosition: 'Member of Parliament, Lok Sabha',
    contact: {
      email: 'shashi.tharoor@sansad.nic.in',
      phone: '+91-471-2578899',
    },
    educationalBackground:
      'Ph.D. in International Relations and Affairs, Tufts University',
    workHistory: [
      {
        position: 'Under-Secretary-General, United Nations',
        tenure: '2002 - 2007',
        contributions:
          'Served in various high-level roles at the UN for nearly three decades, focusing on communications and public information.',
      },
      {
        position: 'Member of Parliament, Lok Sabha',
        tenure: '2009 - Present',
        contributions:
          'Known for his eloquent speeches and active participation in parliamentary debates. Has been a vocal advocate for various social and economic issues.',
      },
    ],
  },
  {
    id: 'akhilesh-yadav',
    name: 'Akhilesh Yadav',
    photoUrl: 'https://picsum.photos/seed/ayadav/400/400',
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
        contributions:
          'Initiated major infrastructure projects like the Agra-Lucknow Expressway and Lucknow Metro. Launched welfare schemes such as the Samajwadi Pension Yojana.',
      },
      {
        position: 'President of the Samajwadi Party',
        tenure: '2017 - Present',
        contributions:
          'Leading the party in state and national politics, focusing on issues of social justice and development.',
      },
    ],
  },
  {
    id: 'nirmala-sitharaman',
    name: 'Nirmala Sitharaman',
    photoUrl: 'https://picsum.photos/seed/nsitharaman/400/400',
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
        contributions:
          'Second woman to hold the office of Defence Minister in India. Focused on military modernization and procurement.',
      },
      {
        position: 'Minister of Finance and Corporate Affairs',
        tenure: '2019 - Present',
        contributions:
          'First full-time female Finance Minister of India. Presented several annual budgets, navigated the economic challenges of the COVID-19 pandemic, and implemented various economic reforms.',
      },
    ],
  },
  {
    id: 'sharad-pawar',
    name: 'Sharad Pawar',
    photoUrl: 'https://picsum.photos/seed/spawar/400/400',
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
    photoUrl: 'https://picsum.photos/seed/uthackeray/400/400',
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
    photoUrl: 'https://picsum.photos/seed/mkstalin/400/400',
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
  {
    id: 'supriya-sule',
    name: 'Supriya Sule',
    photoUrl: 'https://picsum.photos/seed/ssule/400/400',
    constituency: 'Baramati, Maharashtra',
    party: 'Nationalist Congress Party (Sharadchandra Pawar)',
    currentPosition: 'Member of Parliament, Lok Sabha',
    contact: {
      email: 'supriya.sule@sansad.nic.in',
      phone: '+91-2112-222222',
    },
    educationalBackground: 'B.Sc. in Microbiology',
    workHistory: [
      {
        position: 'Member of Parliament, Rajya Sabha',
        tenure: '2006 - 2009',
        contributions:
          'Participated in various parliamentary committees, focusing on rural development and women\'s issues.',
      },
      {
        position: 'Member of Parliament, Lok Sabha',
        tenure: '2009 - Present',
        contributions:
          'Recognized multiple times as a top-performing parliamentarian. Known for her active participation in debates and raising issues concerning her constituency and the state.',
      },
    ],
  },
  {
    id: 'mohan-charan-majhi',
    name: 'Mohan Charan Majhi',
    photoUrl: 'https://picsum.photos/seed/mcmajhi/400/400',
    constituency: 'Keonjhar, Odisha',
    party: 'Bharatiya Janata Party',
    currentPosition: 'Chief Minister of Odisha',
    contact: {
      email: 'cm.od@nic.in',
      phone: '+91-674-2536763',
    },
    educationalBackground: 'B.A., L.L.B.',
    workHistory: [
      {
        position: 'Member of the Odisha Legislative Assembly',
        tenure: '2000-2009, 2019-Present',
        contributions:
          'Served multiple terms as an MLA, focusing on tribal rights and development in the Keonjhar region. Held the position of Government Deputy Chief Whip from 2005-2009.',
      },
      {
        position: 'Chief Minister of Odisha',
        tenure: '2024 - Present',
        contributions:
          'Became the first Chief Minister from the BJP in Odisha, leading the state after a significant electoral victory.',
      },
    ],
  },
  {
    id: 'naveen-patnaik',
    name: 'Naveen Patnaik',
    photoUrl: 'https://picsum.photos/seed/npatnaik/400/400',
    constituency: 'Hinjili, Odisha',
    party: 'Biju Janata Dal',
    currentPosition: 'Leader of Opposition, Odisha Legislative Assembly',
    contact: {
      email: 'naveen.patnaik@nic.in',
      phone: '+91-674-2531100',
    },
    educationalBackground: 'B.A.',
    workHistory: [
      {
        position: 'Union Minister for Steel and Mines',
        tenure: '1998 - 2000',
        contributions:
          'Served as a cabinet minister in the Government of India before entering state politics.',
      },
      {
        position: 'Chief Minister of Odisha',
        tenure: '2000 - 2024',
        contributions:
          'One of India\'s longest-serving chief ministers. Oversaw significant poverty reduction, disaster management models acclaimed by the UN, and various welfare schemes like KALIA and BSKY.',
      },
    ],
  },
  {
    id: 'dharmendra-pradhan',
    name: 'Dharmendra Pradhan',
    photoUrl: 'https://picsum.photos/seed/dpradhan/400/400',
    constituency: 'Sambalpur, Odisha',
    party: 'Bharatiya Janata Party',
    currentPosition: 'Union Minister of Education',
    contact: {
      email: 'd.pradhan@sansad.nic.in',
      phone: '+91-11-23782387',
    },
    educationalBackground: 'M.A. in Anthropology',
    workHistory: [
      {
        position: 'Minister of Petroleum & Natural Gas and Steel',
        tenure: '2017 - 2021',
        contributions:
          'Led the Ujjwala Yojana, a major scheme to provide LPG connections to women from below-poverty-line families.',
      },
      {
        position: 'Minister of Education and Skill Development',
        tenure: '2021 - Present',
        contributions:
          'Overseeing the implementation of the National Education Policy (NEP) 2020, aimed at transforming India\'s educational landscape.',
      },
    ],
  },
  {
    id: 'jual-oram',
    name: 'Jual Oram',
    photoUrl: 'https://picsum.photos/seed/joram/400/400',
    constituency: 'Sundargarh, Odisha',
    party: 'Bharatiya Janata Party',
    currentPosition: 'Union Minister of Tribal Affairs',
    contact: {
      email: 'jual.oram@sansad.nic.in',
      phone: '+91-11-23018811',
    },
    educationalBackground: 'Diploma in Electrical Engineering',
    workHistory: [
      {
        position: 'Union Minister of Tribal Affairs',
        tenure: '1999-2004, 2014-2019, 2024-Present',
        contributions:
          'First Union Minister for Tribal Affairs in India. Focused on the welfare and development of tribal communities, including the implementation of the Forest Rights Act.',
      },
      {
        position: 'Member of Parliament, Lok Sabha',
        tenure: '1998-2009, 2014-Present',
        contributions:
          'A senior tribal leader representing the Sundargarh constituency for multiple terms.',
      },
    ],
  },
  {
    id: 'baijayant-panda',
    name: 'Baijayant "Jay" Panda',
    photoUrl: 'https://picsum.photos/seed/jpanda/400/400',
    constituency: 'Kendrapara, Odisha',
    party: 'Bharatiya Janata Party',
    currentPosition: 'National Vice President & Spokesperson, BJP',
    contact: {
      email: 'jay.panda@sansad.nic.in',
      phone: '+91-11-23795353',
    },
    educationalBackground: 'B.S. in Engineering, Management Minor, Michigan Technological University',
    workHistory: [
      {
        position: 'Member of Parliament, Lok Sabha',
        tenure: '2009 - 2019',
        contributions: 'Known for his active use of social media for constituent engagement and for being one of the most active parliamentarians in debates.',
      },
      {
        position: 'Member of Parliament, Rajya Sabha',
        tenure: '2000 - 2009',
        contributions: 'Represented Odisha in the upper house, focusing on industrial and economic issues.',
      },
    ],
  },
  {
    id: 'ashwini-vaishnaw',
    name: 'Ashwini Vaishnaw',
    photoUrl: 'https://picsum.photos/seed/avaishnaw/400/400',
    constituency: 'Odisha (Rajya Sabha)',
    party: 'Bharatiya Janata Party',
    currentPosition: 'Union Minister of Railways, Information & Broadcasting, and Electronics & IT',
    contact: {
      email: 'ashwini.vaishnaw@sansad.nic.in',
      phone: '+91-11-23381833',
    },
    educationalBackground: 'M.Tech from IIT Kanpur, MBA from Wharton School',
    workHistory: [
      {
        position: 'Indian Administrative Service (IAS) Officer',
        tenure: '1994 - 2010',
        contributions: 'Served as a collector in various districts of Odisha. Also worked in the office of former Prime Minister Atal Bihari Vajpayee.',
      },
      {
        position: 'Union Cabinet Minister',
        tenure: '2021 - Present',
        contributions: 'Handling key ministries, focusing on the modernization of Indian Railways, boosting electronics manufacturing (Make in India), and implementing IT policies.',
      },
    ],
  },
  {
    id: 'pinarayi-vijayan',
    name: 'Pinarayi Vijayan',
    photoUrl: 'https://picsum.photos/seed/pvijayan/400/400',
    constituency: 'Dharmadam, Kerala',
    party: 'Communist Party of India (Marxist)',
    currentPosition: 'Chief Minister of Kerala',
    contact: {
      email: 'cm@kerala.gov.in',
      phone: '+91-471-2333812',
    },
    educationalBackground: 'B.A. in Economics',
    workHistory: [
      {
        position: 'State Secretary of the CPI(M) in Kerala',
        tenure: '1998 - 2015',
        contributions: 'Led the party organization for 17 years, making him one of the longest-serving state secretaries.',
      },
      {
        position: 'Chief Minister of Kerala',
        tenure: '2016 - Present',
        contributions: 'Led the state through the devastating 2018 floods and the COVID-19 pandemic. Focused on public health, education, and infrastructure development through the Kerala Infrastructure Investment Fund Board (KIIFB).',
      },
    ],
  },
  {
    id: 'ys-jagan-mohan-reddy',
    name: 'Y. S. Jagan Mohan Reddy',
    photoUrl: 'https://picsum.photos/seed/ysjagan/400/400',
    constituency: 'Pulivendula, Andhra Pradesh',
    party: 'YSR Congress Party',
    currentPosition: 'Leader of Opposition, Andhra Pradesh Legislative Assembly',
    contact: {
      email: 'ys.jagan@sansad.nic.in',
      phone: '+91-863-2441234',
    },
    educationalBackground: 'Masters in Business Administration',
    workHistory: [
      {
        position: 'Member of Parliament, Lok Sabha',
        tenure: '2009 - 2014',
        contributions: 'Represented the Kadapa constituency before forming his own party.',
      },
      {
        position: 'Chief Minister of Andhra Pradesh',
        tenure: '2019 - 2024',
        contributions: 'Introduced a wide range of welfare schemes under the "Navaratnalu" banner, focusing on direct benefit transfers for education, health, and farmers\' support. ',
      },
    ],
  },
  {
    id: 'n-chandrababu-naidu',
    name: 'N. Chandrababu Naidu',
    photoUrl: 'https://picsum.photos/seed/ncbn/400/400',
    constituency: 'Kuppam, Andhra Pradesh',
    party: 'Telugu Desam Party',
    currentPosition: 'Chief Minister of Andhra Pradesh',
    contact: {
      email: 'cm@ap.gov.in',
      phone: '+91-863-2441617',
    },
    educationalBackground: 'M.A. in Economics',
    workHistory: [
      {
        position: 'Chief Minister of Andhra Pradesh (United)',
        tenure: '1995 - 2004',
        contributions: 'Known for his focus on information technology, he was instrumental in developing Hyderabad into a major IT hub (Cyberabad).',
      },
      {
        position: 'Chief Minister of Andhra Pradesh (Bifurcated)',
        tenure: '2014 - 2019, 2024 - Present',
        contributions: 'Focused on building the new capital city of Amaravati and attracting foreign investment to the state after its bifurcation.',
      },
    ],
  },
  {
    id: 'k-chandrashekar-rao',
    name: 'K. Chandrashekar Rao',
    photoUrl: 'https://picsum.photos/seed/kcr/400/400',
    constituency: 'Gajwel, Telangana',
    party: 'Bharat Rashtra Samithi',
    currentPosition: 'Leader of Opposition, Telangana Legislative Assembly',
    contact: {
      email: 'cm.telangana@nic.in',
      phone: '+91-40-23452933',
    },
    educationalBackground: 'M.A. in Telugu Literature',
    workHistory: [
      {
        position: 'Union Cabinet Minister of Labour and Employment',
        tenure: '2004 - 2006',
        contributions: 'Served in the central government before intensifying the statehood movement.',
      },
      {
        position: 'Chief Minister of Telangana',
        tenure: '2014 - 2023',
        contributions: 'First Chief Minister of Telangana. Led the movement for a separate state. Launched large-scale irrigation projects like Kaleshwaram and welfare schemes like Rythu Bandhu and Mission Bhagiratha.',
      },
    ],
  },
  {
    id: 'nitish-kumar',
    name: 'Nitish Kumar',
    photoUrl: 'https://picsum.photos/seed/nkumar/400/400',
    constituency: 'Member of Bihar Legislative Council',
    party: 'Janata Dal (United)',
    currentPosition: 'Chief Minister of Bihar',
    contact: {
      email: 'cm-bihar@nic.in',
      phone: '+91-612-2215886',
    },
    educationalBackground: 'B.Sc. in Electrical Engineering',
    workHistory: [
      {
        position: 'Union Minister of Railways, Agriculture, and Surface Transport',
        tenure: '1998 - 2004 (various periods)',
        contributions: 'Handled multiple key portfolios at the central level, introducing reforms in the railway sector.',
      },
      {
        position: 'Chief Minister of Bihar',
        tenure: '2005 - Present (with brief interruptions)',
        contributions: 'Longest-serving Chief Minister of Bihar. Credited with improving law and order ("Sushasan"), infrastructure (roads and electricity), and initiating social reforms like alcohol prohibition and reserving 50% of panchayat seats for women.',
      },
    ],
  },
  {
    id: 'himanta-biswa-sarma',
    name: 'Himanta Biswa Sarma',
    photoUrl: 'https://picsum.photos/seed/hbsarma/400/400',
    constituency: 'Jalukbari, Assam',
    party: 'Bharatiya Janata Party',
    currentPosition: 'Chief Minister of Assam',
    contact: {
      email: 'cm@assam.gov.in',
      phone: '+91-361-2266666',
    },
    educationalBackground: 'Ph.D. in Political Science',
    workHistory: [
      {
        position: 'Cabinet Minister, Government of Assam',
        tenure: '2001 - 2015',
        contributions: 'Held several key portfolios including Health, Education, and Finance under the Congress government, overseeing significant development in these sectors.',
      },
      {
        position: 'Chief Minister of Assam',
        tenure: '2021 - Present',
        contributions: 'Known for his assertive governance style. Focused on tackling illegal immigration, land reforms, and streamlining government recruitment.',
      },
    ],
  },
];
