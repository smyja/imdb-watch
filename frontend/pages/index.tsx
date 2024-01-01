import { useState } from 'react';
import { FileButton, Button, Group, Box } from '@mantine/core';
import { HeroImageBackground } from '../components/Hero';
import { BadgeCard } from '../components/card';

export default function IndexPage() {
  const [file, setFile] = useState<File | null>(null);
  return (
    <>
    <HeroImageBackground/>
      <Group justify="center" mt={30}>
        <Box w={370}>
               <BadgeCard/>
        </Box>
 
      </Group>


    </>
  );
}