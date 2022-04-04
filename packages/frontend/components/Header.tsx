import { Box, Image, Stack, Text } from "@chakra-ui/react";
import Head from "next/head";
import * as React from "react";

import { SocialMediaLinks } from "./SocialMediaLinks";

export const Header = () => (
  <>
    <Head>
      <title>Pixel Onchained</title>
    </Head>
    <Box role="contentinfo" mx="auto" maxW="7xl" py="4" px={{ base: "4", md: "8" }}>
      <Stack>
        <Stack direction="row" spacing="4" align="center" justify="space-between">
          <Image src="logo.png"></Image>
          <SocialMediaLinks />
        </Stack>
        <Text fontSize="sm" alignSelf={{ base: "center", sm: "start" }}>
          Open Source and DYOR
        </Text>
      </Stack>
    </Box>
  </>
);
