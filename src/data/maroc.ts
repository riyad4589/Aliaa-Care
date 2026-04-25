export interface City {
  name: string;
  regionId: string;
  shippingFeeOverride?: number;
}

export interface Region {
  id: string;
  name: string;
  baseShippingFee: number;
}

export const regions: Region[] = [
  { id: "rsk", name: "Rabat-Salé-Kénitra", baseShippingFee: 25 },
  { id: "cs", name: "Casablanca-Settat", baseShippingFee: 35 },
  { id: "fm", name: "Fès-Meknès", baseShippingFee: 35 },
  { id: "tth", name: "Tanger-Tétouan-Al Hoceïma", baseShippingFee: 45 },
  { id: "oriental", name: "Oriental", baseShippingFee: 45 },
  { id: "bmk", name: "Béni Mellal-Khénifra", baseShippingFee: 45 },
  { id: "ms", name: "Marrakech-Safi", baseShippingFee: 45 },
  { id: "sm", name: "Souss-Massa", baseShippingFee: 60 },
  { id: "dt", name: "Drâa-Tafilalet", baseShippingFee: 60 },
  { id: "gln", name: "Guelmim-Oued Noun", baseShippingFee: 60 },
  { id: "ls", name: "Laâyoune-Sakia El Hamra", baseShippingFee: 60 },
  { id: "do", name: "Dakhla-Oued Ed-Dahab", baseShippingFee: 60 },
];

export const cities: City[] = [
  // Rabat-Salé-Kénitra (25 DH)
  { name: "Rabat", regionId: "rsk" },
  { name: "Salé", regionId: "rsk" },
  { name: "Témara", regionId: "rsk" },
  { name: "Kénitra", regionId: "rsk" },
  
  // Casablanca-Settat (35 DH)
  { name: "Casablanca", regionId: "cs" },
  { name: "Mohammedia", regionId: "cs" },
  { name: "Berrechid", regionId: "cs" },
  { name: "Settat", regionId: "cs" },
  { name: "Médiouna", regionId: "cs" },
  { name: "El Jadida", regionId: "cs" },
  { name: "Oualidia", regionId: "cs" },

  // Fès-Meknès (35 DH / 45 DH)
  { name: "Meknès", regionId: "fm" },
  { name: "Fès", regionId: "fm" },
  { name: "Ifrane", regionId: "fm" },
  { name: "Azrou", regionId: "fm" },
  { name: "Taza", regionId: "fm", shippingFeeOverride: 45 },

  // Tanger-Tétouan-Al Hoceïma (45 DH)
  { name: "Tanger", regionId: "tth" },
  { name: "Tétouan", regionId: "tth" },
  { name: "Larache", regionId: "tth" },
  { name: "Chefchaouen", regionId: "tth" },
  { name: "Al Hoceïma", regionId: "tth" },

  // Oriental (45 DH)
  { name: "Oujda", regionId: "oriental" },
  { name: "Nador", regionId: "oriental" },

  // Béni Mellal-Khénifra (45 DH)
  { name: "Béni Mellal", regionId: "bmk" },
  { name: "Khouribga", regionId: "bmk" },
  { name: "Khénifra", regionId: "bmk" },

  // Marrakech-Safi (45 DH)
  { name: "Marrakech", regionId: "ms" },
  { name: "Safi", regionId: "ms" },
  { name: "Essaouira", regionId: "ms" },

  // Souss-Massa (60 DH)
  { name: "Agadir", regionId: "sm" },
  { name: "Tiznit", regionId: "sm" },
  { name: "Taroudant", regionId: "sm" },

  // Drâa-Tafilalet (60 DH)
  { name: "Errachidia", regionId: "dt" },
  { name: "Ouarzazate", regionId: "dt" },
  { name: "Zagora", regionId: "dt" },
  { name: "Midelt", regionId: "dt" },

  // Sud (60 DH)
  { name: "Guelmim", regionId: "gln" },
  { name: "Tan-Tan", regionId: "gln" },
  { name: "Laâyoune", regionId: "ls" },
  { name: "Dakhla", regionId: "do" },
];
