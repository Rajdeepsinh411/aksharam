/**
 * Aksharam Diagnostics: site configuration.
 * Everything that changes with the business (phones, addresses, timings,
 * coordinates, WhatsApp number, doctors, service toggles) lives here.
 * Text that has two languages is written as { en: '...', gu: '...' }.
 */
export const config = {
  name: { en: 'Aksharam Diagnostics', gu: 'અક્ષરમ્ ડાયગ્નોસ્ટિક્સ' },
  siteUrl: 'https://aksharamdiagnostics.store',
  email: 'aksharamdiagnostics@gmail.com',

  // WhatsApp number in international format, digits only (country code + number).
  whatsappNumber: '919909300966',

  // Number used by the red floating "Call" button on every page.
  emergencyPhone: { display: '+91 99093 00966', tel: '+919909300966' },

  // Extra line shown in the footer and contact page.
  additionalPhone: { display: '+91 94267 55747', tel: '+919426755747' },

  // Opening hours (24h format for search engines) and the label people see.
  timings: {
    opens: '09:00',
    closes: '20:00',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    label: { en: '9:00 AM – 8:00 PM, all days', gu: 'સવારે ૯:૦૦ થી રાત્રે ૮:૦૦, દરરોજ' }
  },
  emergency24h: true,

  facilities: { wheelchair: true, parking: true },

  // Set to true to show the pathology laboratory on every page and in the form.
  showPathology: false,

  // Order here = order on the site. Set enabled: false to hide a service.
  services: [
    { id: 'ct', enabled: true, group: 'ct' },
    { id: 'xray', enabled: true, group: 'xray' },
    { id: 'usg', enabled: true, group: 'sono' },
    { id: 'usg34d', enabled: true, group: 'sono' },
    { id: 'doppler', enabled: true, group: 'sono' },
    { id: 'path', enabled: 'showPathology', group: 'lab' }
  ],

  doctors: [
    {
      id: 'nirmal',
      initials: 'NL',
      name: { en: 'Dr. Nirmal Lakum', gu: 'ડૉ. નિર્મળ લકુમ' },
      qualification: { en: 'M.D. (Radiology)', gu: 'એમ.ડી. (રેડિયોલોજી)' }
    },
    {
      id: 'bipin',
      initials: 'BV',
      name: { en: 'Dr. Bipin Vidja (Patel)', gu: 'ડૉ. બિપિન વિડજા (પટેલ)' },
      qualification: { en: 'D.M.R.E. (Radiology)', gu: 'ડી.એમ.આર.ઈ. (રેડિયોલોજી)' }
    }
  ],

  branches: [
    {
      id: 'viramgam',
      name: { en: 'Viramgam', gu: 'વિરમગામ' },
      address: {
        en: 'Shop No. 5, 6, 7, 8, Ground Floor, P.M. Plaza, Opp. Maruti Nandan Complex, Mandal Road, Viramgam, Ahmedabad – 382150',
        gu: 'શોપ નં. ૫, ૬, ૭, ૮, ગ્રાઉન્ડ ફ્લોર, પી.એમ. પ્લાઝા, મારુતિ નંદન કોમ્પ્લેક્સની સામે, માંડલ રોડ, વિરમગામ, અમદાવાદ – ૩૮૨૧૫૦'
      },
      // Structured address for search engines (English).
      street: 'Shop No. 5–8, Ground Floor, P.M. Plaza, Opp. Maruti Nandan Complex, Mandal Road',
      locality: 'Viramgam',
      postalCode: '382150',
      phone: { display: '+91 99093 00966', tel: '+919909300966' },
      // Placeholder coordinates: replace with the exact pin (see README).
      lat: 23.1200,
      lng: 72.0400
    },
    {
      id: 'bopal',
      name: { en: 'South Bopal', gu: 'સાઉથ બોપલ' },
      address: {
        en: 'A-163–164, First Floor, Celebration City Centre, Gala Gymkhana Road, South Bopal, Ahmedabad – 380058',
        gu: 'એ-૧૬૩–૧૬૪, પહેલો માળ, સેલિબ્રેશન સિટી સેન્ટર, ગાલા જીમખાના રોડ, સાઉથ બોપલ, અમદાવાદ – ૩૮૦૦૫૮'
      },
      street: 'A-163–164, First Floor, Celebration City Centre, Gala Gymkhana Road, South Bopal',
      locality: 'Ahmedabad',
      postalCode: '380058',
      phone: { display: '+91 99093 32320', tel: '+919909332320' },
      lat: 23.0130,
      lng: 72.4690
    }
  ]
};

/** Services that are switched on, in display order. */
export function activeServices() {
  return config.services.filter((s) =>
    s.enabled === 'showPathology' ? config.showPathology : s.enabled !== false
  );
}

export function branchById(id) {
  return config.branches.find((b) => b.id === id);
}

export function mapsEmbedUrl(b) {
  return `https://www.google.com/maps?q=${b.lat},${b.lng}&z=16&output=embed`;
}

export function directionsUrl(b) {
  return `https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}`;
}

export function whatsappUrl(text) {
  const base = `https://wa.me/${config.whatsappNumber}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
