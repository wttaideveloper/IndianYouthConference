export const EVENT = {
  year: 2026,
  name: 'Indian Youth Conference 2026',
  tagline: 'Sealed For A Purpose',
  subtitle: 'GET READY TO GIVE YOURSELF TO CHRIST',
  dates: 'October 16–20, 2026',
  venue: 'Mount Zion Campus, Lena Vilakku, Pilivalam P.O, Thirumayam Tk, Pudukkottai, Tamil Nadu 622507',
  countdownDate: new Date('2026-10-16T00:00:00'),
  email: 'indianyouthconference@gmail.com',
  supportPhone: '+91 8123941065',
  contactSupportPhone: '+91 86304 45075',
  mapLat: 10.2972,
  mapLng: 78.7519,
  mapTitle: 'Mount Zion Campus, Pudukkottai',
}

export const SOCIAL = {
  facebook: 'https://www.facebook.com/Indian-Youth-Conference-IYC-1655147474733017',
  youtube: 'https://www.youtube.com/channel/UClhCBeLzPRr0Qgo4YNGVALg',
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
    description: 'Indian Youth Conference is a self supported ministry run by Adventist youngsters in India.',
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
  { name: 'Scotty Mayer', image: '/images/resource/scotty-mayer.jpg' },
  { name: 'Praveen Singalla', image: '/images/resource/PRAVEEN SINGALLA.jpg' },
  { name: 'Pr. Fine', image: '/images/resource/pr-fine.jpg' },
  { name: 'Pr. Fabiano', image: '/images/resource/pr-fabiano.jpg' },
  { name: 'Ronald Robin', image: '/images/resource/RONALD.jpg' },
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
    title: 'Pastors & Missionary Volunteers',
    price: 1000,
    description: 'Pastors, church workers, and missionary volunteers',
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
    answer: 'Being a youth led movement, IYC is dependent on contributions from people who are willing to empower young people to do the Lord\'s Work. Indian Youth Conference is a self supported ministry run by Adventist youngsters in India. The purpose is to help the youth grow in Christ and take an active participation in the Lord\'s work. The church leadership at Southern Asia Division has been supportive of this work.',
  },
]

export const COORDINATORS = [
  { name: 'Baphylla Sajan Lyngdoh', role: 'Core Committee', phone: '+91 8123941065' },
  { name: 'Elvin Baby John', role: 'Core Committee', phone: '+91 7012963015' },
  { name: 'Austin Navis', role: 'Core Committee', phone: '+91 9823606401' },
  { name: 'Dawn Fernandez', role: 'Core Committee', phone: '' },
  { name: 'Naveen Kumar', role: 'Core Committee', phone: '+91 9418724828' },
  { name: 'Pranith Kumar', role: 'Core Committee', phone: '+91 9618040752' },
  { name: 'Jacob Kunthara', role: 'Working Committee', phone: '+91 9809619514' },
  { name: 'Hamedon Kyrshan Nongkhlaw', role: 'Working Committee', phone: '+91 8257830018' },
  { name: 'Lavanya Kumar', role: 'Working Committee', phone: '+91 9582260980' },
  { name: 'Raja Thangamuthu', role: 'Working Committee', phone: '+91 8879005569' },
  { name: 'D. G Leonarld', role: 'Working Committee', phone: '+91 9663148491' },
  { name: 'Ronald Stephen', role: 'Working Committee', phone: '+91 9901798901' },
  { name: 'Deric Sherwin Baby', role: 'Working Committee', phone: '+91 7795353400' },
  { name: 'Akash PT', role: 'Working Committee', phone: '+91 8078311542' },
  { name: 'Christina Ann Abraham', role: 'Working Committee', phone: '+91 7349698545' },
  { name: 'Diya Ruth Varghese', role: 'Working Committee', phone: '+91 7259643871' },
  { name: 'Adia Praveen', role: 'Working Committee', phone: '+91 9845875103' },
  { name: 'Utkarsha Kamble', role: 'Working Committee', phone: '+91 7066716346' },
  { name: 'Mark Nathaniel Shankar', role: 'Working Committee', phone: '+91 8104074376' },
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