const EVENT_DETAILS = {
  name: 'Indian Youth Conference 2026',
  dates: 'October 16–20, 2026',
  venue: 'Mount Zion Campus',
  address: 'Lena Vilakku, Pilivalam P.O, Thirumayam Tk, Pudukkottai, Tamil Nadu 622507',
  contactPhone: '+91 8123941065',
}

export function getEventDetails() {
  return {
    ...EVENT_DETAILS,
    contactEmail: process.env.FROM_EMAIL || process.env.SMTP_USER || 'info@indianyouthconference.com',
  }
}
