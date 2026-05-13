export interface Airline {
  iata: string
  name: string
}

export const AIRLINES: Airline[] = [
  { iata: 'AA', name: 'American Airlines' },
  { iata: 'DL', name: 'Delta Air Lines' },
  { iata: 'UA', name: 'United Airlines' },
  { iata: 'WN', name: 'Southwest Airlines' },
  { iata: 'B6', name: 'JetBlue Airways' },
  { iata: 'AS', name: 'Alaska Airlines' },
  { iata: 'NK', name: 'Spirit Airlines' },
  { iata: 'F9', name: 'Frontier Airlines' },
  { iata: 'G4', name: 'Allegiant Air' },
  { iata: 'SY', name: 'Sun Country Airlines' },
  { iata: 'HA', name: 'Hawaiian Airlines' },
  { iata: 'BA', name: 'British Airways' },
  { iata: 'VS', name: 'Virgin Atlantic' },
  { iata: 'LH', name: 'Lufthansa' },
  { iata: 'AF', name: 'Air France' },
  { iata: 'KL', name: 'KLM Royal Dutch Airlines' },
  { iata: 'IB', name: 'Iberia' },
  { iata: 'AZ', name: 'ITA Airways' },
  { iata: 'SK', name: 'Scandinavian Airlines' },
  { iata: 'LX', name: 'Swiss International Air Lines' },
  { iata: 'OS', name: 'Austrian Airlines' },
  { iata: 'TK', name: 'Turkish Airlines' },
  { iata: 'EK', name: 'Emirates' },
  { iata: 'EY', name: 'Etihad Airways' },
  { iata: 'QR', name: 'Qatar Airways' },
  { iata: 'SQ', name: 'Singapore Airlines' },
  { iata: 'CX', name: 'Cathay Pacific' },
  { iata: 'JL', name: 'Japan Airlines' },
  { iata: 'NH', name: 'All Nippon Airways' },
  { iata: 'KE', name: 'Korean Air' },
  { iata: 'OZ', name: 'Asiana Airlines' },
  { iata: 'CA', name: 'Air China' },
  { iata: 'MU', name: 'China Eastern Airlines' },
  { iata: 'CZ', name: 'China Southern Airlines' },
  { iata: 'AI', name: 'Air India' },
  { iata: 'AC', name: 'Air Canada' },
  { iata: 'AM', name: 'Aeroméxico' },
  { iata: 'LA', name: 'LATAM Airlines' },
  { iata: 'AV', name: 'Avianca' },
  { iata: 'CM', name: 'Copa Airlines' },
  { iata: 'QF', name: 'Qantas' },
  { iata: 'NZ', name: 'Air New Zealand' },
  { iata: 'SA', name: 'South African Airways' },
  { iata: 'ET', name: 'Ethiopian Airlines' },
  { iata: 'MS', name: 'EgyptAir' },
  { iata: 'RJ', name: 'Royal Jordanian' },
  { iata: 'LY', name: 'El Al Israel Airlines' },
  { iata: 'SU', name: 'Aeroflot' },
  { iata: 'LO', name: 'LOT Polish Airlines' },
  { iata: 'OK', name: 'Czech Airlines' },
]

export function filterAirlines(query: string): Airline[] {
  const q = query.toLowerCase().trim()
  if (!q) return AIRLINES.slice(0, 8)
  return AIRLINES.filter(
    a =>
      a.name.toLowerCase().includes(q) ||
      a.iata.toLowerCase().includes(q),
  ).slice(0, 8)
}
