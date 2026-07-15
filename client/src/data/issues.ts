export interface Issue {
  _id: string;
  votes: number;
  category: string;
  status: 'Reported' | 'In Progress' | 'Resolved';
  title: string;
  description: string;
  location: string;
  createdAt: string;
  lat: number;
  lng: number;
}

export const categories = [
  'Pothole',
  'Streetlight',
  'Garbage',
  'Graffiti',
  'Other',
] as const;

export const issues: Issue[] = [
  {
    _id: '1',
    votes: 24,
    category: 'Pothole',
    status: 'In Progress',
    title: 'Large pothole on Maple Ave',
    description: 'Deep pothole near the intersection, damaging tires.',
    location: 'Maple Ave & 5th St',
    createdAt: '2026-07-11',
    lat: 40.7580,
    lng: -73.9855,
  },
  {
    _id: '2',
    votes: 12,
    category: 'Streetlight',
    status: 'Reported',
    title: 'Streetlight out for two weeks',
    description:
      'The light on the corner has been dark, making the crosswalk unsafe at night.',
    location: 'Oak Park, north entrance',
    createdAt: '2026-07-06',
    lat: 40.7610,
    lng: -73.9780,
  },
  {
    _id: '3',
    votes: 7,
    category: 'Garbage',
    status: 'Resolved',
    title: 'Overflowing garbage bin',
    description:
      "Bins haven't been emptied; trash spilling onto sidewalk.",
    location: 'Riverside Path',
    createdAt: '2026-07-08',
    lat: 40.7550,
    lng: -73.9900,
  },
];
