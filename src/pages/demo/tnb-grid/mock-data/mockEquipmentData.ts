/**
 * Mock Equipment Data
 * 
 * Nested equipment data for substation drill-down
 */

export interface SubstationEquipment {
  id: string;
  name: string;
  type: 'transformer' | 'circuit_breaker' | 'switchgear' | 'control_panel' | 'meter_bank';
  position: [number, number, number];
  status: 'operational' | 'maintenance' | 'fault';
  voltage_in?: string;
  voltage_out?: string;
  capacity_mva?: number;
  current_load_mva?: number;
  bay_number?: string;
  children?: SubstationEquipment[];
}

export const klMainIntakeEquipment: SubstationEquipment[] = [
  {
    id: 'eq_001_bay1',
    name: 'Bay 1 - 500/275kV Transformer',
    type: 'transformer',
    position: [-8, 0, -8],
    voltage_in: '500kV',
    voltage_out: '275kV',
    capacity_mva: 400,
    current_load_mva: 340,
    status: 'operational',
    bay_number: '1',
    children: [
      {
        id: 'comp_001_bushings',
        name: 'HV Bushings',
        type: 'circuit_breaker',
        position: [0, 4, 0],
        status: 'operational',
      },
      {
        id: 'comp_001_cooling',
        name: 'Cooling System',
        type: 'circuit_breaker',
        position: [2, 0, 2],
        status: 'operational',
      },
    ],
  },
  {
    id: 'eq_001_bay2',
    name: 'Bay 2 - 500/132kV Transformer',
    type: 'transformer',
    position: [8, 0, -8],
    voltage_in: '500kV',
    voltage_out: '132kV',
    capacity_mva: 300,
    current_load_mva: 250,
    status: 'operational',
    bay_number: '2',
  },
  {
    id: 'eq_001_bay3',
    name: 'Bay 3 - Circuit Breakers',
    type: 'circuit_breaker',
    position: [-8, 0, 8],
    voltage_in: '500kV',
    status: 'operational',
    bay_number: '3',
  },
  {
    id: 'eq_001_switchgear',
    name: '275kV Switchgear',
    type: 'switchgear',
    position: [8, 0, 8],
    voltage_in: '275kV',
    status: 'operational',
  },
  {
    id: 'eq_001_control',
    name: 'Control Room',
    type: 'control_panel',
    position: [0, 0, 12],
    status: 'operational',
  },
  {
    id: 'eq_001_meters',
    name: 'Meter Bank',
    type: 'meter_bank',
    position: [-12, 0, 0],
    status: 'operational',
  },
];

export const petalingJayaEquipment: SubstationEquipment[] = [
  {
    id: 'eq_002_bay1',
    name: 'Bay 1 - 275/132kV Transformer',
    type: 'transformer',
    position: [-6, 0, -6],
    voltage_in: '275kV',
    voltage_out: '132kV',
    capacity_mva: 250,
    current_load_mva: 195,
    status: 'operational',
    bay_number: '1',
  },
  {
    id: 'eq_002_bay2',
    name: 'Bay 2 - 275/33kV Transformer',
    type: 'transformer',
    position: [6, 0, -6],
    voltage_in: '275kV',
    voltage_out: '33kV',
    capacity_mva: 150,
    current_load_mva: 120,
    status: 'operational',
    bay_number: '2',
  },
  {
    id: 'eq_002_breakers',
    name: 'Circuit Breaker Panel',
    type: 'circuit_breaker',
    position: [0, 0, 6],
    voltage_in: '275kV',
    status: 'operational',
  },
  {
    id: 'eq_002_control',
    name: 'Control Room',
    type: 'control_panel',
    position: [0, 0, 10],
    status: 'operational',
  },
];
