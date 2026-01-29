import ecoA from "@/data/eco/ecoA.json";
import ecoB from "@/data/eco/ecoB.json";
import ecoC from "@/data/eco/ecoC.json";
import ecoD from "@/data/eco/ecoD.json";
import ecoE from "@/data/eco/ecoE.json";
import ecoInterpolated from "@/data/eco/eco_interpolated.json"

export const openings = {
    ...ecoA,
    ...ecoB,
    ...ecoC,
    ...ecoD,
    ...ecoE,
    ...ecoInterpolated,
};