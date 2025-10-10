/**
 * TNB Grid Mock Data
 * 
 * Simulated electrical grid data for demonstration
 */

export interface GridSubstation {
  id: string;
  name: string;
  position: [number, number, number];
  voltageLevel: '500kV' | '275kV' | '132kV' | '33kV' | '11kV';
  status: 'energized' | 'de-energized' | 'maintenance' | 'fault';
  capacity_mva: number;
  current_load_mva: number;
  customers_served: number;
  type: 'main_intake' | 'primary_distribution' | 'secondary_distribution';
}

export interface GridPowerLine {
  id: string;
  from_substation_id: string;
  to_substation_id: string;
  voltageLevel: '500kV' | '275kV' | '132kV' | '33kV' | '11kV';
  status: 'energized' | 'de-energized' | 'maintenance' | 'fault';
  capacity_mva: number;
  current_load_mva: number;
  line_path: [number, number, number][];
}

export interface GridZone {
  id: string;
  name: string;
  customers: number;
  peak_load_mw: number;
  substations: string[];
}

export const mockSubstations: GridSubstation[] = [
  {
    id: 'sub_001',
    name: 'KL Main Intake',
    position: [0, 0, 0],
    voltageLevel: '500kV',
    status: 'energized',
    capacity_mva: 1500,
    current_load_mva: 1200,
    customers_served: 150000,
    type: 'main_intake',
  },
  {
    id: 'sub_002',
    name: 'Petaling Jaya Primary',
    position: [-25, 0, -20],
    voltageLevel: '275kV',
    status: 'energized',
    capacity_mva: 800,
    current_load_mva: 650,
    customers_served: 80000,
    type: 'primary_distribution',
  },
  {
    id: 'sub_003',
    name: 'Bangsar Distribution',
    position: [25, 0, -20],
    voltageLevel: '132kV',
    status: 'energized',
    capacity_mva: 500,
    current_load_mva: 380,
    customers_served: 45000,
    type: 'secondary_distribution',
  },
  {
    id: 'sub_004',
    name: 'Subang Jaya Hub',
    position: [-40, 0, -40],
    voltageLevel: '132kV',
    status: 'energized',
    capacity_mva: 400,
    current_load_mva: 320,
    customers_served: 35000,
    type: 'secondary_distribution',
  },
  {
    id: 'sub_005',
    name: 'Mont Kiara Center',
    position: [20, 0, 15],
    voltageLevel: '33kV',
    status: 'energized',
    capacity_mva: 150,
    current_load_mva: 120,
    customers_served: 15000,
    type: 'secondary_distribution',
  },
  {
    id: 'sub_006',
    name: 'Cheras Station',
    position: [40, 0, -40],
    voltageLevel: '33kV',
    status: 'energized',
    capacity_mva: 180,
    current_load_mva: 145,
    customers_served: 18000,
    type: 'secondary_distribution',
  },
  {
    id: 'sub_007',
    name: 'Ampang Substation',
    position: [45, 0, 10],
    voltageLevel: '11kV',
    status: 'maintenance',
    capacity_mva: 80,
    current_load_mva: 0,
    customers_served: 8000,
    type: 'secondary_distribution',
  },
];

export const mockPowerLines: GridPowerLine[] = [
  // 500kV backbone
  {
    id: 'line_001',
    from_substation_id: 'sub_001',
    to_substation_id: 'sub_002',
    voltageLevel: '500kV',
    status: 'energized',
    capacity_mva: 1000,
    current_load_mva: 850,
    line_path: [
      [0, 0, 0],
      [-8, 3, -7],
      [-17, 4, -14],
      [-25, 0, -20],
    ],
  },
  // 275kV distribution
  {
    id: 'line_002',
    from_substation_id: 'sub_002',
    to_substation_id: 'sub_003',
    voltageLevel: '275kV',
    status: 'energized',
    capacity_mva: 600,
    current_load_mva: 480,
    line_path: [
      [-25, 0, -20],
      [-10, 2, -20],
      [10, 2, -20],
      [25, 0, -20],
    ],
  },
  {
    id: 'line_003',
    from_substation_id: 'sub_002',
    to_substation_id: 'sub_004',
    voltageLevel: '132kV',
    status: 'energized',
    capacity_mva: 400,
    current_load_mva: 320,
    line_path: [
      [-25, 0, -20],
      [-30, 2, -28],
      [-40, 0, -40],
    ],
  },
  // 132kV network
  {
    id: 'line_004',
    from_substation_id: 'sub_001',
    to_substation_id: 'sub_003',
    voltageLevel: '132kV',
    status: 'energized',
    capacity_mva: 500,
    current_load_mva: 380,
    line_path: [
      [0, 0, 0],
      [10, 2, -8],
      [20, 2, -15],
      [25, 0, -20],
    ],
  },
  {
    id: 'line_005',
    from_substation_id: 'sub_003',
    to_substation_id: 'sub_006',
    voltageLevel: '132kV',
    status: 'energized',
    capacity_mva: 300,
    current_load_mva: 240,
    line_path: [
      [25, 0, -20],
      [30, 1, -28],
      [40, 0, -40],
    ],
  },
  // 33kV feeders
  {
    id: 'line_006',
    from_substation_id: 'sub_001',
    to_substation_id: 'sub_005',
    voltageLevel: '33kV',
    status: 'energized',
    capacity_mva: 150,
    current_load_mva: 120,
    line_path: [
      [0, 0, 0],
      [8, 1, 5],
      [15, 1, 12],
      [20, 0, 15],
    ],
  },
  {
    id: 'line_007',
    from_substation_id: 'sub_005',
    to_substation_id: 'sub_007',
    voltageLevel: '11kV',
    status: 'de-energized',
    capacity_mva: 80,
    current_load_mva: 0,
    line_path: [
      [20, 0, 15],
      [30, 0, 13],
      [40, 0, 11],
      [45, 0, 10],
    ],
  },
];

export const mockGridZones: GridZone[] = [
  {
    id: 'zone_001',
    name: 'KL City Center',
    customers: 150000,
    peak_load_mw: 320,
    substations: ['sub_001', 'sub_003'],
  },
  {
    id: 'zone_002',
    name: 'Petaling Jaya Area',
    customers: 80000,
    peak_load_mw: 180,
    substations: ['sub_002', 'sub_004'],
  },
  {
    id: 'zone_003',
    name: 'Mont Kiara & Ampang',
    customers: 23000,
    peak_load_mw: 52,
    substations: ['sub_005', 'sub_007'],
  },
  {
    id: 'zone_004',
    name: 'Cheras District',
    customers: 18000,
    peak_load_mw: 42,
    substations: ['sub_006'],
  },
];

export const getVoltageColor = (voltage: string): string => {
  const colors: Record<string, string> = {
    '500kV': '#DC2626', // red-600
    '275kV': '#EA580C', // orange-600
    '132kV': '#EAB308', // yellow-500
    '33kV': '#16A34A', // green-600
    '11kV': '#2563EB', // blue-600
  };
  return colors[voltage] || '#6B7280';
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'energized': '#10B981', // green-500
    'de-energized': '#6B7280', // gray-500
    'maintenance': '#F59E0B', // amber-500
    'fault': '#EF4444', // red-500
  };
  return colors[status] || '#6B7280';
};

export const getLoadPercentageColor = (loadPercent: number): string => {
  if (loadPercent < 60) return '#10B981'; // green-500
  if (loadPercent < 80) return '#F59E0B'; // amber-500
  return '#EF4444'; // red-500
};
