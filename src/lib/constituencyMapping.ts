// Mapping of constituency names to states for better state detection
export const constituencyToStateMapping: Record<string, string> = {
  // India - Major constituencies and their states
  'Varanasi': 'Uttar Pradesh',
  'Rae Bareli': 'Uttar Pradesh', 
  'Gandhinagar': 'Gujarat',
  'Kuppam': 'Andhra Pradesh',
  'Mukto': 'Arunachal Pradesh',
  'Aska': 'Odisha',
  'Baraily': 'Uttar Pradesh',
  
  // Additional Indian constituencies from the database
  'Jalukbari': 'Assam',
  'Nalanda': 'Bihar',
  'Kunkuri': 'Chhattisgarh',
  'Sanquelim': 'Goa',
  'Ghatlodia': 'Gujarat',
  'Ladwa': 'Haryana',
  'Nadaun': 'Himachal Pradesh',
  'Dhuri': 'Punjab',
  'Kannauj': 'Uttar Pradesh',
  'Hyderabad': 'Telangana',
  'Barhait': 'Jharkhand',
  'Sanganer': 'Rajasthan',
  'Raghopur': 'Bihar',
  'Lucknow': 'Uttar Pradesh',
  'Varuna': 'Karnataka',
  'Soreng-Chakung': 'Sikkim',
  'Baramati': 'Maharashtra',
  'Nagpur': 'Maharashtra',
  'Dharmadam': 'Kerala',
  'Kolathur': 'Tamil Nadu',
  'Mumbai': 'Maharashtra',
  'Wayanad': 'Kerala',
  'Ujjain South': 'Madhya Pradesh',
  'Kodangal': 'Telangana',
  'Amethi': 'Uttar Pradesh',
  'Nagpur South West': 'Maharashtra',
  'Bordowali': 'Tripura',
  'Delhi': 'Delhi',
  'Guna': 'Madhya Pradesh',
  
  // Nepal - Major constituencies and their provinces
  'Kathmandu': 'Bagmati Province',
  'Lalitpur': 'Bagmati Province',
  'Bhaktapur': 'Bagmati Province',
  'Pokhara': 'Gandaki Province',
  'Chitwan': 'Bagmati Province',
  'Bharatpur': 'Bagmati Province',
  'Birgunj': 'Madhesh',
  'Janakpur': 'Madhesh',
  'Biratnagar': 'Koshi',
  'Dharan': 'Koshi',
  'Itahari': 'Koshi',
  'Hetauda': 'Bagmati Province',
  'Butwal': 'Lumbini Province',
  'Nepalgunj': 'Lumbini Province',
  'Dhangadhi': 'Sudurpashchim Province',
  'Mahendranagar': 'Sudurpashchim Province',
  'Dhankuta': 'Koshi',
  'Ilam': 'Koshi',
  'Jhapa': 'Koshi',
  'Morang': 'Koshi',
  'Sunsari': 'Koshi',
  'Saptari': 'Madhesh',
  'Siraha': 'Madhesh',
  'Dhanusha': 'Madhesh',
  'Mahottari': 'Madhesh',
  'Sarlahi': 'Madhesh',
  'Rautahat': 'Madhesh',
  'Bara': 'Madhesh',
  'Parsa': 'Madhesh',
  'Chitwan': 'Bagmati Province',
  'Makwanpur': 'Bagmati Province',
  'Dhading': 'Bagmati Province',
  'Nuwakot': 'Bagmati Province',
  'Rasuwa': 'Bagmati Province',
  'Sindhupalchok': 'Bagmati Province',
  'Dolakha': 'Bagmati Province',
  'Ramechhap': 'Bagmati Province',
  'Sindhuli': 'Bagmati Province',
  'Kavrepalanchok': 'Bagmati Province',
  'Lalitpur': 'Bagmati Province',
  'Bhaktapur': 'Bagmati Province',
  'Kathmandu': 'Bagmati Province',
  'Kaski': 'Gandaki Province',
  'Manang': 'Gandaki Province',
  'Mustang': 'Gandaki Province',
  'Myagdi': 'Gandaki Province',
  'Nawalpur': 'Gandaki Province',
  'Parbat': 'Gandaki Province',
  'Syangja': 'Gandaki Province',
  'Tanahun': 'Gandaki Province',
  'Lamjung': 'Gandaki Province',
  'Gorkha': 'Gandaki Province',
  'Baglung': 'Gandaki Province',
  'Kapilvastu': 'Lumbini Province',
  'Nawalparasi East': 'Lumbini Province',
  'Nawalparasi West': 'Lumbini Province',
  'Rupandehi': 'Lumbini Province',
  'Arghakhanchi': 'Lumbini Province',
  'Gulmi': 'Lumbini Province',
  'Palpa': 'Lumbini Province',
  'Dang': 'Lumbini Province',
  'Pyuthan': 'Lumbini Province',
  'Rolpa': 'Lumbini Province',
  'Eastern Rukum': 'Lumbini Province',
  'Banke': 'Lumbini Province',
  'Bardiya': 'Lumbini Province',
  'Western Rukum': 'Karnali Province',
  'Salyan': 'Karnali Province',
  'Dolpa': 'Karnali Province',
  'Humla': 'Karnali Province',
  'Jumla': 'Karnali Province',
  'Kalikot': 'Karnali Province',
  'Mugu': 'Karnali Province',
  'Surkhet': 'Karnali Province',
  'Dailekh': 'Karnali Province',
  'Jajarkot': 'Karnali Province',
  'Kailali': 'Sudurpashchim Province',
  'Achham': 'Sudurpashchim Province',
  'Doti': 'Sudurpashchim Province',
  'Bajhang': 'Sudurpashchim Province',
  'Bajura': 'Sudurpashchim Province',
  'Kanchanpur': 'Sudurpashchim Province',
  'Dadeldhura': 'Sudurpashchim Province',
  'Baitadi': 'Sudurpashchim Province',
  'Darchula': 'Sudurpashchim Province'
};

// Function to extract state from constituency
export function extractStateFromConstituency(constituency: string, nationality?: string): string | null {
  if (!constituency || constituency === 'Not specified') {
    return null;
  }

  // First, try to extract state from "Constituency, State" format
  const parts = constituency.split(', ');
  if (parts.length > 1) {
    return parts[1].trim();
  }

  // If that doesn't work, try to map the constituency name to a state
  const constituencyName = parts[0].trim();
  
  // Handle special cases like "Gujarat (Rajya Sabha)" -> "Gujarat"
  const cleanConstituency = constituencyName.replace(/\s*\([^)]*\)$/, '');
  
  // Check direct mapping
  if (constituencyToStateMapping[cleanConstituency]) {
    return constituencyToStateMapping[cleanConstituency];
  }
  
  // Handle Rajya Sabha cases where the state is mentioned in parentheses
  if (constituencyName.includes('(Rajya Sabha)')) {
    const stateInParentheses = constituencyName.match(/^([^(]+)\s*\([^)]*\)$/);
    if (stateInParentheses) {
      const stateName = stateInParentheses[1].trim();
      // Check if this state name exists in our mapping or is a known state
      if (constituencyToStateMapping[stateName] || 
          ['Gujarat', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'West Bengal', 'Uttar Pradesh', 'Bihar', 'Rajasthan', 'Madhya Pradesh', 'Andhra Pradesh', 'Telangana', 'Kerala', 'Punjab', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Uttarakhand', 'Chhattisgarh', 'Jharkhand', 'Odisha', 'Assam', 'Arunachal Pradesh', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura', 'Goa', 'Delhi'].includes(stateName)) {
        return stateName;
      }
    }
  }

  // For Nepal politicians, if we can't find a specific mapping, 
  // we could return a default or try to infer from nationality
  if (nationality === 'Nepali') {
    // For Nepal, we could return a default province or try to infer
    // For now, return null to indicate unknown
    return null;
  }

  // For Indian politicians, we could try to infer from common patterns
  if (nationality === 'Indian') {
    // Some common Indian state patterns
    const indianStatePatterns: Record<string, string> = {
      'Gujarat': 'Gujarat',
      'Karnataka': 'Karnataka',
      'Tamil Nadu': 'Tamil Nadu',
      'Maharashtra': 'Maharashtra',
      'West Bengal': 'West Bengal',
      'Uttar Pradesh': 'Uttar Pradesh',
      'Bihar': 'Bihar',
      'Rajasthan': 'Rajasthan',
      'Madhya Pradesh': 'Madhya Pradesh',
      'Andhra Pradesh': 'Andhra Pradesh',
      'Telangana': 'Telangana',
      'Kerala': 'Kerala',
      'Punjab': 'Punjab',
      'Haryana': 'Haryana',
      'Himachal Pradesh': 'Himachal Pradesh',
      'Jammu and Kashmir': 'Jammu and Kashmir',
      'Uttarakhand': 'Uttarakhand',
      'Chhattisgarh': 'Chhattisgarh',
      'Jharkhand': 'Jharkhand',
      'Odisha': 'Odisha',
      'Assam': 'Assam',
      'Arunachal Pradesh': 'Arunachal Pradesh',
      'Manipur': 'Manipur',
      'Meghalaya': 'Meghalaya',
      'Mizoram': 'Mizoram',
      'Nagaland': 'Nagaland',
      'Sikkim': 'Sikkim',
      'Tripura': 'Tripura',
      'Goa': 'Goa'
    };

    // Check if the constituency name matches any state name
    for (const [stateName, stateCode] of Object.entries(indianStatePatterns)) {
      if (cleanConstituency.toLowerCase().includes(stateName.toLowerCase()) ||
          stateName.toLowerCase().includes(cleanConstituency.toLowerCase())) {
        return stateName;
      }
    }
  }

  return null;
}
