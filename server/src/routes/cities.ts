import { Router, Request, Response } from "express";

const citiesRouter = Router();

citiesRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { cityName } = req.query;
    const geoDbResponse = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${cityName}&limit=5&no_annotations=1&pretty=0&key=${process.env.GEO_CODING_API_KEY}`,
      {
        method: "GET",
      },
    );

    if (!geoDbResponse.ok)
      throw new Error(
        `Server error [GeoDb - cities.ts]: ${geoDbResponse.status}`,
      );

    const data = await geoDbResponse.json(); //json string to js object

    const cities = data.results.map((result: any) => ({
      formatted: result.formatted,
      lat: result.geometry.lat,
      lng: result.geometry.lng,
    }));

    res.status(200).json(cities); //changes js object back into json string
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    res.status(500).json({ error: message });
  }
});

export default citiesRouter;
