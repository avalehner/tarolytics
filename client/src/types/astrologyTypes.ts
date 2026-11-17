export interface PlanetInterpretationTypes {
  sections: {
    id: string;
    key: string;
    category: string;
    title: string;
    body: string;
    tone: string;
    tags: [string, string];
    created_at: string;
    updated_at: string;
  };
}

export interface PlanetTypes {
  id: string;
  name: string;
  sign: string;
  sign_id: string;
  pos: number;
  abs_pos: number;
  retrograde: boolean;
  house: number;
  dignity: null;
  speed: number;
  is_stationary: false;
  declination_deg: number;
}
