const EVENT_DETAILS = {
  name: 'Indian Youth Conference 2026',
  dates: 'October 16–20, 2026',
  venue: 'Mount Zion Campus',
  address: 'Lena Vilakku, Pilivalam P.O, Thirumayam Tk, Pudukkottai, Tamil Nadu 622507',
  contactPhone: '+91 8123941065',
  travel: {
    heading: 'Travel Information — How to Reach the Venue',
    nearestAirport: 'Tiruchirappalli International Airport (TRZ) — ~75 km to Pudukkottai. Take a taxi/bus to Pudukkottai, then auto to Mount Zion Campus.',
    railwayStation: 'Pudukkottai Railway Station — ~12 km; Tiruchirappalli Junction (TPJ) — ~55 km. Autos/taxis available outside station.',
    busStand: 'Pudukkottai Bus Stand — ~12 km. Frequent buses from Trichy, Madurai, Chennai.',
    localTransport: 'Autos and taxis are readily available from all hubs to the venue. For pickup assistance contact +91 8123941065 / +91 86304 45075.',
  },
}

export function getEventDetails() {
  return {
    ...EVENT_DETAILS,
    contactEmail: process.env.FROM_EMAIL || process.env.SMTP_USER || 'info@indianyouthconference.com',
  }
}
