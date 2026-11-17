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

export const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'FAQs', path: '/faqs' },
  { label: 'Gallery', path: '/gallery' },
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
    description: 'The purpose is to help the youth grow in Christ and take an active participation in the Lord\'s work.',
  },
  {
    icon: '/images/icons/dream.png',
    title: 'Our Dream',
    description: 'To see young people in active ministry for Jesus and to have a deeper experience in the LORD.',
  },
  {
    icon: '/images/icons/start1.png',
    title: 'When It Started',
    description: 'The first Indian Youth Conference started in 2015',
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
    description: 'School, college, and missionary training students',
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
    description: 'For those attending only on Sabbath',
    features: [
      { text: 'Sabbath programme access', included: true },
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
    question: 'Who should attend the Conference?',
    answer: 'Young people who have a burden for lost souls and those who are seeking to have a deeper relationship with the LORD. People who have a desire to work for the LORD will find this meeting a place where they will learn new skills and ways of reaching out to others.',
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
    question: 'I cannot come for the whole meeting. Can I come on Sabbath?',
    answer: 'If you are not able to join us for the whole meeting from Wednesday to Sunday, you are welcome to join us on Sabbath. If you are planning to come on Sabbath morning and leave by Sabbath evening, you do not have to register. You can put us a word in advance and simply drop in. If you plan to come on Friday and stay overnight, you will have to register for the meetings, as we will have to arrange for your stay. People can also join us for the outreach program on Sunday.',
  },
  {
    question: 'Is this supported by the Seventh-Day Adventist Church?',
    answer: 'The meetings are arranged by young Adventist people for the Youth of the Seventh-Day Adventist Church. The church leaders are well informed and they are supportive of the meetings. IYC respects the Church Leadership and seeks to uphold the principles and doctrines of the Seventh-Day Adventist Church.',
  },
  {
    question: 'Who is funding the IYC?',
    answer: 'Being a youth led movement, IYC is dependent on contributions from people who are willing to empower young people to do the Lord\'s Work. Indian Youth Conference is an independent youth-led initiative run by young people in India. The purpose is to help the youth grow in Christ and take an active participation in the Lord\'s work. The church leadership at Southern Asia Division has been supportive of this work.',
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
    title: 'IYC 2015 - YMCA Yelagiri',
    images: ['a15', 'b15', 'c15', 'd15', 'e15', 'f15'].map((id) => `/images/gallery/${id}.jpg`),
  },
  {
    title: 'IYC 2016 - Metas Adventist International School',
    images: ['a16', 'b16', 'c16', 'd16', 'e16', 'f16'].map((id) => `/images/gallery/${id}.jpg`),
  },
  {
    title: 'SIYC 2017 - S.D.A School Kottarakara',
    images: ['a17', 'b17', 'c17', 'd17', 'e17', 'f17'].map((id) => `/images/gallery/${id}.jpg`),
  },
]