export interface CarType {
  id: string
  name: string
}

export interface CarBrand {
  id: string
  name: string
  types: CarType[]
}

export const mockCarCategories: CarBrand[] = [
  {
    id: 'toyota',
    name: 'Toyota',
    types: [
      { id: 'camry', name: 'Camry' },
      { id: 'vios', name: 'Vios' },
      { id: 'corolla', name: 'Corolla' },
      { id: 'fortuner', name: 'Fortuner' },
      { id: 'innova', name: 'Innova' },
    ],
  },
  {
    id: 'honda',
    name: 'Honda',
    types: [
      { id: 'crv', name: 'CR-V' },
      { id: 'civic', name: 'Civic' },
      { id: 'city', name: 'City' },
      { id: 'accord', name: 'Accord' },
      { id: 'hrv', name: 'HR-V' },
    ],
  },
  {
    id: 'vinfast',
    name: 'VinFast',
    types: [
      { id: 'vf8', name: 'VF 8' },
      { id: 'vf9', name: 'VF 9' },
      { id: 'vf5', name: 'VF 5' },
    ],
  },
  {
    id: 'mercedes',
    name: 'Mercedes-Benz',
    types: [
      { id: 'eclass', name: 'E-Class' },
      { id: 'cclass', name: 'C-Class' },
      { id: 'sclass', name: 'S-Class' },
      { id: 'glc', name: 'GLC' },
    ],
  },
  {
    id: 'kia',
    name: 'Kia',
    types: [
      { id: 'carival', name: 'Carival' },
      { id: 'seltos', name: 'Seltos' },
      { id: 'sportage', name: 'Sportage' },
      { id: 'k3', name: 'K3' },
    ],
  },
  {
    id: 'mazda',
    name: 'Mazda',
    types: [
      { id: 'mazda3', name: 'Mazda 3' },
      { id: 'mazda6', name: 'Mazda 6' },
      { id: 'cx5', name: 'CX-5' },
      { id: 'cx8', name: 'CX-8' },
    ],
  },
  {
    id: 'ford',
    name: 'Ford',
    types: [
      { id: 'ranger', name: 'Ranger' },
      { id: 'everest', name: 'Everest' },
      { id: 'territory', name: 'Territory' },
    ],
  },
  {
    id: 'hyundai',
    name: 'Hyundai',
    types: [
      { id: 'tucson', name: 'Tucson' },
      { id: 'santa-fe', name: 'Santa Fe' },
      { id: 'elantra', name: 'Elantra' },
    ],
  },
]
