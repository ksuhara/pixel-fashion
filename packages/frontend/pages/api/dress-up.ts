// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { decode } from "node-libpng";

import { buildSVGWithAccessory, PNGCollectionEncoder } from "../../lib";

type Data = {
  svg: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const parts = req.body.parts;
  const hexColors = req.body.hexColors;

  const svg = buildSVGWithAccessory(parts, hexColors);
  res.status(200).json({
    svg,
  });
}
