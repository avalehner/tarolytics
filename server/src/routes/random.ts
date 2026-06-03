import { Router, Request, Response } from "express";

//create router instance
const randomRouter = Router();

randomRouter.get("/:isReversals", async (req: Request, res: Response) => {
  try {
    const { isReversals } = req.params;
    const isReversalsBoolean = req.params.isReversals === "true";
    let maxNumber = 78;
    if (isReversalsBoolean) maxNumber = 156;
    console.log("maxNumber", maxNumber);
    //format=plain means plain text
    const randomResponse = await fetch(
      `https://www.random.org/sequences/?min=1&max=${maxNumber}&col=1&format=plain&rnd=new`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!randomResponse.ok) {
      throw new Error(
        `Server error [getRandomSequence - randomService.ts]: ${randomResponse.status}`,
      );
    }

    const randomText = await randomResponse.text();

    // console.log("random-text", randomText);

    //.trim() removes any leading/trailing whitespace
    //numbers are returned with '\n' as a splitter
    //.split() creates an array
    //.map() iterates over every element and applies a transformation function
    //.map(Number) is shorthand for .map((str) => Number(str))
    const randomNumbers = randomText.trim().split("\n").map(Number);
    res.status(200).json(randomNumbers);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default randomRouter;
