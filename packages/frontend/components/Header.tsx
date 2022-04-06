import { Box, Image, Link, Stack, Text } from "@chakra-ui/react";
import Head from "next/head";
import * as React from "react";

import { SocialMediaLinks } from "./SocialMediaLinks";

export const Header = () => (
  <>
    <Head>
      <title>Pixel Fashion</title>
    </Head>
    <Box role="contentinfo" mx="auto" maxW="8xl" py="4" px={{ base: "4", md: "8" }}>
      <Stack>
        <Stack direction="row" spacing="4" align="center" justify="space-between">
          <Link href="/">
            <Image src="logo.svg" w="12" alt="logo"></Image>
          </Link>
          <SocialMediaLinks />
        </Stack>
      </Stack>
    </Box>
  </>
);
