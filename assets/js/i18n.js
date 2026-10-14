/**
 * Aksharam Diagnostics: all website text in English (en) and Gujarati (gu).
 * Edit the wording here. Keys are shared by both languages; if a Gujarati
 * key is missing, the English text is shown instead.
 *
 * In HTML:  data-i18n="key"        → sets the text
 *           data-i18n-html="key"   → sets HTML (for <strong>, <br>)
 *           data-i18n-list="key"   → fills a <ul>/<ol> from "item one|item two"
 *           data-i18n-attr="placeholder:key; aria-label:key2"
 */

const PCPNDT_EN = 'Sex determination of the foetus is not done here. It is a punishable offence under the PC&PNDT Act, 1994.';
const PCPNDT_GU = 'અહીં ગર્ભના જાતિ પરીક્ષણ કરવામાં આવતું નથી. PC&PNDT કાયદા, 1994 હેઠળ તે સજાપાત્ર ગુનો છે.';

export const dict = {
  en: {
    /* ---------- Meta ---------- */
    'meta.home.title': 'Aksharam Diagnostics | CT Scan, X-Ray & Sonography in Viramgam and South Bopal',
    'meta.about.title': 'About Us & Our Radiologists | Aksharam Diagnostics',
    'meta.services.title': 'CT Scan, Digital X-Ray, Sonography & Colour Doppler | Aksharam Diagnostics',
    'meta.contact.title': 'Contact & Book an Appointment | Aksharam Diagnostics, Viramgam & South Bopal',

    /* ---------- Shared ---------- */
    'skip': 'Skip to content',
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.contact': 'Contact',
    'nav.book': 'Book Appointment',
    'nav.menu': 'Open menu',
    'nav.close': 'Close menu',
    'nav.main': 'Main navigation',
    'lang.switch': 'Switch language to Gujarati',
    'top.emergency': '24-hour emergency',

    'cta.book': 'Book an Appointment',
    'cta.call': 'Call Now',
    'cta.whatsapp': 'WhatsApp Us',
    'cta.directions': 'Get Directions',
    'cta.learn': 'Learn more',
    'cta.bookTest': 'Book this test',
    'cta.allServices': 'View all services',
    'cta.aboutUs': 'More about us',

    'fab.whatsapp': 'Chat on WhatsApp',
    'fab.call': 'Call',
    'fab.callLabel': 'Call us for emergencies',

    'common.timings': 'Timings',
    'common.phone': 'Phone',
    'common.address': 'Address',
    'common.emergency24': 'Emergency services available 24 hours',
    'common.emergencyNote': 'Emergency services are available 24 hours. Please call before you come.',
    'common.wheelchair': 'Wheelchair-accessible entry',
    'common.parking': 'On-site parking',
    'common.callBranch': 'Call',
    'common.opensNewTab': '(opens Google Maps)',

    'pcpndt.title': 'PC&PNDT notice',
    'pcpndt.text': PCPNDT_EN,

    'footer.desc': 'Diagnostic imaging centre in Viramgam and South Bopal, Ahmedabad: CT scan, digital X-ray, sonography and colour Doppler.',
    'footer.quick': 'Quick links',
    'footer.branches': 'Our branches',
    'footer.contact': 'Contact',
    'footer.disclaimer': 'Information on this website is for general awareness only. Please follow your doctor’s advice.',
    'footer.rights': 'All rights reserved.',

    /* ---------- Photography, scene overlay, media credits (added) ---------- */
    'photo.representative': 'Representative image',
    'scene.report.title': 'Report ready',
    'scene.report.sub': 'Prepared by a qualified radiologist',
    'footer.credits': 'Image and media credits',
    'footer.creditsIntro': 'Photographs on this website are representative stock images. Medical images come from public, openly licensed data.',
    'fac.waiting': 'Waiting area',
    'img.svc.ct': 'CT scanner with its patient table in a bright scan room',
    'img.svc.xray': 'Digital X-ray room with a ceiling-mounted tube and wall stand',
    'img.svc.usg': 'Ultrasound machine with its monitor and control panel',
    'img.svc.usg34d': 'Close-up of an ultrasound control panel and trackball',
    'img.svc.doppler': 'Colour Doppler image of an artery on an ultrasound screen',
    'img.hero.about': 'Bright clinic waiting area with seating',
    'img.hero.services': 'CT scan room with the scanner and patient table',
    'img.hero.contact': 'Spacious, light-filled waiting area',
    'img.fac.ct': 'CT scanner room',
    'img.fac.usg': 'Ultrasound probes in their holders',
    'img.fac.waiting': 'Seating in a waiting area',

    /* ---------- Services (names + short lines) ---------- */
    'svc.ct.name': 'MDCT Scan (16-slice)',
    'svc.ct.short': 'Fast, detailed cross-sectional imaging, including HRCT chest.',
    'svc.xray.name': 'Digital X-Ray',
    'svc.xray.short': 'Quick, clear X-ray imaging of the chest, bones and joints.',
    'svc.usg.name': 'Sonography / Ultrasound',
    'svc.usg.short': 'Abdomen, pelvis and obstetric scans, without radiation.',
    'svc.usg34d.name': '3D / 4D Sonography',
    'svc.usg34d.short': 'Detailed assessment of foetal anatomy.',
    'svc.doppler.name': 'Colour Doppler',
    'svc.doppler.short': 'Assessment of blood flow in arteries and veins.',
    'svc.path.name': 'Pathology Laboratory',
    'svc.path.short': 'Blood tests, hormone profiles and biochemistry.',

    /* ---------- Home ---------- */
    'hero.eyebrow': 'Radiology & diagnostic imaging',
    'hero.title': 'Clarity you can trust.',
    'hero.sub': 'Advanced CT, X-Ray and Sonography in Viramgam and South Bopal. Emergency services available 24 hours.',
    'hero.scroll': 'Scroll to see how a scan happens',

    'story.prep.kicker': 'Step 1 · Preparing for the scan',
    'story.prep.title': 'Calm, comfortable and quick.',
    'story.prep.text': 'Our trained staff explain each step before you begin and help you settle comfortably on the scan table. Most scans take only a few minutes, and someone is always close by.',
    'story.scan.kicker': 'Step 2 · Scanning',
    'story.scan.title': '16-slice MDCT, including HRCT chest.',
    'story.scan.text': 'Our 16-slice multi-detector CT captures fine cross-sectional images within seconds. It supports a wide range of studies, including high-resolution CT (HRCT) of the chest, as advised by your doctor.',
    'story.slices.kicker': 'Step 3 · Slices to image',
    'story.slices.title': 'Detailed images, read by qualified radiologists.',
    'story.slices.text': 'Each thin slice becomes part of one detailed picture. Our radiologists review the images carefully and prepare a clear report for your doctor.',
    'story.us.kicker': 'Step 4 · Ultrasound',
    'story.us.title': 'Sonography, 3D/4D and colour Doppler.',
    'story.us.text': 'Ultrasound uses sound waves, not radiation. We offer abdomen, pelvis and obstetric sonography, 3D/4D sonography for detailed foetal anatomy assessment, and colour Doppler to study blood flow.',
    'story.report.kicker': 'Step 5 · Report ready',
    'story.report.title': 'Your report, without the wait.',
    'story.report.text': 'We work to share reports promptly, and our team will tell you when yours will be ready. Urgent and emergency cases are given priority.',

    'home.services.title': 'Our services',
    'home.services.sub': 'Modern diagnostic imaging under one roof, close to home.',
    'why.title': 'Why Aksharam',
    'why.sub': 'Careful imaging, clear guidance and help when you need it.',
    'why.doctors.title': 'Qualified radiologists',
    'why.doctors.text': 'Your images are reviewed by our radiologists: an M.D. (Radiology) and a D.M.R.E. (Radiology).',
    'why.ct.title': 'Modern 16-slice CT',
    'why.ct.text': 'Multi-detector CT for fast, detailed cross-sectional imaging, alongside digital X-ray and colour Doppler.',
    'why.emergency.title': '24-hour emergency imaging',
    'why.emergency.text': 'Emergency services are available round the clock. Please call before you come so we can be ready for you.',
    'why.branches.title': 'Two convenient branches',
    'why.branches.text': 'Viramgam and South Bopal, Ahmedabad, so advanced diagnostics are close to home.',
    'doctors.title': 'Our doctors',
    'doctors.sub': 'Every report is prepared by a qualified radiologist.',
    'doctors.role': 'Consultant Radiologist',
    'branches.title': 'Our branches',
    'branches.sub': 'Visit the branch nearest to you. Both are open all days.',
    'strip.title': 'Need a scan today? Call or WhatsApp us.',
    'strip.text': 'Our team will help you choose a time and explain any preparation.',

    /* ---------- About ---------- */
    'about.hero.eyebrow': 'About us',
    'about.hero.title': 'Accurate imaging, with care.',
    'about.hero.sub': 'A diagnostic imaging centre serving Viramgam, the surrounding villages and now South Bopal, Ahmedabad.',
    'about.intro.title': 'About Aksharam Diagnostics',
    'about.p1': 'Aksharam Diagnostics is a radiology and diagnostic imaging centre in Viramgam that serves patients from the town and the surrounding villages. We now also welcome patients at our branch in South Bopal, Ahmedabad.',
    'about.p2': 'Our focus is simple: accurate imaging and caring service. With a 16-slice MDCT scanner, digital X-ray, sonography and colour Doppler, we aim to make advanced diagnostics available locally, so families do not have to travel far for the tests their doctor advises.',
    'about.p3': 'Every study is reviewed by a qualified radiologist, and our team takes time to explain preparation, answer questions and keep you comfortable from arrival to report.',
    'about.doctors.title': 'Our radiologists',
    'about.doctors.sub': 'The doctors who review your images and prepare your report.',
    'about.doc.nirmal.line': 'Reports CT, X-ray, sonography and colour Doppler studies, with a focus on clear, careful reporting for referring doctors.',
    'about.doc.bipin.line': 'Reports imaging studies across CT, X-ray and ultrasound, and guides patients through their scans with patience and care.',
    'about.mission.title': 'Our mission',
    'about.mission.text': 'To provide accurate, timely diagnostic imaging with kindness and respect, close to where our patients live.',
    'about.vision.title': 'Our vision',
    'about.vision.text': 'A community where every family can access reliable, modern diagnostics without long journeys or long waits.',
    'about.values.title': 'Our values',
    'value.accuracy.title': 'Accuracy',
    'value.accuracy.text': 'Careful technique and careful reading, every time.',
    'value.compassion.title': 'Compassion',
    'value.compassion.text': 'Calm, patient care for every person who walks in.',
    'value.access.title': 'Accessibility',
    'value.access.text': 'Advanced tests close to home, with step-free access and parking.',
    'value.integrity.title': 'Integrity',
    'value.integrity.text': 'Honest guidance, clear information and full respect for the law.',
    'about.facilities.title': 'Facilities',
    'about.facilities.sub': 'What you will find at Aksharam Diagnostics.',
    'fac.ct': '16-slice MDCT scanner',
    'fac.xray': 'Digital X-ray',
    'fac.usg': 'Ultrasound with colour Doppler',
    'fac.wheelchair': 'Wheelchair-accessible entry',
    'fac.parking': 'On-site parking',
    'fac.emergency': '24-hour emergency imaging',

    /* ---------- Services page ---------- */
    'services.hero.eyebrow': 'Services',
    'services.hero.title': 'Diagnostic imaging, explained simply.',
    'services.hero.sub': 'What each test is, when doctors usually advise it, how long it takes and how to prepare.',
    'services.what': 'What it is',
    'services.uses': 'Common uses',
    'services.duration': 'Approximate duration',
    'services.jump': 'Jump to a service',

    'svc.ct.what': 'A CT (computed tomography) scan uses X-rays and a computer to create detailed cross-sectional images of the body. Our 16-slice multi-detector CT (MDCT) captures these images quickly, which helps keep scans short and comfortable.',
    'svc.ct.uses': 'Head scans, as advised after an injury or for symptoms such as severe headache|HRCT (high-resolution CT) of the chest to look at the lungs in detail|Abdomen and pelvis scans|Spine, joints and bone detail',
    'svc.ct.duration': 'Usually 5–15 minutes on the table; longer if a contrast injection is needed.',
    'svc.xray.what': 'Digital X-ray uses a small, controlled dose of radiation to produce clear images on a computer straight away, without film.',
    'svc.xray.uses': 'Chest X-ray|Bones and joints after an injury or for pain|Spine and sinuses|Check-ups advised by your doctor',
    'svc.xray.duration': 'A few minutes.',
    'svc.usg.what': 'Sonography (ultrasound) uses high-frequency sound waves to see organs and soft tissues in real time. It does not use radiation.',
    'svc.usg.uses': 'Abdomen: liver, gallbladder, pancreas and kidneys|Pelvis: urinary bladder, uterus, ovaries and prostate|Obstetric scans to follow a pregnancy, as advised by your doctor',
    'svc.usg.duration': 'About 15–30 minutes.',
    'svc.usg34d.what': '3D/4D sonography builds three-dimensional ultrasound images, and 4D shows them in real time. We use it only for detailed assessment of foetal anatomy, as advised by your doctor.',
    'svc.usg34d.uses': 'Detailed assessment of foetal anatomy|Usually advised by your doctor at a specific stage of pregnancy',
    'svc.usg34d.duration': 'About 30–45 minutes.',
    'svc.doppler.what': 'Colour Doppler is a type of ultrasound that shows the direction and speed of blood flow in arteries and veins, in colour.',
    'svc.doppler.uses': 'Leg veins and arteries, for example for swelling or pain|Neck (carotid) arteries|Obstetric Doppler to assess blood flow during pregnancy, as advised by your doctor',
    'svc.doppler.duration': 'About 20–40 minutes, depending on the area studied.',
    'svc.path.what': 'Our pathology laboratory tests blood and other samples to support your doctor’s assessment.',
    'svc.path.uses': 'Routine blood tests such as complete blood count and blood sugar|Hormone profiles such as thyroid tests|Biochemistry such as kidney and liver function tests',
    'svc.path.duration': 'Sample collection takes a few minutes.',

    'prep.title': 'Patient preparation guide',
    'prep.sub': 'General guidance to help you get ready.',
    'prep.note': 'These are general guidelines. Our team will confirm exact instructions when you book.',
    'prep.ct.title': 'CT scan with contrast',
    'prep.ct.items': 'You may be asked not to eat for a few hours before the scan.|Bring your previous reports, and a kidney function test (creatinine) if your doctor has advised it.|Tell our staff about any allergies, diabetes medicines, or if you are or might be pregnant.',
    'prep.usg.title': 'Abdomen / pelvis sonography',
    'prep.usg.items': 'Abdomen scans may need a few hours of fasting.|Pelvis scans usually need a full bladder: drink water as instructed and avoid passing urine before the scan.',
    'prep.xray.title': 'X-ray',
    'prep.xray.items': 'Remove metal objects, jewellery and belts from the area being imaged.|Tell our staff if you are or might be pregnant.',
    'prep.bring.title': 'What to bring',
    'prep.bring.items': 'Your doctor’s prescription or referral slip|A photo ID|Previous reports, films or CDs, if any',

    /* ---------- Contact ---------- */
    'contact.hero.eyebrow': 'Contact',
    'contact.hero.title': 'Visit us or book an appointment.',
    'contact.hero.sub': 'Two branches, open all days. Emergency services available 24 hours.',
    'contact.branches.title': 'Our branches',
    'contact.tabs': 'Choose a branch',
    'contact.mapTitle': 'Map showing Aksharam Diagnostics',
    'contact.other': 'Other line',
    'form.title': 'Request an appointment',
    'form.sub': 'Fill in the form and we will open WhatsApp with your request ready to send.',
    'form.name': 'Patient name',
    'form.mobile': 'Mobile number',
    'form.mobileHint': '10-digit mobile number, +91 optional',
    'form.age': 'Age',
    'form.branch': 'Branch',
    'form.test': 'Test required',
    'form.date': 'Preferred date',
    'form.slot': 'Preferred time',
    'form.referrer': 'Referring doctor',
    'form.message': 'Message',
    'form.optional': 'optional',
    'form.choose': 'Select…',
    'form.notSure': 'Not sure / other',
    'slot.morning': 'Morning',
    'slot.afternoon': 'Afternoon',
    'slot.evening': 'Evening',
    'form.privacy': 'Please don’t share medical reports or sensitive details here; our team will guide you on call.',
    'form.submit': 'Send request on WhatsApp',
    'form.required': 'Fields marked * are required.',
    'err.name': 'Please enter the patient’s name.',
    'err.mobile': 'Please enter a valid 10-digit mobile number.',
    'err.age': 'Please enter an age between 0 and 120.',
    'err.branch': 'Please choose a branch.',
    'err.test': 'Please choose a test.',
    'err.date': 'Please choose today or a later date.',
    'err.slot': 'Please choose a time.',
    'form.success.title': 'Your request is ready in WhatsApp — just tap Send.',
    'form.success.text': 'For emergencies, please call us directly.',
    'form.success.again': 'Open WhatsApp again',

    /* WhatsApp message (sent to the clinic) */
    'wa.title': 'New Appointment Request – Aksharam Diagnostics Website',
    'wa.patient': 'Patient',
    'wa.mobile': 'Mobile',
    'wa.age': 'Age',
    'wa.branch': 'Branch',
    'wa.test': 'Test',
    'wa.preferred': 'Preferred',
    'wa.referred': 'Referred by',
    'wa.message': 'Message',
    'wa.hello': 'Hello, I would like to enquire about a test at Aksharam Diagnostics.'
  },

  gu: {
    'meta.home.title': 'અક્ષરમ્ ડાયગ્નોસ્ટિક્સ | વિરમગામ અને સાઉથ બોપલમાં સીટી સ્કેન, એક્સ-રે અને સોનોગ્રાફી',
    'meta.about.title': 'અમારા વિશે અને અમારા રેડિયોલોજિસ્ટ | અક્ષરમ્ ડાયગ્નોસ્ટિક્સ',
    'meta.services.title': 'સીટી સ્કેન, ડિજિટલ એક્સ-રે, સોનોગ્રાફી અને કલર ડોપ્લર | અક્ષરમ્ ડાયગ્નોસ્ટિક્સ',
    'meta.contact.title': 'સંપર્ક અને એપોઇન્ટમેન્ટ | અક્ષરમ્ ડાયગ્નોસ્ટિક્સ, વિરમગામ અને સાઉથ બોપલ',

    'skip': 'મુખ્ય માહિતી પર જાઓ',
    'nav.home': 'હોમ',
    'nav.about': 'અમારા વિશે',
    'nav.services': 'સેવાઓ',
    'nav.contact': 'સંપર્ક',
    'nav.book': 'એપોઇન્ટમેન્ટ બુક કરો',
    'nav.menu': 'મેનુ ખોલો',
    'nav.close': 'મેનુ બંધ કરો',
    'nav.main': 'મુખ્ય નેવિગેશન',
    'lang.switch': 'ભાષા અંગ્રેજીમાં બદલો',
    'top.emergency': '૨૪ કલાક ઇમરજન્સી સેવા',

    'cta.book': 'એપોઇન્ટમેન્ટ બુક કરો',
    'cta.call': 'હમણાં કૉલ કરો',
    'cta.whatsapp': 'વોટ્સએપ કરો',
    'cta.directions': 'રસ્તો જુઓ',
    'cta.learn': 'વધુ જાણો',
    'cta.bookTest': 'આ તપાસ બુક કરો',
    'cta.allServices': 'બધી સેવાઓ જુઓ',
    'cta.aboutUs': 'અમારા વિશે વધુ',

    'fab.whatsapp': 'વોટ્સએપ પર વાત કરો',
    'fab.call': 'કૉલ',
    'fab.callLabel': 'ઇમરજન્સી માટે અમને કૉલ કરો',

    'common.timings': 'સમય',
    'common.phone': 'ફોન',
    'common.address': 'સરનામું',
    'common.emergency24': 'ઇમરજન્સી સેવા ૨૪ કલાક ઉપલબ્ધ',
    'common.emergencyNote': 'ઇમરજન્સી સેવા ૨૪ કલાક ઉપલબ્ધ છે. આવતા પહેલાં કૃપા કરી કૉલ કરો.',
    'common.wheelchair': 'વ્હીલચેર માટે સુગમ પ્રવેશ',
    'common.parking': 'પાર્કિંગની સુવિધા',
    'common.callBranch': 'કૉલ',
    'common.opensNewTab': '(ગૂગલ મેપ્સ ખુલશે)',

    'pcpndt.title': 'PC&PNDT સૂચના',
    'pcpndt.text': PCPNDT_GU,

    'footer.desc': 'વિરમગામ અને સાઉથ બોપલ, અમદાવાદમાં ડાયગ્નોસ્ટિક ઇમેજિંગ સેન્ટર: સીટી સ્કેન, ડિજિટલ એક્સ-રે, સોનોગ્રાફી અને કલર ડોપ્લર.',
    'footer.quick': 'ઝડપી લિંક્સ',
    'footer.branches': 'અમારી શાખાઓ',
    'footer.contact': 'સંપર્ક',
    'footer.disclaimer': 'આ વેબસાઇટ પરની માહિતી ફક્ત સામાન્ય જાણકારી માટે છે. કૃપા કરી તમારા ડૉક્ટરની સલાહ મુજબ જ આગળ વધો.',
    'footer.rights': 'સર્વ હક્ક સુરક્ષિત.',

    /* ---------- ફોટોગ્રાફી, સીન ઓવરલે, મીડિયા ક્રેડિટ (ઉમેરેલ) ---------- */
    'photo.representative': 'પ્રતીકાત્મક તસવીર',
    'scene.report.title': 'રિપોર્ટ તૈયાર',
    'scene.report.sub': 'લાયકાત ધરાવતા રેડિયોલોજિસ્ટ દ્વારા તૈયાર',
    'footer.credits': 'તસવીર અને મીડિયા ક્રેડિટ',
    'footer.creditsIntro': 'આ વેબસાઇટ પરની તસવીરો પ્રતીકાત્મક છે. મેડિકલ ઇમેજ જાહેર, ઓપન-લાઇસન્સ ડેટામાંથી લેવામાં આવી છે.',
    'fac.waiting': 'પ્રતીક્ષા વિસ્તાર',
    'img.svc.ct': 'તેજસ્વી સ્કેન રૂમમાં પેશન્ટ ટેબલ સાથેનું સીટી સ્કેનર',
    'img.svc.xray': 'છત પર લગાવેલી ટ્યુબ અને વૉલ સ્ટેન્ડ સાથેનો ડિજિટલ એક્સ-રે રૂમ',
    'img.svc.usg': 'મોનિટર અને કંટ્રોલ પેનલ સાથેનું સોનોગ્રાફી મશીન',
    'img.svc.usg34d': 'સોનોગ્રાફી મશીનની કંટ્રોલ પેનલ અને ટ્રેકબૉલનું નજીકનું દૃશ્ય',
    'img.svc.doppler': 'સોનોગ્રાફી સ્ક્રીન પર ધમનીની કલર ડોપ્લર ઇમેજ',
    'img.hero.about': 'બેઠક વ્યવસ્થા સાથેનો તેજસ્વી પ્રતીક્ષા વિસ્તાર',
    'img.hero.services': 'સ્કેનર અને પેશન્ટ ટેબલ સાથેનો સીટી સ્કેન રૂમ',
    'img.hero.contact': 'પ્રકાશિત, વિશાળ પ્રતીક્ષા વિસ્તાર',
    'img.fac.ct': 'સીટી સ્કેનર રૂમ',
    'img.fac.usg': 'હોલ્ડરમાં રાખેલા સોનોગ્રાફી પ્રોબ',
    'img.fac.waiting': 'પ્રતીક્ષા વિસ્તારની બેઠકો',

    'svc.ct.name': 'એમ.ડી. સીટી સ્કેન (૧૬ સ્લાઇસ)',
    'svc.ct.short': 'HRCT ચેસ્ટ સહિત ઝડપી અને વિગતવાર ક્રોસ-સેક્શનલ ઇમેજિંગ.',
    'svc.xray.name': 'ડિજિટલ એક્સ-રે',
    'svc.xray.short': 'છાતી, હાડકાં અને સાંધાના ઝડપી, સ્પષ્ટ એક્સ-રે.',
    'svc.usg.name': 'સોનોગ્રાફી',
    'svc.usg.short': 'પેટ, પેડુ અને ગર્ભાવસ્થાની સોનોગ્રાફી, રેડિયેશન વિના.',
    'svc.usg34d.name': '3D / 4D સોનોગ્રાફી',
    'svc.usg34d.short': 'ગર્ભના અંગોની વિગતવાર તપાસ.',
    'svc.doppler.name': 'કલર ડોપ્લર',
    'svc.doppler.short': 'ધમનીઓ અને શિરાઓમાં લોહીના પ્રવાહની તપાસ.',
    'svc.path.name': 'પેથોલોજી લેબોરેટરી',
    'svc.path.short': 'લોહીની તપાસ, હોર્મોન પ્રોફાઇલ અને બાયોકેમિસ્ટ્રી.',

    'hero.eyebrow': 'રેડિયોલોજી અને ડાયગ્નોસ્ટિક ઇમેજિંગ',
    'hero.title': 'સ્પષ્ટ તપાસ, પૂરા વિશ્વાસ સાથે.',
    'hero.sub': 'વિરમગામ અને સાઉથ બોપલમાં આધુનિક સીટી સ્કેન, એક્સ-રે અને સોનોગ્રાફી. ઇમરજન્સી સેવા ૨૪ કલાક ઉપલબ્ધ.',
    'hero.scroll': 'સ્કેન કેવી રીતે થાય છે તે જોવા નીચે સ્ક્રોલ કરો',

    'story.prep.kicker': 'પગલું ૧ · સ્કેનની તૈયારી',
    'story.prep.title': 'શાંત, આરામદાયક અને ઝડપી.',
    'story.prep.text': 'શરૂઆત પહેલાં અમારો તાલીમબદ્ધ સ્ટાફ દરેક પગલું સમજાવે છે અને સ્કેન ટેબલ પર આરામથી ગોઠવાવામાં મદદ કરે છે. મોટાભાગના સ્કેન થોડી જ મિનિટોમાં પૂરા થાય છે, અને સ્ટાફ હંમેશાં તમારી નજીક રહે છે.',
    'story.scan.kicker': 'પગલું ૨ · સ્કેનિંગ',
    'story.scan.title': '૧૬-સ્લાઇસ MDCT, HRCT ચેસ્ટ સહિત.',
    'story.scan.text': 'અમારું ૧૬-સ્લાઇસ મલ્ટી-ડિટેક્ટર સીટી સ્કેનર થોડી જ સેકન્ડોમાં શરીરની બારીક ક્રોસ-સેક્શનલ ઇમેજ લે છે. તમારા ડૉક્ટરની સલાહ મુજબ છાતીના હાઇ-રિઝોલ્યુશન સીટી (HRCT) સહિત અનેક પ્રકારની તપાસ તેનાથી થઈ શકે છે.',
    'story.slices.kicker': 'પગલું ૩ · સ્લાઇસમાંથી ઇમેજ',
    'story.slices.title': 'વિગતવાર ઇમેજ, લાયકાત ધરાવતા રેડિયોલોજિસ્ટ દ્વારા વાંચન.',
    'story.slices.text': 'દરેક પાતળી સ્લાઇસ મળીને એક વિગતવાર ચિત્ર બને છે. અમારા રેડિયોલોજિસ્ટ ઇમેજનો કાળજીપૂર્વક અભ્યાસ કરી તમારા ડૉક્ટર માટે સ્પષ્ટ રિપોર્ટ તૈયાર કરે છે.',
    'story.us.kicker': 'પગલું ૪ · સોનોગ્રાફી',
    'story.us.title': 'સોનોગ્રાફી, 3D/4D અને કલર ડોપ્લર.',
    'story.us.text': 'સોનોગ્રાફીમાં રેડિયેશન નહીં, પણ ધ્વનિ તરંગોનો ઉપયોગ થાય છે. અમે પેટ, પેડુ અને ગર્ભાવસ્થાની સોનોગ્રાફી, ગર્ભના અંગોની વિગતવાર તપાસ માટે 3D/4D સોનોગ્રાફી તથા લોહીના પ્રવાહની તપાસ માટે કલર ડોપ્લર કરીએ છીએ.',
    'story.report.kicker': 'પગલું ૫ · રિપોર્ટ તૈયાર',
    'story.report.title': 'તમારો રિપોર્ટ, લાંબી રાહ વિના.',
    'story.report.text': 'અમે રિપોર્ટ શક્ય એટલો જલદી આપવાનો પ્રયાસ કરીએ છીએ, અને તમારો રિપોર્ટ ક્યારે મળશે તે અમારી ટીમ તમને જણાવશે. તાત્કાલિક અને ઇમરજન્સી કેસને પ્રાથમિકતા આપવામાં આવે છે.',

    'home.services.title': 'અમારી સેવાઓ',
    'home.services.sub': 'ઘરની નજીક, એક જ જગ્યાએ આધુનિક ડાયગ્નોસ્ટિક ઇમેજિંગ.',
    'why.title': 'અક્ષરમ્ શા માટે',
    'why.sub': 'કાળજીપૂર્વક તપાસ, સ્પષ્ટ માર્ગદર્શન અને જરૂર પડે ત્યારે મદદ.',
    'why.doctors.title': 'લાયકાત ધરાવતા રેડિયોલોજિસ્ટ',
    'why.doctors.text': 'તમારી ઇમેજ અમારા રેડિયોલોજિસ્ટ તપાસે છે: એક એમ.ડી. (રેડિયોલોજી) અને એક ડી.એમ.આર.ઈ. (રેડિયોલોજી).',
    'why.ct.title': 'આધુનિક ૧૬-સ્લાઇસ સીટી',
    'why.ct.text': 'ઝડપી અને વિગતવાર ઇમેજિંગ માટે મલ્ટી-ડિટેક્ટર સીટી, સાથે ડિજિટલ એક્સ-રે અને કલર ડોપ્લર.',
    'why.emergency.title': '૨૪ કલાક ઇમરજન્સી ઇમેજિંગ',
    'why.emergency.text': 'ઇમરજન્સી સેવા દિવસ-રાત ઉપલબ્ધ છે. આવતા પહેલાં કૉલ કરશો તો અમે તૈયારી રાખી શકીશું.',
    'why.branches.title': 'બે અનુકૂળ શાખાઓ',
    'why.branches.text': 'વિરમગામ અને સાઉથ બોપલ, અમદાવાદ, જેથી આધુનિક તપાસ ઘરની નજીક મળે.',
    'doctors.title': 'અમારા ડૉક્ટર્સ',
    'doctors.sub': 'દરેક રિપોર્ટ લાયકાત ધરાવતા રેડિયોલોજિસ્ટ દ્વારા તૈયાર થાય છે.',
    'doctors.role': 'કન્સલ્ટન્ટ રેડિયોલોજિસ્ટ',
    'branches.title': 'અમારી શાખાઓ',
    'branches.sub': 'તમારી નજીકની શાખાની મુલાકાત લો. બંને શાખાઓ દરરોજ ખુલ્લી રહે છે.',
    'strip.title': 'આજે જ સ્કેન કરાવવો છે? અમને કૉલ કરો અથવા વોટ્સએપ કરો.',
    'strip.text': 'અમારી ટીમ તમને સમય નક્કી કરવામાં અને જરૂરી તૈયારી સમજવામાં મદદ કરશે.',

    'about.hero.eyebrow': 'અમારા વિશે',
    'about.hero.title': 'સચોટ તપાસ, કાળજી સાથે.',
    'about.hero.sub': 'વિરમગામ, આસપાસનાં ગામો અને હવે સાઉથ બોપલ, અમદાવાદના દર્દીઓની સેવામાં ડાયગ્નોસ્ટિક ઇમેજિંગ સેન્ટર.',
    'about.intro.title': 'અક્ષરમ્ ડાયગ્નોસ્ટિક્સ વિશે',
    'about.p1': 'અક્ષરમ્ ડાયગ્નોસ્ટિક્સ વિરમગામમાં આવેલું રેડિયોલોજી અને ડાયગ્નોસ્ટિક ઇમેજિંગ સેન્ટર છે, જે શહેર અને આસપાસનાં ગામોના દર્દીઓની સેવા કરે છે. હવે અમે સાઉથ બોપલ, અમદાવાદની અમારી શાખામાં પણ દર્દીઓને આવકારીએ છીએ.',
    'about.p2': 'અમારું ધ્યેય સરળ છે: સચોટ ઇમેજિંગ અને કાળજીભરી સેવા. ૧૬-સ્લાઇસ MDCT સ્કેનર, ડિજિટલ એક્સ-રે, સોનોગ્રાફી અને કલર ડોપ્લર સાથે અમે આધુનિક તપાસ સ્થાનિક સ્તરે ઉપલબ્ધ કરાવવા માંગીએ છીએ, જેથી ડૉક્ટરે સૂચવેલી તપાસ માટે પરિવારોને દૂર જવું ન પડે.',
    'about.p3': 'દરેક તપાસ લાયકાત ધરાવતા રેડિયોલોજિસ્ટ દ્વારા જોવામાં આવે છે. આવો ત્યારથી રિપોર્ટ મળે ત્યાં સુધી અમારી ટીમ તૈયારી સમજાવે છે, તમારા પ્રશ્નોના જવાબ આપે છે અને તમને આરામદાયક અનુભવ કરાવે છે.',
    'about.doctors.title': 'અમારા રેડિયોલોજિસ્ટ',
    'about.doctors.sub': 'તમારી ઇમેજ તપાસીને રિપોર્ટ તૈયાર કરનાર ડૉક્ટર્સ.',
    'about.doc.nirmal.line': 'સીટી, એક્સ-રે, સોનોગ્રાફી અને કલર ડોપ્લરના રિપોર્ટ કરે છે, અને રેફર કરનાર ડૉક્ટર માટે સ્પષ્ટ અને કાળજીપૂર્વકના રિપોર્ટ પર ખાસ ધ્યાન આપે છે.',
    'about.doc.bipin.line': 'સીટી, એક્સ-રે અને સોનોગ્રાફીના રિપોર્ટ કરે છે, અને દર્દીઓને ધીરજ અને કાળજી સાથે સ્કેન દરમિયાન માર્ગદર્શન આપે છે.',
    'about.mission.title': 'અમારું મિશન',
    'about.mission.text': 'દર્દીઓના ઘરની નજીક, માયાળુ અને આદરભર્યા વ્યવહાર સાથે સચોટ અને સમયસર ડાયગ્નોસ્ટિક ઇમેજિંગ પૂરું પાડવું.',
    'about.vision.title': 'અમારું વિઝન',
    'about.vision.text': 'એવો સમાજ જ્યાં દરેક પરિવારને લાંબી મુસાફરી કે લાંબી રાહ વિના વિશ્વસનીય, આધુનિક તપાસ મળી શકે.',
    'about.values.title': 'અમારાં મૂલ્યો',
    'value.accuracy.title': 'સચોટતા',
    'value.accuracy.text': 'દરેક વખતે કાળજીપૂર્વકની પદ્ધતિ અને કાળજીપૂર્વકનું વાંચન.',
    'value.compassion.title': 'કરુણા',
    'value.compassion.text': 'આવનાર દરેક વ્યક્તિ માટે શાંત અને ધીરજભરી સંભાળ.',
    'value.access.title': 'સુલભતા',
    'value.access.text': 'ઘરની નજીક આધુનિક તપાસ, વ્હીલચેર માટે સુગમ પ્રવેશ અને પાર્કિંગ સાથે.',
    'value.integrity.title': 'પ્રામાણિકતા',
    'value.integrity.text': 'સાચું માર્ગદર્શન, સ્પષ્ટ માહિતી અને કાયદાનું સંપૂર્ણ પાલન.',
    'about.facilities.title': 'સુવિધાઓ',
    'about.facilities.sub': 'અક્ષરમ્ ડાયગ્નોસ્ટિક્સમાં ઉપલબ્ધ સુવિધાઓ.',
    'fac.ct': '૧૬-સ્લાઇસ MDCT સ્કેનર',
    'fac.xray': 'ડિજિટલ એક્સ-રે',
    'fac.usg': 'કલર ડોપ્લર સાથે સોનોગ્રાફી',
    'fac.wheelchair': 'વ્હીલચેર માટે સુગમ પ્રવેશ',
    'fac.parking': 'પાર્કિંગની સુવિધા',
    'fac.emergency': '૨૪ કલાક ઇમરજન્સી ઇમેજિંગ',

    'services.hero.eyebrow': 'સેવાઓ',
    'services.hero.title': 'ડાયગ્નોસ્ટિક ઇમેજિંગ, સરળ ભાષામાં.',
    'services.hero.sub': 'દરેક તપાસ શું છે, ડૉક્ટર સામાન્ય રીતે ક્યારે સૂચવે છે, કેટલો સમય લાગે છે અને કેવી તૈયારી કરવી.',
    'services.what': 'આ શું છે',
    'services.uses': 'સામાન્ય ઉપયોગ',
    'services.duration': 'અંદાજિત સમય',
    'services.jump': 'સેવા પસંદ કરો',

    'svc.ct.what': 'સીટી (કમ્પ્યુટેડ ટોમોગ્રાફી) સ્કેનમાં એક્સ-રે અને કમ્પ્યુટરની મદદથી શરીરની વિગતવાર ક્રોસ-સેક્શનલ ઇમેજ બને છે. અમારું ૧૬-સ્લાઇસ મલ્ટી-ડિટેક્ટર સીટી (MDCT) આ ઇમેજ ઝડપથી લે છે, જેથી સ્કેન ટૂંકો અને આરામદાયક રહે.',
    'svc.ct.uses': 'ઈજા પછી અથવા તીવ્ર માથાના દુખાવા જેવાં લક્ષણોમાં, ડૉક્ટરની સલાહ મુજબ માથાનો સ્કેન|ફેફસાંની વિગતવાર તપાસ માટે છાતીનો HRCT (હાઇ-રિઝોલ્યુશન સીટી)|પેટ અને પેડુનો સ્કેન|કરોડરજ્જુ, સાંધા અને હાડકાંની વિગતવાર તપાસ',
    'svc.ct.duration': 'સામાન્ય રીતે ટેબલ પર ૫–૧૫ મિનિટ; કોન્ટ્રાસ્ટ ઇન્જેક્શન જરૂરી હોય તો થોડો વધુ સમય.',
    'svc.xray.what': 'ડિજિટલ એક્સ-રેમાં નિયંત્રિત, ઓછા પ્રમાણના રેડિયેશનથી ફિલ્મ વગર સીધી કમ્પ્યુટર પર સ્પષ્ટ ઇમેજ મળે છે.',
    'svc.xray.uses': 'છાતીનો એક્સ-રે|ઈજા કે દુખાવા વખતે હાડકાં અને સાંધા|કરોડરજ્જુ અને સાઇનસ|ડૉક્ટરે સૂચવેલી નિયમિત તપાસ',
    'svc.xray.duration': 'થોડી મિનિટો.',
    'svc.usg.what': 'સોનોગ્રાફી (અલ્ટ્રાસાઉન્ડ)માં હાઇ-ફ્રીક્વન્સી ધ્વનિ તરંગોથી શરીરના અવયવો અને નરમ પેશીઓ તરત જ જોઈ શકાય છે. તેમાં રેડિયેશનનો ઉપયોગ થતો નથી.',
    'svc.usg.uses': 'પેટ: લિવર, પિત્તાશય, સ્વાદુપિંડ અને કિડની|પેડુ: મૂત્રાશય, ગર્ભાશય, અંડાશય અને પ્રોસ્ટેટ|ડૉક્ટરની સલાહ મુજબ ગર્ભાવસ્થા દરમિયાનની સોનોગ્રાફી',
    'svc.usg.duration': 'આશરે ૧૫–૩૦ મિનિટ.',
    'svc.usg34d.what': '3D/4D સોનોગ્રાફીમાં ત્રિ-પરિમાણીય ઇમેજ બને છે, અને 4D તેને તરત જ ગતિમાં બતાવે છે. અમે તેનો ઉપયોગ ફક્ત ડૉક્ટરની સલાહ મુજબ ગર્ભના અંગોની વિગતવાર તપાસ માટે કરીએ છીએ.',
    'svc.usg34d.uses': 'ગર્ભના અંગોની વિગતવાર તપાસ|સામાન્ય રીતે ગર્ભાવસ્થાના ચોક્કસ તબક્કે ડૉક્ટર દ્વારા સૂચવવામાં આવે છે',
    'svc.usg34d.duration': 'આશરે ૩૦–૪૫ મિનિટ.',
    'svc.doppler.what': 'કલર ડોપ્લર એક પ્રકારની સોનોગ્રાફી છે, જે ધમનીઓ અને શિરાઓમાં લોહીના પ્રવાહની દિશા અને ઝડપ રંગોમાં બતાવે છે.',
    'svc.doppler.uses': 'પગની શિરાઓ અને ધમનીઓ, જેમ કે સોજો કે દુખાવો હોય ત્યારે|ગળાની (કેરોટિડ) ધમનીઓ|ડૉક્ટરની સલાહ મુજબ ગર્ભાવસ્થા દરમિયાન લોહીના પ્રવાહની તપાસ માટે ઓબ્સ્ટેટ્રિક ડોપ્લર',
    'svc.doppler.duration': 'તપાસના ભાગ પ્રમાણે આશરે ૨૦–૪૦ મિનિટ.',
    'svc.path.what': 'અમારી પેથોલોજી લેબોરેટરી ડૉક્ટરના નિદાનમાં મદદરૂપ થવા લોહી અને અન્ય નમૂનાઓની તપાસ કરે છે.',
    'svc.path.uses': 'કમ્પ્લીટ બ્લડ કાઉન્ટ અને બ્લડ સુગર જેવી નિયમિત તપાસ|થાઇરોઇડ જેવી હોર્મોન પ્રોફાઇલ|કિડની અને લિવર ફંક્શન જેવી બાયોકેમિસ્ટ્રી તપાસ',
    'svc.path.duration': 'નમૂનો લેવામાં થોડી મિનિટો લાગે છે.',

    'prep.title': 'દર્દી માટે તૈયારી માર્ગદર્શિકા',
    'prep.sub': 'તપાસ માટે તૈયાર થવામાં મદદરૂપ સામાન્ય માર્ગદર્શન.',
    'prep.note': 'આ સામાન્ય સૂચનાઓ છે. બુકિંગ વખતે અમારી ટીમ તમને ચોક્કસ સૂચનાઓ જણાવશે.',
    'prep.ct.title': 'કોન્ટ્રાસ્ટ સાથે સીટી સ્કેન',
    'prep.ct.items': 'સ્કેન પહેલાં થોડા કલાક કંઈ ન ખાવાનું કહેવામાં આવી શકે છે.|જૂના રિપોર્ટ સાથે લાવો, અને ડૉક્ટરે કહ્યું હોય તો કિડની ફંક્શન ટેસ્ટ (ક્રિએટિનિન) પણ લાવો.|કોઈ એલર્જી, ડાયાબિટીસની દવા હોય, કે તમે ગર્ભવતી હો અથવા હોવાની શક્યતા હોય તો સ્ટાફને જણાવો.',
    'prep.usg.title': 'પેટ / પેડુની સોનોગ્રાફી',
    'prep.usg.items': 'પેટની સોનોગ્રાફી માટે થોડા કલાક ભૂખ્યા રહેવાની જરૂર પડી શકે છે.|પેડુની સોનોગ્રાફી માટે સામાન્ય રીતે મૂત્રાશય ભરેલું હોવું જોઈએ: સૂચના મુજબ પાણી પીવો અને સ્કેન પહેલાં પેશાબ ન કરો.',
    'prep.xray.title': 'એક્સ-રે',
    'prep.xray.items': 'જે ભાગનો એક્સ-રે લેવાનો હોય ત્યાંથી ધાતુની વસ્તુઓ, દાગીના અને બેલ્ટ કાઢી નાખો.|તમે ગર્ભવતી હો અથવા હોવાની શક્યતા હોય તો સ્ટાફને જણાવો.',
    'prep.bring.title': 'સાથે શું લાવવું',
    'prep.bring.items': 'ડૉક્ટરનું પ્રિસ્ક્રિપ્શન અથવા રેફરલ ચિઠ્ઠી|ફોટો ઓળખપત્ર|જૂના રિપોર્ટ, ફિલ્મ કે સીડી, જો હોય તો',

    'contact.hero.eyebrow': 'સંપર્ક',
    'contact.hero.title': 'મુલાકાત લો અથવા એપોઇન્ટમેન્ટ બુક કરો.',
    'contact.hero.sub': 'બે શાખાઓ, દરરોજ ખુલ્લી. ઇમરજન્સી સેવા ૨૪ કલાક ઉપલબ્ધ.',
    'contact.branches.title': 'અમારી શાખાઓ',
    'contact.tabs': 'શાખા પસંદ કરો',
    'contact.mapTitle': 'અક્ષરમ્ ડાયગ્નોસ્ટિક્સનો નકશો',
    'contact.other': 'અન્ય નંબર',
    'form.title': 'એપોઇન્ટમેન્ટની વિનંતી',
    'form.sub': 'ફોર્મ ભરો, અમે તમારી વિનંતી સાથે વોટ્સએપ ખોલી આપીશું, ફક્ત મોકલવાનું રહેશે.',
    'form.name': 'દર્દીનું નામ',
    'form.mobile': 'મોબાઇલ નંબર',
    'form.mobileHint': '૧૦ અંકનો મોબાઇલ નંબર, +91 વૈકલ્પિક',
    'form.age': 'ઉંમર',
    'form.branch': 'શાખા',
    'form.test': 'કઈ તપાસ',
    'form.date': 'પસંદગીની તારીખ',
    'form.slot': 'પસંદગીનો સમય',
    'form.referrer': 'રેફર કરનાર ડૉક્ટર',
    'form.message': 'સંદેશ',
    'form.optional': 'વૈકલ્પિક',
    'form.choose': 'પસંદ કરો…',
    'form.notSure': 'ખાતરી નથી / અન્ય',
    'slot.morning': 'સવાર',
    'slot.afternoon': 'બપોર',
    'slot.evening': 'સાંજ',
    'form.privacy': 'કૃપા કરી અહીં મેડિકલ રિપોર્ટ કે ખાનગી વિગતો શેર ન કરશો; અમારી ટીમ ફોન પર માર્ગદર્શન આપશે.',
    'form.submit': 'વોટ્સએપ પર વિનંતી મોકલો',
    'form.required': '* વાળી વિગતો ફરજિયાત છે.',
    'err.name': 'કૃપા કરી દર્દીનું નામ લખો.',
    'err.mobile': 'કૃપા કરી ૧૦ અંકનો સાચો મોબાઇલ નંબર લખો.',
    'err.age': 'કૃપા કરી ૦ થી ૧૨૦ વચ્ચેની ઉંમર લખો.',
    'err.branch': 'કૃપા કરી શાખા પસંદ કરો.',
    'err.test': 'કૃપા કરી તપાસ પસંદ કરો.',
    'err.date': 'કૃપા કરી આજની કે પછીની તારીખ પસંદ કરો.',
    'err.slot': 'કૃપા કરી સમય પસંદ કરો.',
    'form.success.title': 'તમારી વિનંતી વોટ્સએપમાં તૈયાર છે — ફક્ત Send દબાવો.',
    'form.success.text': 'ઇમરજન્સી માટે કૃપા કરી અમને સીધો કૉલ કરો.',
    'form.success.again': 'વોટ્સએપ ફરી ખોલો',

    'wa.title': 'નવી એપોઇન્ટમેન્ટ વિનંતી – અક્ષરમ્ ડાયગ્નોસ્ટિક્સ વેબસાઇટ',
    'wa.patient': 'દર્દી',
    'wa.mobile': 'મોબાઇલ',
    'wa.age': 'ઉંમર',
    'wa.branch': 'શાખા',
    'wa.test': 'તપાસ',
    'wa.preferred': 'પસંદગી',
    'wa.referred': 'રેફર કરનાર',
    'wa.message': 'સંદેશ',
    'wa.hello': 'નમસ્તે, મારે અક્ષરમ્ ડાયગ્નોસ્ટિક્સમાં તપાસ વિશે પૂછપરછ કરવી છે.'
  }
};

const STORAGE_KEY = 'aksharam-lang';
const LANGS = ['en', 'gu'];

export function getLang() {
  const l = document.documentElement.getAttribute('lang');
  return LANGS.includes(l) ? l : 'en';
}

export function storedLang() {
  try {
    const l = localStorage.getItem(STORAGE_KEY);
    return LANGS.includes(l) ? l : 'en';
  } catch (e) {
    return 'en';
  }
}

export function t(key, lang = getLang()) {
  const v = dict[lang] && dict[lang][key];
  if (v !== undefined) return v;
  return dict.en[key] !== undefined ? dict.en[key] : key;
}

/** List value stored as "a|b|c". */
export function tList(key, lang = getLang()) {
  return t(key, lang).split('|');
}

/** Pick the current language from a { en, gu } object. */
export function L(obj, lang = getLang()) {
  if (obj == null) return '';
  if (typeof obj === 'string') return obj;
  return obj[lang] || obj.en || '';
}

export function applyI18n(root = document) {
  const lang = getLang();
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n, lang);
  });
  root.querySelectorAll('[data-i18n-html]').forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml, lang);
  });
  root.querySelectorAll('[data-i18n-list]').forEach((el) => {
    el.replaceChildren(
      ...tList(el.dataset.i18nList, lang).map((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        return li;
      })
    );
  });
  root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    el.dataset.i18nAttr.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (attr && key) el.setAttribute(attr, t(key, lang));
    });
  });
}

export function setLang(lang) {
  if (!LANGS.includes(lang)) lang = 'en';
  const html = document.documentElement;
  html.setAttribute('lang', lang);
  html.classList.toggle('lang-gu', lang === 'gu');
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch (e) {
    /* storage unavailable: language still switches for this page */
  }
  applyI18n();
  const titleKey = document.body && document.body.dataset.titleKey;
  if (titleKey) document.title = t(titleKey, lang);
  window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
}
