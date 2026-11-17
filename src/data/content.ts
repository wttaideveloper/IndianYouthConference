export const EVENT = {
  year: 2026,
  name: 'Indian Youth Conference 2026',
  tagline: 'Sealed For A Purpose',
  subtitle: 'GET READY TO GIVE YOURSELF TO CHRIST',
  dates: 'October 16–20, 2026',
  registrationDates: { min: '2026-10-13', max: '2026-10-21' },
  venue: 'Mount Zion Campus, Lena Vilakku, Pilivalam P.O, Thirumayam Tk, Pudukkottai, Tamil Nadu 622507',
  countdownDate: new Date('2026-10-16T00:00:00'),
  email: 'indianyouthconference@gmail.com',
  mapLat: 10.2972,
  mapLng: 78.7519,
  mapTitle: 'Mount Zion Campus, Pudukkottai',
}

// Temporarily hides the Gallery page everywhere (header, mobile menu, footer links)
// and redirects /gallery to the home page. Set to true to show it again.
export const SHOW_GALLERY = false

export const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'FAQs', path: '/faqs' },
  ...(SHOW_GALLERY ? [{ label: 'Gallery', path: '/gallery' }] : []),
  { label: 'Contact', path: '/contact' },
]

export const HERO_SLIDES = [
  {
    title: 'Sealed For A Purpose',
    subtitle: 'Indian Youth Conference 2026',
    dates: 'October 16–20, 2026',
    venue: 'Mount Zion Campus, Pudukkottai, Tamil Nadu',
    image: '/images/main-slider/template-slider.jpg',
  },
  {
    title: 'GET READY TO GIVE YOURSELF TO CHRIST',
    subtitle: 'Indian Youth Conference 2026',
    dates: 'October 16–20, 2026',
    venue: 'Mount Zion Campus, Pudukkottai, Tamil Nadu',
    image: '/images/main-slider/iyc-slider1.jpg',
  },
  {
    title: 'Sealed For A Purpose',
    subtitle: 'Indian Youth Conference 2026',
    dates: 'October 16–20, 2026',
    venue: 'Mount Zion Campus, Pudukkottai, Tamil Nadu',
    image: '/images/main-slider/iyc-slider2.jpg',
  },
]

export const FEATURES = [
  {
    icon: '/images/icons/who-we.png',
    title: 'Who We Are',
    description: 'Indian Youth Conference is an independent youth-led initiative run by young people in India.',
  },
  {
    icon: '/images/icons/aim.png',
    title: 'Aim',
    description: 'Our aim is to empower young people to grow personally, develop leadership skills, discover their potential, and actively contribute to their communities and society.',
  },
  {
    icon: '/images/icons/dream.png',
    title: 'Our Dream',
    description: 'To inspire a generation of young people to make a meaningful difference in the world, live with purpose, and grow through deeper life experiences.',
  },
  {
    icon: '/images/icons/start1.png',
    title: 'Why It Started',
    description: 'IYC started with a vision to empower young people across India together, creating a platform to connect, learn, share experiences, develop leadership, and work together to make a positive difference in society.',
  },
]

export const SPEAKERS = [
  { name: 'Scotty Mayer' },
  { name: 'Praveen Singalla' },
  { name: 'Fine' },
  { name: 'Ronald Robin' },
]

export const SCHEDULE_DAYS = [
  { day: 1, date: 'October 16, 2026', weekday: 'Friday' },
  { day: 2, date: 'October 17, 2026', weekday: 'Saturday' },
  { day: 3, date: 'October 18, 2026', weekday: 'Sunday' },
  { day: 4, date: 'October 19, 2026', weekday: 'Monday' },
  { day: 5, date: 'October 20, 2026', weekday: 'Tuesday' },
]

export const PRICING_TIERS = [
  {
    title: 'Students',
    price: 1000,
    description: 'School and college students',
    features: [
      { text: 'Complete programme access', included: true },
      { text: 'Friday to Tuesday — full programme', included: true },
      { text: 'Food', included: true },
      { text: 'Accommodation', included: true },
      { text: 'Transportation not included', included: false },
    ],
    highlighted: false,
  },
  {
    title: 'Working Professionals',
    price: 1350,
    description: 'Working professionals and those who are earning',
    features: [
      { text: 'Complete programme access', included: true },
      { text: 'Friday to Tuesday — full programme', included: true },
      { text: 'Food', included: true },
      { text: 'Accommodation', included: true },
      { text: 'Transportation not included', included: false },
    ],
    highlighted: true,
  },
  {
    title: 'Weekend',
    price: 500,
    description: 'For those attending only on Saturday',
    features: [
      { text: 'Saturday programme access', included: true },
      { text: 'Food', included: true },
      { text: 'Accommodation', included: false },
      { text: 'Transportation not included', included: false },
    ],
    highlighted: false,
  },
]

export const DONATION = {
  accountName: 'Indian Youth Conference (IYC)',
  accountNo: '855020110000369',
  bank: 'Bank of India',
  ifsc: 'BKID0008550',
  micr: '680013002',
  upiId: 'boim-855030150369@boi',
  qrCode: '/images/gallery/IYC-payment-qr.png',
  qrCodeFallback: '/images/gallery/QRcode.png',
  upiNote:
    'Take screenshot of this QR Code. Open QR Code scanner in GPay/PhonePe & upload from gallery the screenshot to make payment.',
}

export const FAQS = [
  {
    question: 'Who Should Attend the Conference?',
    answer: 'Young people who are passionate about making a difference in the lives of others, seeking personal growth, and building meaningful connections. Those who wish to develop their skills, explore opportunities to serve their communities, and learn new ways of reaching out and creating a positive impact will find this conference an inspiring and enriching experience.',
  },
  {
    question: 'Is there an age limit?',
    answer: 'No. Even though there is no age limit, it is a Youth Conference and those between the age group of 17 to 35 would benefit the most. Those younger than 17 years are required to be accompanied by an older person.',
  },
  {
    question: 'I have kids, can I bring them?',
    answer: 'We do not have any special arrangement for the kids. The parents are responsible for their own kids. If you require a guest room, you should inform us beforehand. The registration fees do not cover for the guest room expenses. The expenses of the guest room will have to be borne separately. Please contact us if you need guest rooms, as they need to be booked much earlier.',
  },
  {
    question: 'I cannot attend the entire conference. Can I join for the weekend?',
    answer: 'If you are unable to attend the full conference from Wednesday to Sunday, you are welcome to join us for the weekend.\n\nIf you plan to attend only on Saturday and leave by Saturday evening, registration is not required. However, we would appreciate it if you could inform us in advance.\n\nIf you plan to arrive on Friday and stay overnight, registration is required so that we can make the necessary accommodation arrangements.',
  },
  
]

export const COORDINATORS = [
  { name: 'Baphylla Sajan Lyngdoh', role: 'Working Committee' },
  { name: 'Elvin Baby John', role: 'Working Committee' },
  { name: 'Austin Navis', role: 'Working Committee' },
  { name: 'Dawn Fernandez', role: 'Working Committee' },
  { name: 'Naveen Kumar', role: 'Working Committee' },
  { name: 'Praneeth Kumar', role: 'Working Committee' },
  { name: 'Jacob Kunthara', role: 'Working Committee' },
  { name: 'Hamedon Kyrshan Nongkhlaw', role: 'Working Committee' },
  { name: 'Lavanya Kumar', role: 'Working Committee' },
  { name: 'Raja Thangamuthu', role: 'Working Committee' },
  { name: 'Leonard D G', role: 'Working Committee' },
  { name: 'Ronald Stephen', role: 'Working Committee' },
  { name: 'Deric Sherwin Baby', role: 'Working Committee' },
  { name: 'Akash PT', role: 'Working Committee' },
  { name: 'Christina Ann Abraham', role: 'Working Committee' },
  { name: 'Diya Ruth Varghese', role: 'Working Committee' },
  { name: 'Adia Praveen', role: 'Working Committee' },
  { name: 'Utkarsha Kamble', role: 'Working Committee' },
  { name: 'Mark Nathaniel Shankar', role: 'Working Committee' },
  { name: 'Harishar', role: 'Working Committee' },
  { name: 'Hyacinth Austin', role: 'Working Committee' },
  { name: 'Jesson Patrick', role: 'Working Committee' },
  { name: 'Martin Mundu', role: 'Working Committee' },
  { name: 'Pearly', role: 'Working Committee' },
  { name: 'Santhiel Pradhan', role: 'Working Committee' },
  { name: 'Sowmya Evangelin', role: 'Working Committee' },
]

export const GALLERY_SECTIONS = [
  {
    title: 'IYC 2016 - Metas Adventist International School',
    images: ['a16', 'b16', 'c16', 'd16', 'e16', 'f16'].map((id) => `/images/gallery/${id}.jpg`),
  },
  {
    title: 'SIYC 2017 - S.D.A School Kottarakara',
    images: ['a17', 'b17', 'c17', 'd17', 'e17', 'f17'].map((id) => `/images/gallery/${id}.jpg`),
  },
]