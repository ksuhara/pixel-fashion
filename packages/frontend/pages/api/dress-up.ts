// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { decode } from "node-libpng";

import { buildSVGWithAccessory, PNGCollectionEncoder } from "../../lib";

type Data = {
  svg: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  // const encoder = new PNGCollectionEncoder();
  // const buff = Buffer.from(req.body.file.split(",")[1], "base64");
  // const image = decode(buff);
  // if (image.height != 32 || image.width != 32) {
  //   throw new Error("Must be 32*32 png");
  // }
  // const { rle, hexColors } = encoder.encodeImage("", image);
  // if (hexColors.length > 256) {
  //   throw new Error("Color must be less than 256");
  // }
  const parts = req.body.parts;
  const hexColors = req.body.hexColors;

  const svg = buildSVGWithAccessory(parts, hexColors);
  res.status(200).json({
    svg,
  });
}
